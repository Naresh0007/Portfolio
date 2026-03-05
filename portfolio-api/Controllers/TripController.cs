using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TripController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string _tfnswBaseUrl = "https://api.transport.nsw.gov.au/v1/tp";

    public TripController(IConfiguration configuration)
    {
        _configuration = configuration;
        _httpClient = new HttpClient();
    }

    [HttpGet]
    public async Task<IActionResult> GetTrips([FromQuery] TripRequest request)
    {
        var apiKey = _configuration["Tfnsw:ApiKey"]; 
        
        if (string.IsNullOrEmpty(apiKey))
        {
            return StatusCode(500, new { error = "TfNSW API Key not configured" });
        }

        try
        {
            // Resolve names to IDs for better reliability
            var originId = await ResolveLocationId(request.Origin ?? "", apiKey);
            var destinationId = await ResolveLocationId(request.Destination ?? "", apiKey);

            var queryParams = new Dictionary<string, string>
            {
                { "outputFormat", "rapidJSON" },
                { "coordOutputFormat", "EPSG:4326" },

                { "type_origin", "stop" },
                { "name_origin", originId ?? "" },

                { "type_destination", "stop" },
                { "name_destination", destinationId ?? "" },

                { "itdDate", string.IsNullOrEmpty(request.Date) 
                    ? DateTime.Now.ToString("yyyyMMdd") 
                    : request.Date.Replace("-", "") },

                { "itdTime", string.IsNullOrEmpty(request.Time) 
                    ? DateTime.Now.ToString("HHmm") 
                    : request.Time.Replace(":", "") },

                { "itdTimeType", request.Mode == "arrival" ? "arrive" : "depart" },

                { "calcNumberOfTrips", (request.CalcNumberOfTrips ?? 5).ToString() }
            };

            var uriBuilder = new UriBuilder($"{_tfnswBaseUrl}/trip");
            var query = System.Web.HttpUtility.ParseQueryString(uriBuilder.Query);
            foreach (var param in queryParams)
            {
                query[param.Key] = param.Value;
            }
            uriBuilder.Query = query.ToString();
            
            Console.WriteLine("DEBUG REQUEST URI:");
            Console.WriteLine(uriBuilder.Uri.ToString());

            var httpRequest = new HttpRequestMessage(HttpMethod.Get, uriBuilder.Uri);
            httpRequest.Headers.Add("Authorization", $"apikey {apiKey}");
            httpRequest.Headers.Add("Accept", "application/json");

            var response = await _httpClient.SendAsync(httpRequest);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new { error = "TfNSW API returned an error", details = errorContent });
            }

            var content = await response.Content.ReadAsStringAsync();
            
            // Temporary logging for debugging as requested
            Console.WriteLine("DEBUG RAW JSON:");
            Console.WriteLine(content);

            var jsonDoc = JsonDocument.Parse(content);
            
            // Transform the response for the frontend
            var trips = TransformTrips(jsonDoc);
            
            return Ok(trips);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal Server Error", message = ex.Message });
        }
    }

    [HttpGet("stops")]
    public async Task<IActionResult> GetStops([FromQuery] string name)
    {
        var apiKey = _configuration["Tfnsw:ApiKey"];
        
        if (string.IsNullOrEmpty(apiKey))
        {
            return StatusCode(500, new { error = "TfNSW API Key not configured" });
        }

        if (string.IsNullOrEmpty(name))
        {
            return Ok(new List<object>());
        }

        try
        {
            // CRITICAL: type_sf=stop returns empty results from TfNSW API.
            // Use type_sf=any and filter by type=="stop" in the response.
            var url = $"{_tfnswBaseUrl}/stop_finder?outputFormat=rapidJSON&type_sf=any&name_sf={Uri.EscapeDataString(name)}&anyMaxSizeHitList=10";
            
            var httpRequest = new HttpRequestMessage(HttpMethod.Get, url);
            httpRequest.Headers.Add("Authorization", $"apikey {apiKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { error = "TfNSW API returned an error" });
            }

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            
            var stops = new List<object>();

            if (doc.RootElement.TryGetProperty("locations", out var locations) && locations.ValueKind == JsonValueKind.Array)
            {
                foreach (var loc in locations.EnumerateArray())
                {
                    var type = loc.TryGetProperty("type", out var t) ? t.GetString() : null;
                    if (type != "stop") continue;

                    // Use properties.stopId (numeric) — NOT id (which is a Global ID like "214240")
                    if (loc.TryGetProperty("properties", out var props) &&
                        props.TryGetProperty("stopId", out var stopIdProp) &&
                        loc.TryGetProperty("name", out var stopName))
                    {
                        stops.Add(new {
                            id = stopIdProp.GetString(),
                            name = stopName.GetString()
                        });
                    }
                }
            }

            return Ok(stops);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Internal Server Error", message = ex.Message });
        }
    }

    private object TransformTrips(JsonDocument doc)
    {
        // rapidJSON format uses "journeys" (not "trips" which is the json format key)
        var tripsElement = default(JsonElement);
        if (!doc.RootElement.TryGetProperty("journeys", out tripsElement) &&
            !doc.RootElement.TryGetProperty("trips", out tripsElement))
        {
            Console.WriteLine("DEBUG: No 'journeys' or 'trips' key found in response");
            return new List<object>();
        }
        if (tripsElement.ValueKind != JsonValueKind.Array)
        {
            return new List<object>();
        }

        var results = new List<object>();
        int index = 0;

        foreach (var trip in tripsElement.EnumerateArray())
        {
            var legs = new List<object>();
            if (!trip.TryGetProperty("legs", out var legsElement) || legsElement.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var leg in legsElement.EnumerateArray())
            {
                if (!leg.TryGetProperty("transportation", out var transportation) || 
                    !leg.TryGetProperty("origin", out var origin) || 
                    !leg.TryGetProperty("destination", out var destination))
                {
                    continue;
                }
                
                var startTime = origin.TryGetProperty("departureTimeEstimated", out var estDep) ? estDep.GetString() : 
                                (origin.TryGetProperty("departureTimePlanned", out var planDep) ? planDep.GetString() : null);
                
                var endTime = destination.TryGetProperty("arrivalTimeEstimated", out var estArr) ? estArr.GetString() : 
                              (destination.TryGetProperty("arrivalTimePlanned", out var planArr) ? planArr.GetString() : null);

                if (startTime == null || endTime == null) continue;

                var intermediateStops = new List<object>();
                if (leg.TryGetProperty("stopSequence", out var stops) && stops.ValueKind == JsonValueKind.Array)
                {
                    foreach (var stop in stops.EnumerateArray())
                    {
                        var stopName = stop.TryGetProperty("name", out var sName) ? sName.GetString() : "Unknown";
                        var stopTime = stop.TryGetProperty("departureTimeEstimated", out var stopEstDep) ? stopEstDep.GetString() :
                                       (stop.TryGetProperty("arrivalTimeEstimated", out var stopEstArr) ? stopEstArr.GetString() :
                                       (stop.TryGetProperty("departureTimePlanned", out var stopPlanDep) ? stopPlanDep.GetString() : 
                                       (stop.TryGetProperty("arrivalTimePlanned", out var stopPlanArr) ? stopPlanArr.GetString() : null)));

                        intermediateStops.Add(new {
                            name = stopName,
                            time = stopTime
                        });
                    }
                }

                int productClass = 0;
                if (transportation.TryGetProperty("product", out var product) && product.TryGetProperty("class", out var pClass))
                {
                    productClass = pClass.GetInt32();
                }

                var modeName = "Unknown";
                if (transportation.TryGetProperty("product", out var prod) && prod.TryGetProperty("name", out var pName))
                {
                    modeName = pName.GetString() ?? "Unknown";
                }

                // In rapidJSON, some fields are nested or differently named
                // TfNSW sometimes uses 'name' directly on transportation
                var lineName = transportation.TryGetProperty("disassembledName", out var dName) ? dName.GetString() : 
                              (transportation.TryGetProperty("name", out var name) ? name.GetString() : "");

                legs.Add(new
                {
                    mode = productClass == 99 ? "Walk" : modeName,
                    line = lineName,
                    origin = origin.TryGetProperty("name", out var oName) ? oName.GetString() : "Unknown",
                    destination = destination.TryGetProperty("name", out var destName) ? destName.GetString() : "Unknown",
                    departureTime = startTime,
                    arrivalTime = endTime,
                    duration = Math.Round((DateTime.Parse(endTime) - DateTime.Parse(startTime)).TotalMinutes),
                    stops = intermediateStops
                });
            }

            if (legs.Count > 0)
            {
                // Dynamic access to properties since we're using anonymous types
                var firstLeg = (dynamic)legs.First();
                var lastLeg = (dynamic)legs.Last();
                
                string departureTimeStr = firstLeg.departureTime;
                string arrivalTimeStr = lastLeg.arrivalTime;

                if (departureTimeStr != null && arrivalTimeStr != null)
                {
                    results.Add(new
                    {
                        id = $"trip-{index++}",
                        totalDuration = Math.Round((DateTime.Parse(arrivalTimeStr) - DateTime.Parse(departureTimeStr)).TotalMinutes),
                        departureTime = departureTimeStr,
                        arrivalTime = arrivalTimeStr,
                        transfers = legs.Count(l => (string)((dynamic)l).mode != "Walk") - 1,
                        legs = legs
                    });
                }
            }
        }

        return results;
    }



    private async Task<string?> ResolveLocationId(string name, string apiKey)
    {
        if (string.IsNullOrEmpty(name)) return null;
        
        // If it already looks like a numeric stop ID, return it directly
        if (long.TryParse(name, out _)) return name;

        try 
        {
            // IMPORTANT: type_sf=any is required — type_sf=stop returns empty results.
            // We filter by type == "stop" in the response instead.
            var url = $"{_tfnswBaseUrl}/stop_finder?outputFormat=rapidJSON&type_sf=any&name_sf={Uri.EscapeDataString(name)}&anyMaxSizeHitList=10";
            
            var httpRequest = new HttpRequestMessage(HttpMethod.Get, url);
            httpRequest.Headers.Add("Authorization", $"apikey {apiKey}");

            var response = await _httpClient.SendAsync(httpRequest);
            if (!response.IsSuccessStatusCode) return name;

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            
            if (doc.RootElement.TryGetProperty("locations", out var locations) && locations.ValueKind == JsonValueKind.Array)
            {
                foreach (var loc in locations.EnumerateArray())
                {
                    var type = loc.TryGetProperty("type", out var t) ? t.GetString() : null;
                    if (type != "stop") continue;

                    // CRITICAL: Use properties.stopId (numeric), NOT id (which is a GlobalId like "214240")
                    if (loc.TryGetProperty("properties", out var props) &&
                        props.TryGetProperty("stopId", out var stopIdProp))
                    {
                        var resolvedId = stopIdProp.GetString();
                        Console.WriteLine($"DEBUG: Resolved '{name}' → stopId: {resolvedId}");
                        return resolvedId;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DEBUG: ID Resolution failed for '{name}': {ex.Message}");
        }

        return name;
    }
    
    public class TripRequest
    {
        public string? Origin { get; set; }
        public string? Destination { get; set; }
        public string? Date { get; set; }
        public string? Time { get; set; }
        public string? Mode { get; set; }
        public int? CalcNumberOfTrips { get; set; }
    }
}

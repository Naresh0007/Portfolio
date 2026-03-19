using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using Microsoft.AspNetCore.DataProtection;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/linkedin")]
public class LinkedInController : ControllerBase
{
    private readonly PortfolioDbContext _db;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IDataProtector _protector;
    private readonly ILogger<LinkedInController> _logger;

    public LinkedInController(
        PortfolioDbContext db, 
        IConfiguration config, 
        IHttpClientFactory httpClientFactory,
        IDataProtectionProvider dataProtectionProvider,
        ILogger<LinkedInController> logger)
    {
        _db = db;
        _config = config;
        _httpClientFactory = httpClientFactory;
        _protector = dataProtectionProvider.CreateProtector("LinkedIn.AccessToken.v1");
        _logger = logger;
    }

    [HttpGet("connect")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public IActionResult Connect()
    {
        var clientId = _config["LinkedIn:ClientId"];
        var redirectUri = _config["LinkedIn:RedirectUri"] ?? "http://localhost:5174/api/linkedin/callback";
        var userId = User.FindFirstValue("linkedin_uid");

        if (string.IsNullOrEmpty(clientId) || clientId == "YOUR_LINKEDIN_CLIENT_ID")
        {
            return BadRequest(new { error = "LinkedIn Client ID not configured." });
        }

        // State avoids CSRF and carries local userId
        var state = Guid.NewGuid().ToString("N") + "|" + userId;
        var scope = "openid profile email";
        var authUrl = $"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={clientId}&redirect_uri={redirectUri}&state={state}&scope={scope}";

        return Ok(new { url = authUrl });
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(string code, string state)
    {
        var clientId = _config["LinkedIn:ClientId"];
        var clientSecret = _config["LinkedIn:ClientSecret"];
        var redirectUri = _config["LinkedIn:RedirectUri"] ?? "http://localhost:5174/api/linkedin/callback";

        if (string.IsNullOrEmpty(code)) return BadRequest("Missing code");

        // Parse state to get userId
        var userIdPart = state.Split('|').LastOrDefault();
        if (!int.TryParse(userIdPart, out int userId)) return BadRequest("Invalid state");

        var client = _httpClientFactory.CreateClient();
        
        // 1. Exchange code for access token
        var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://www.linkedin.com/oauth/v2/accessToken");
        tokenRequest.Content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["client_id"] = clientId!,
            ["client_secret"] = clientSecret!,
            ["redirect_uri"] = redirectUri
        });

        var response = await client.SendAsync(tokenRequest);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("LinkedIn Token Exchange failed: {Error}", error);
            return BadRequest("Failed to exchange token with LinkedIn.");
        }

        var tokenData = await JsonSerializer.DeserializeAsync<LinkedInTokenResponse>(await response.Content.ReadAsStreamAsync());
        if (tokenData == null || string.IsNullOrEmpty(tokenData.access_token))
            return BadRequest("Invalid token response from LinkedIn");

        // 2. Fetch User Profile (UserInfo)
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenData.access_token);
        var profileResponse = await client.GetAsync("https://api.linkedin.com/v2/userinfo");
        
        string name = "LinkedIn User";
        string? profilePicture = null;
        string? liId = null;
        string? email = null;

        if (profileResponse.IsSuccessStatusCode)
        {
            var json = await profileResponse.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            liId = doc.RootElement.GetProperty("sub").GetString();
            name = doc.RootElement.GetProperty("name").GetString() ?? name;
            email = doc.RootElement.GetProperty("email").GetString();
            if (doc.RootElement.TryGetProperty("picture", out var pic))
                profilePicture = pic.GetString();
        }

        // 3. Fetch Email via v2 endpoint (as requested specifically)
        try 
        {
            var emailResponse = await client.GetAsync("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))");
            if (emailResponse.IsSuccessStatusCode)
            {
                var emailJson = await emailResponse.Content.ReadAsStringAsync();
                // Parse old v2 email format if needed, but userinfo usually is enough
                _logger.LogInformation("Email fetched via v2: {Json}", emailJson);
            }
        }
        catch (Exception ex) { _logger.LogWarning("Optional email fetch failed: {Msg}", ex.Message); }

        // 4. Encrypt token and store in LinkedInAccounts
        var encryptedToken = _protector.Protect(tokenData.access_token);
        
        var account = await _db.LinkedInAccounts.FirstOrDefaultAsync(a => a.UserId == userId);
        if (account == null)
        {
            account = new LinkedInAccount { UserId = userId };
            _db.LinkedInAccounts.Add(account);
        }

        account.AccessToken = encryptedToken;
        account.ExpiresAt = DateTime.UtcNow.AddSeconds(tokenData.expires_in);
        account.LinkedInId = liId ?? "unknown";
        account.Name = name;
        account.Email = email;
        account.ProfilePicture = profilePicture;
        account.ConnectedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Redirect back to frontend
        return Redirect("http://localhost:5173/linkedin-ai/schedule?connected=true");
    }

    [HttpGet("profile")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> GetProfile()
    {
        var userIdStr = User.FindFirstValue("linkedin_uid");
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var account = await _db.LinkedInAccounts
            .OrderByDescending(a => a.ConnectedAt)
            .FirstOrDefaultAsync(a => a.UserId == userId);

        if (account == null) return NotFound(new { error = "No LinkedIn account connected." });

        // Check if data is expired (24-hour limit)
        if (DateTime.UtcNow - account.ConnectedAt > TimeSpan.FromHours(24))
        {
            _db.LinkedInAccounts.Remove(account);
            await _db.SaveChangesAsync();
            return NotFound(new { error = "Session expired (24h limit reached)." });
        }

        return Ok(new
        {
            account.LinkedInId,
            account.Name,
            account.Headline,
            account.Email,
            account.ProfilePicture,
            connectedAt = account.ConnectedAt,
            expiresInHours = (24 - (DateTime.UtcNow - account.ConnectedAt).TotalHours)
        });
    }

    [HttpPost("disconnect")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Disconnect()
    {
        var userIdStr = User.FindFirstValue("linkedin_uid");
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var accounts = await _db.LinkedInAccounts.Where(a => a.UserId == userId).ToListAsync();
        if (accounts.Any())
        {
            _db.LinkedInAccounts.RemoveRange(accounts);
            await _db.SaveChangesAsync();
        }

        return Ok(new { message = "Disconnected successfully" });
    }
}

public class LinkedInTokenResponse
{
    [System.Text.Json.Serialization.JsonPropertyName("access_token")]
    public string access_token { get; set; } = string.Empty;
    
    [System.Text.Json.Serialization.JsonPropertyName("expires_in")]
    public int expires_in { get; set; }
}

using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;

namespace PortfolioApi.Services;

public class LinkedInShareService : ILinkedInShareService
{
    private readonly PortfolioDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IDataProtector _protector;
    private readonly ILogger<LinkedInShareService> _logger;

    public LinkedInShareService(
        PortfolioDbContext db, 
        IHttpClientFactory httpClientFactory,
        IDataProtectionProvider dataProtectionProvider,
        ILogger<LinkedInShareService> logger)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _protector = dataProtectionProvider.CreateProtector("LinkedIn.AccessToken.v1");
        _logger = logger;
    }

    public async Task<string?> SharePostAsync(int userId, string content)
    {
        var account = await _db.LinkedInAccounts
            .OrderByDescending(a => a.ConnectedAt)
            .FirstOrDefaultAsync(a => a.UserId == userId);

        if (account == null || string.IsNullOrEmpty(account.AccessToken))
        {
            _logger.LogWarning("User {UserId} has no connected LinkedIn account.", userId);
            return null;
        }

        // Decrypt token
        string accessToken;
        try {
            accessToken = _protector.Unprotect(account.AccessToken);
        } catch {
            _logger.LogError("Failed to decrypt access token for user {UserId}", userId);
            return null;
        }

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        client.DefaultRequestHeaders.Add("LinkedIn-Version", "202602");
        client.DefaultRequestHeaders.Add("X-Restli-Protocol-Version", "2.0.0");

        var requestBody = new
        {
            author = $"urn:li:person:{account.LinkedInId}",
            commentary = content,
            visibility = "PUBLIC",
            distribution = new
            {
                feedDistribution = "MAIN_FEED",
                targetEntities = new object[] { },
                thirdPartyDistributionChannels = new object[] { }
            },
            lifecycleState = "PUBLISHED",
            isReshareDisabledByAuthor = false
        };

        var response = await client.PostAsJsonAsync("https://api.linkedin.com/rest/posts", requestBody);
        
        if (response.IsSuccessStatusCode)
        {
            if (response.Headers.TryGetValues("x-restli-id", out var values))
            {
                return values.FirstOrDefault();
            }
            return "published_successfully";
        }

        var error = await response.Content.ReadAsStringAsync();
        _logger.LogError("LinkedIn Share failed for user {UserId}. Status: {Status}. Error: {Error}", userId, response.StatusCode, error);
        return null;
    }
}

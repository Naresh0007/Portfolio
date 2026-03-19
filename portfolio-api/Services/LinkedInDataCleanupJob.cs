using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;

namespace PortfolioApi.Services;

public class LinkedInDataCleanupJob
{
    private readonly PortfolioDbContext _db;
    private readonly ILogger<LinkedInDataCleanupJob> _logger;

    public LinkedInDataCleanupJob(PortfolioDbContext db, ILogger<LinkedInDataCleanupJob> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task CleanupExpiredAccountsAsync()
    {
        _logger.LogInformation("Starting LinkedIn data cleanup job...");
        
        var cutoff = DateTime.UtcNow.AddHours(-24);
        var expiredAccounts = await _db.LinkedInAccounts
            .Where(a => a.ConnectedAt < cutoff)
            .ToListAsync();

        if (expiredAccounts.Any())
        {
            _logger.LogInformation("Found {Count} expired LinkedIn accounts. Removing...", expiredAccounts.Count);
            _db.LinkedInAccounts.RemoveRange(expiredAccounts);
            await _db.SaveChangesAsync();
        }
        else
        {
            _logger.LogInformation("No expired LinkedIn accounts found.");
        }
    }
}

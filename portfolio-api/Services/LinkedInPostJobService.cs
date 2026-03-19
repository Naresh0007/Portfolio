using PortfolioApi.Data;
using PortfolioApi.Models;
using Microsoft.EntityFrameworkCore;

namespace PortfolioApi.Services;

public class LinkedInPostJobService : ILinkedInPostJobService
{
    private readonly PortfolioDbContext _db;
    private readonly IOpenAiService _openAi;
    private readonly ILinkedInShareService _shareSvc;
    private readonly ILogger<LinkedInPostJobService> _logger;

    public LinkedInPostJobService(
        PortfolioDbContext db, 
        IOpenAiService openAi, 
        ILinkedInShareService shareSvc,
        ILogger<LinkedInPostJobService> logger)
    {
        _db = db;
        _openAi = openAi;
        _shareSvc = shareSvc;
        _logger = logger;
    }

    public async Task GenerateScheduledPostsAsync()
    {
        var activeSchedules = await _db.LinkedInSchedules
            .Where(s => s.IsActive)
            .ToListAsync();

        foreach (var schedule in activeSchedules)
        {
            try
            {
                var content = await _openAi.GenerateLinkedInPostAsync(schedule.Topic, schedule.Tone);

                var post = new LinkedInPost
                {
                    UserId = schedule.UserId,
                    Topic = schedule.Topic,
                    Content = content,
                    Status = LinkedInPostStatus.Draft,
                    CreatedAt = DateTime.UtcNow
                };

                // Auto-Publish Logic
                if (schedule.AutoPublish)
                {
                    try 
                    {
                        var externalId = await _shareSvc.SharePostAsync(schedule.UserId, content);
                        if (!string.IsNullOrEmpty(externalId))
                        {
                            post.Status = LinkedInPostStatus.Posted;
                            post.ExternalPostId = externalId;
                            _logger.LogInformation("Auto-published post for user {UserId}", schedule.UserId);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Auto-publish failed for schedule {ScheduleId}", schedule.Id);
                    }
                }

                _db.LinkedInPosts.Add(post);

                var notification = new LinkedInNotification
                {
                    UserId = schedule.UserId,
                    Message = schedule.AutoPublish && post.Status == LinkedInPostStatus.Posted
                        ? $"Your LinkedIn post about \"{schedule.Topic}\" was automatically published!"
                        : $"Your LinkedIn post about \"{schedule.Topic}\" is ready to review and publish!",
                    CreatedAt = DateTime.UtcNow
                };
                _db.LinkedInNotifications.Add(notification);

                await _db.SaveChangesAsync();
                _logger.LogInformation("Processed scheduled post for user {UserId}", schedule.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process post for schedule {ScheduleId}", schedule.Id);
            }
        }
    }
}

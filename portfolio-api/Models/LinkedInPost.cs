namespace PortfolioApi.Models;

public enum LinkedInPostStatus
{
    Draft,
    Scheduled,
    Posted
}

public class LinkedInPost
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public LinkedInUser User { get; set; } = null!;
    public string Topic { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public LinkedInPostStatus Status { get; set; } = LinkedInPostStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ScheduledFor { get; set; }
    public string? ExternalPostId { get; set; }
}

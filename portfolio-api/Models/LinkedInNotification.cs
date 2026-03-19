namespace PortfolioApi.Models;

public class LinkedInNotification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public LinkedInUser User { get; set; } = null!;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

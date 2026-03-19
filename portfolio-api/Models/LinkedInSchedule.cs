namespace PortfolioApi.Models;

public class LinkedInSchedule
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public LinkedInUser User { get; set; } = null!;
    public string Topic { get; set; } = string.Empty;
    public string Tone { get; set; } = "Professional";
    public string Frequency { get; set; } = "Daily"; // Daily, Weekly, Custom
    public int? CustomPerWeek { get; set; }
    public bool IsActive { get; set; } = true;
    public bool AutoPublish { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

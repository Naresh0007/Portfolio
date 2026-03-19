namespace PortfolioApi.Models;

public class LinkedInUser
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // LinkedIn Connection
    public bool IsConnected { get; set; } = false;
    public string? LinkedInAccessToken { get; set; }
    public string? LinkedInProfileId { get; set; }
    public string? LinkedInProfileName { get; set; }
    public string? LinkedInProfilePicture { get; set; }
}

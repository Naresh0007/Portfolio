using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PortfolioApi.Models;

public class LinkedInAccount
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public string AccessToken { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    [Required]
    public string LinkedInId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string? Headline { get; set; }
    public string? Email { get; set; }
    public string? ProfilePicture { get; set; }

    public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public LinkedInUser? User { get; set; }
}

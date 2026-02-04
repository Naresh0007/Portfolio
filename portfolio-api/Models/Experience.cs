namespace PortfolioApi.Models;

public class Experience
{
    public int Id { get; set; }
    public required string Company { get; set; }
    public required string Role { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public required string Location { get; set; }
    public required string Description { get; set; }
    public List<string> Responsibilities { get; set; } = new();
    public List<string> Technologies { get; set; } = new();
    public bool IsCurrentRole { get; set; }
}

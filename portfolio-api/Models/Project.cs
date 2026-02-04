namespace PortfolioApi.Models;

public class Project
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public List<string> Technologies { get; set; } = new();
    public string? GithubUrl { get; set; }
    public string? LiveUrl { get; set; }
    public string? ImageUrl { get; set; }
    public required string Category { get; set; }
    public bool Featured { get; set; }
    public DateTime CreatedDate { get; set; }
}

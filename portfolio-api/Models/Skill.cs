namespace PortfolioApi.Models;

public class Skill
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public int ProficiencyLevel { get; set; } // 0-100
    public decimal YearsOfExperience { get; set; }
    public string? Icon { get; set; }
}

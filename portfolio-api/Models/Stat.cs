namespace PortfolioApi.Models;

public class Stat
{
    public int Id { get; set; }
    public required string MetricName { get; set; }
    public required string MetricValue { get; set; }
    public DateTime LastUpdated { get; set; }
}

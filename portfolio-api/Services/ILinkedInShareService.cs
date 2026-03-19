namespace PortfolioApi.Services;

public interface ILinkedInShareService
{
    Task<string?> SharePostAsync(int userId, string content);
}

namespace PortfolioApi.Services;

public interface IOpenAiService
{
    Task<string> GenerateLinkedInPostAsync(string topic, string tone);
}

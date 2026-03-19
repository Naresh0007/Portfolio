using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

namespace PortfolioApi.Services;

public class OpenAiService : IOpenAiService
{
    private readonly IConfiguration _config;
    private readonly ILogger<OpenAiService> _logger;

    public OpenAiService(IConfiguration config, ILogger<OpenAiService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<string> GenerateLinkedInPostAsync(string topic, string tone)
    {
        var apiKey = _config["Groq:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Groq API key is not configured. Please set Groq:ApiKey in appsettings.json.");

        // Groq is OpenAI-compatible, so we can use the OpenAI SDK with a custom endpoint
        var clientOptions = new OpenAIClientOptions { Endpoint = new Uri("https://api.groq.com/openai/v1") };
        var client = new OpenAIClient(new ApiKeyCredential(apiKey), clientOptions);
        var chatClient = client.GetChatClient("llama-3.3-70b-versatile");

        var prompt = $"""
            Write a LinkedIn post about {topic}.

            Requirements:
            - Use a {tone} tone
            - Start with a strong hook
            - Keep it under 200 words
            - Use short paragraphs for readability
            - Make it engaging and relatable
            - End with a question to encourage engagement
            - Add up to 3 relevant hashtags

            Audience:
            Professionals and developers
            """;

        var messages = new List<ChatMessage>
        {
            new UserChatMessage(prompt)
        };

        var response = await chatClient.CompleteChatAsync(messages);
        return response.Value.Content[0].Text;
    }
}

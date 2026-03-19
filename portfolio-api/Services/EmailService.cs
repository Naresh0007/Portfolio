using SendGrid;
using SendGrid.Helpers.Mail;

namespace PortfolioApi.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string email, string subject, string message)
    {
        var apiKey = _config["EmailSettings:SendGridKey"];
        var fromEmail = _config["EmailSettings:FromEmail"];
        var fromName = _config["EmailSettings:FromName"] ?? "Job Hunt";

        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("SendGrid API Key is missing. Email will NOT be sent. Message: {Message}", message);
            return;
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(email);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, message, message);
        
        var response = await client.SendEmailAsync(msg);
        
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Failed to send email to {Email}. Status: {Status}", email, response.StatusCode);
        }
        else
        {
            _logger.LogInformation("Email sent successfully to {Email}", email);
        }
    }
}

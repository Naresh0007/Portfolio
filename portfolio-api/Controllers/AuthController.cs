using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PortfolioApi.Models;
using PortfolioApi.Services;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<JobHuntUser> _userManager;
    private readonly SignInManager<JobHuntUser> _signInManager;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthController(
        UserManager<JobHuntUser> userManager,
        SignInManager<JobHuntUser> signInManager,
        IConfiguration config,
        IEmailService emailService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new JobHuntUser
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        
        // For testing, we still log it or return it, but also try to send it.
        // In a live scenario, the user will check their email.
        await _emailService.SendEmailAsync(user.Email, "Verify your email", 
            $"Your verification token is: {token}");

        return Ok(new { 
            message = "Registration successful. Please check your email for the verification token.",
            verificationToken = token, // Keeping it here for easier testing if email fails
            user = new { user.Id, user.Name, user.Email } 
        });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return NotFound(new { error = "User not found" });

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = "Invalid or expired verification token" });
        }

        var token = GenerateJwtToken(user);
        return Ok(new { token, user = new { user.Id, user.Name, user.Email }, message = "Email verified successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return Unauthorized(new { error = "Invalid email or password." });

        if (!await _userManager.IsEmailConfirmedAsync(user))
        {
            return BadRequest(new { error = "Please confirm your email before logging in." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { error = "Invalid email or password." });
        }

        var token = GenerateJwtToken(user);
        return Ok(new { token, user = new { user.Id, user.Name, user.Email } });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (userEmail == null) return Unauthorized();

        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null) return NotFound();

        return Ok(new { user = new { user.Id, user.Name, user.Email } });
    }

    private string GenerateJwtToken(JobHuntUser user)
    {
        var jwtSettings = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? ""));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(double.Parse(jwtSettings["ExpiryInMinutes"] ?? "1440")),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record VerifyEmailRequest(string Email, string Token);

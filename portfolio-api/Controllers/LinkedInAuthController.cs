using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/linkedin-auth")]
public class LinkedInAuthController : ControllerBase
{
    private readonly PortfolioDbContext _db;
    private readonly IConfiguration _config;

    public LinkedInAuthController(PortfolioDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] LinkedInRegisterRequest req)
    {
        if (await _db.LinkedInUsers.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { error = "Email already in use." });

        var user = new LinkedInUser
        {
            Email = req.Email,
            Name = req.Name,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            CreatedAt = DateTime.UtcNow
        };
        _db.LinkedInUsers.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Registration successful. You can now log in." });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LinkedInLoginRequest req)
    {
        var user = await _db.LinkedInUsers.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { error = "Invalid email or password." });

        var token = GenerateJwtToken(user);
        return Ok(new { token, user = new { user.Id, user.Name, user.Email } });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();
        var user = await _db.LinkedInUsers.FindAsync(userId.Value);
        if (user == null) return NotFound();
        return Ok(new { user = new { user.Id, user.Name, user.Email } });
    }

    private string GenerateJwtToken(LinkedInUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? ""));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim("linkedin_uid", user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Name, user.Name ?? string.Empty)
        };
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(1440),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    protected int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue("linkedin_uid");
        return claim != null && int.TryParse(claim, out var id) ? id : null;
    }
}

public record LinkedInRegisterRequest(string Name, string Email, string Password);
public record LinkedInLoginRequest(string Email, string Password);

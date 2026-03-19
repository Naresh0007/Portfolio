using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using System.Security.Claims;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/linkedin-notifications")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class LinkedInNotificationsController : ControllerBase
{
    private readonly PortfolioDbContext _db;

    public LinkedInNotificationsController(PortfolioDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var notifications = await _db.LinkedInNotifications
            .Where(n => n.UserId == userId.Value)
            .OrderByDescending(n => n.CreatedAt)
            .Take(20)
            .Select(n => new { n.Id, n.Message, n.IsRead, n.CreatedAt })
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var notification = await _db.LinkedInNotifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId.Value);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Marked as read." });
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var unread = await _db.LinkedInNotifications
            .Where(n => n.UserId == userId.Value && !n.IsRead)
            .ToListAsync();
        foreach (var n in unread) n.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new { message = "All notifications marked as read." });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue("linkedin_uid");
        return claim != null && int.TryParse(claim, out var id) ? id : null;
    }
}

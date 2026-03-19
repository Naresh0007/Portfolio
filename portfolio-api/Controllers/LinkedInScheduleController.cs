using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;
using PortfolioApi.Services;
using System.Security.Claims;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/linkedin-schedule")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class LinkedInScheduleController : ControllerBase
{
    private readonly PortfolioDbContext _db;

    public LinkedInScheduleController(PortfolioDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateScheduleRequest req)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        // Deactivate any existing schedule
        var existing = await _db.LinkedInSchedules
            .Where(s => s.UserId == userId.Value && s.IsActive)
            .ToListAsync();
        foreach (var s in existing) s.IsActive = false;

        var schedule = new LinkedInSchedule
        {
            UserId = userId.Value,
            Topic = req.Topic,
            Tone = req.Tone,
            Frequency = req.Frequency,
            CustomPerWeek = req.CustomPerWeek,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        _db.LinkedInSchedules.Add(schedule);
        await _db.SaveChangesAsync();

        // Register/update recurring Hangfire job
        RegisterHangfireJob(req.Frequency, req.CustomPerWeek);

        return Ok(new
        {
            schedule.Id,
            schedule.Topic,
            schedule.Tone,
            schedule.Frequency,
            schedule.CustomPerWeek,
            schedule.IsActive,
            schedule.CreatedAt
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetSchedule()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var schedules = await _db.LinkedInSchedules
            .Where(s => s.UserId == userId.Value)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.Topic,
                s.Tone,
                s.Frequency,
                s.CustomPerWeek,
                s.IsActive,
                s.CreatedAt
            })
            .ToListAsync();

        return Ok(schedules);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateScheduleRequest req)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var schedule = await _db.LinkedInSchedules
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId.Value);
        if (schedule == null) return NotFound(new { error = "Schedule not found." });

        if (req.Topic != null) schedule.Topic = req.Topic;
        if (req.Tone != null) schedule.Tone = req.Tone;
        if (req.Frequency != null) schedule.Frequency = req.Frequency;
        if (req.CustomPerWeek.HasValue) schedule.CustomPerWeek = req.CustomPerWeek;
        if (req.IsActive.HasValue)
        {
            schedule.IsActive = req.IsActive.Value;
            if (!req.IsActive.Value)
                RecurringJob.RemoveIfExists("linkedin-post-generation");
            else
                RegisterHangfireJob(schedule.Frequency, schedule.CustomPerWeek);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Schedule updated.", schedule.Id, schedule.IsActive });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var schedule = await _db.LinkedInSchedules
            .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId.Value);
        if (schedule == null) return NotFound(new { error = "Schedule not found." });

        _db.LinkedInSchedules.Remove(schedule);
        await _db.SaveChangesAsync();

        // Remove job only if no other active schedules
        var hasOtherActive = await _db.LinkedInSchedules.AnyAsync(s => s.IsActive);
        if (!hasOtherActive)
            RecurringJob.RemoveIfExists("linkedin-post-generation");

        return Ok(new { message = "Schedule deleted." });
    }

    private static void RegisterHangfireJob(string frequency, int? customPerWeek)
    {
        // Map frequency to a CRON expression
        var cron = frequency switch
        {
            "Daily" => Cron.Daily(),
            "Weekly" => Cron.Weekly(),
            _ => customPerWeek.HasValue && customPerWeek.Value > 0
                    ? $"0 9 */{7 / customPerWeek.Value} * *"
                    : Cron.Daily()
        };

        RecurringJob.AddOrUpdate<ILinkedInPostJobService>(
            "linkedin-post-generation",
            svc => svc.GenerateScheduledPostsAsync(),
            cron);
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue("linkedin_uid");
        return claim != null && int.TryParse(claim, out var id) ? id : null;
    }
}

public record CreateScheduleRequest(string Topic, string Tone, string Frequency, int? CustomPerWeek);
public record UpdateScheduleRequest(string? Topic, string? Tone, string? Frequency, int? CustomPerWeek, bool? IsActive);

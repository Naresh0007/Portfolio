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
[Route("api/linkedin-posts")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class LinkedInPostsController : ControllerBase
{
    private readonly PortfolioDbContext _db;
    private readonly IOpenAiService _openAi;
    private readonly ILinkedInShareService _shareSvc;

    public LinkedInPostsController(PortfolioDbContext db, IOpenAiService openAi, ILinkedInShareService shareSvc)
    {
        _db = db;
        _openAi = openAi;
        _shareSvc = shareSvc;
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishPost(int id)
    {
        var userIdStr = User.FindFirstValue("linkedin_uid");
        if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

        var post = await _db.LinkedInPosts.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        if (post == null) return NotFound();

        if (post.Status == LinkedInPostStatus.Posted)
            return BadRequest(new { error = "Post is already published." });

        var externalId = await _shareSvc.SharePostAsync(userId, post.Content);
        if (string.IsNullOrEmpty(externalId))
            return BadRequest(new { error = "Failed to publish to LinkedIn. Ensure your account is connected and hasn't expired (24h limit)." });

        post.Status = LinkedInPostStatus.Posted;
        post.ExternalPostId = externalId;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Published successfully!", externalId });
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GeneratePostRequest req)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        try
        {
            var content = await _openAi.GenerateLinkedInPostAsync(req.Topic, req.Tone);

            var post = new LinkedInPost
            {
                UserId = userId.Value,
                Topic = req.Topic,
                Content = content,
                Status = LinkedInPostStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };
            _db.LinkedInPosts.Add(post);

            // Create in-app notification
            _db.LinkedInNotifications.Add(new LinkedInNotification
            {
                UserId = userId.Value,
                Message = $"Your LinkedIn post about \"{req.Topic}\" is ready to publish!",
                CreatedAt = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();

            return Ok(new
            {
                post.Id,
                post.Topic,
                post.Content,
                Status = post.Status.ToString(),
                post.CreatedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "AI generation failed. Please try again.", detail = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var posts = await _db.LinkedInPosts
            .Where(p => p.UserId == userId.Value)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Topic,
                p.Content,
                Status = p.Status.ToString(),
                p.CreatedAt,
                p.ScheduledFor
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var post = await _db.LinkedInPosts.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId.Value);
        if (post == null) return NotFound(new { error = "Post not found." });

        _db.LinkedInPosts.Remove(post);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Post deleted." });
    }

    private int? GetCurrentUserId()
    {
        var claim = User.FindFirstValue("linkedin_uid");
        return claim != null && int.TryParse(claim, out var id) ? id : null;
    }
}

public record GeneratePostRequest(string Topic, string Tone);

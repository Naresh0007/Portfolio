using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly PortfolioDbContext _context;

    public ProjectsController(PortfolioDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects([FromQuery] string? category = null)
    {
        var query = _context.Projects.AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(p => p.Category == category);
        }

        return await query
            .OrderByDescending(p => p.Featured)
            .ThenByDescending(p => p.CreatedDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Project>> GetProject(int id)
    {
        var project = await _context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        return project;
    }

    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<Project>>> GetFeaturedProjects()
    {
        return await _context.Projects
            .Where(p => p.Featured)
            .OrderByDescending(p => p.CreatedDate)
            .ToListAsync();
    }
}

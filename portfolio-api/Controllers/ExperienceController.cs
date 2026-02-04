using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExperienceController : ControllerBase
{
    private readonly PortfolioDbContext _context;

    public ExperienceController(PortfolioDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Experience>>> GetExperiences()
    {
        return await _context.Experiences
            .OrderByDescending(e => e.StartDate)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Experience>> GetExperience(int id)
    {
        var experience = await _context.Experiences.FindAsync(id);

        if (experience == null)
        {
            return NotFound();
        }

        return experience;
    }
}

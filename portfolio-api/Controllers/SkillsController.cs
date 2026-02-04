using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioApi.Data;
using PortfolioApi.Models;

namespace PortfolioApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly PortfolioDbContext _context;

    public SkillsController(PortfolioDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetSkills()
    {
        var skills = await _context.Skills.ToListAsync();
        
        var groupedSkills = skills
            .GroupBy(s => s.Category)
            .Select(g => new
            {
                Category = g.Key,
                Skills = g.OrderByDescending(s => s.ProficiencyLevel).ToList()
            })
            .ToList();

        return groupedSkills;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Skill>> GetSkill(int id)
    {
        var skill = await _context.Skills.FindAsync(id);

        if (skill == null)
        {
            return NotFound();
        }

        return skill;
    }
}

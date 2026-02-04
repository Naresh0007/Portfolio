using Microsoft.EntityFrameworkCore;
using PortfolioApi.Models;

namespace PortfolioApi.Data;

public class PortfolioDbContext : DbContext
{
    static PortfolioDbContext()
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    }

    public PortfolioDbContext(DbContextOptions<PortfolioDbContext> options) : base(options)
    {
    }

    public DbSet<Experience> Experiences { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Skill> Skills { get; set; }
    public DbSet<Stat> Stats { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure JSON columns for lists
        modelBuilder.Entity<Experience>()
            .Property(e => e.Responsibilities)
            .HasColumnType("jsonb");

        modelBuilder.Entity<Experience>()
            .Property(e => e.Technologies)
            .HasColumnType("jsonb");

        modelBuilder.Entity<Project>()
            .Property(p => p.Technologies)
            .HasColumnType("jsonb");
    }
}

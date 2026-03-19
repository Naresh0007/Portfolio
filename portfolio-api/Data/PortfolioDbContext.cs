using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using PortfolioApi.Models;

namespace PortfolioApi.Data;

public class PortfolioDbContext : IdentityDbContext<JobHuntUser, IdentityRole<int>, int>
{
    public PortfolioDbContext(DbContextOptions<PortfolioDbContext> options) : base(options)
    {
    }

    public DbSet<Experience> Experiences { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Skill> Skills { get; set; }
    public DbSet<Stat> Stats { get; set; }

    // LinkedIn AI App
    public DbSet<LinkedInUser> LinkedInUsers { get; set; }
    public DbSet<LinkedInPost> LinkedInPosts { get; set; }
    public DbSet<LinkedInSchedule> LinkedInSchedules { get; set; }
    public DbSet<LinkedInNotification> LinkedInNotifications { get; set; }
    public DbSet<LinkedInAccount> LinkedInAccounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Rename Identity tables if desired
        modelBuilder.Entity<JobHuntUser>().ToTable("JobHuntUsers");

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

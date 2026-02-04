using PortfolioApi.Models;

namespace PortfolioApi.Data;

public static class DbInitializer
{
    public static void Initialize(PortfolioDbContext context)
    {
        context.Database.EnsureCreated();

        // Check if data already exists
        if (context.Experiences.Any())
        {
            return; // DB has been seeded
        }

        // Seed Experiences
        var experiences = new Experience[]
        {
            new Experience
            {
                Company = "Everest Impex",
                Role = "Software Engineer",
                StartDate = DateTime.SpecifyKind(new DateTime(2025, 12, 1), DateTimeKind.Utc),
                EndDate = null,
                Location = "New Zealand",
                IsCurrentRole = true,
                Description = "Full-time Software Engineer working on EDI and export compliance systems with live government and trade integrations.",
                Responsibilities = new List<string>
                {
                    "Took ownership of production features for EDI and export compliance systems, supporting live government and trade integrations",
                    "Implemented and enhanced RFP, EDN, and Phytosanitary Certificate workflows, including document printing, draft generation, and watermarking",
                    "Delivered end-to-end EDI mappings and validations, including Treatment Type logic (E34), Additional Declaration Text, and verified EDI file generation",
                    "Fixed critical production-impacting bugs, including search filter logic errors and timezone-related notification inconsistencies",
                    "Implemented automatic RFP → COMP transitions based on Print Indicator rules and validated behavior in test and production",
                    "Updated and deployed UN/LOCODE picklists, ensuring accurate and current trade location data",
                    "Strengthened role-based access control, enabling Global Admin permission overrides and tenant-specific role assignments",
                    "Implemented Test vs Production environment indicators, revert-to-test functionality, and contributed to go-live readiness checklists",
                    "Collaborated with senior engineers, assessors, and stakeholders during production approvals and release cycles",
                    "Supported production readiness activities, cleanup, validation, and deployment preparation"
                },
                Technologies = new List<string> { ".NET", "C#", "Azure DevOps", "PostgreSQL", "EDI", "REST APIs" }
            },
            new Experience
            {
                Company = "DDT Holdings",
                Role = "Junior Software Engineer",
                StartDate = DateTime.SpecifyKind(new DateTime(2024, 6, 1), DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(new DateTime(2025, 11, 30), DateTimeKind.Utc),
                Location = "New Zealand",
                IsCurrentRole = false,
                Description = "Internship and junior role focused on EDI-based export documentation systems development and testing.",
                Responsibilities = new List<string>
                {
                    "Assisted in the development and testing of EDI-based export documentation systems, including RFP and Phytosanitary Certificate workflows",
                    "Created and executed manual and automated test cases for backend services and business workflows",
                    "Automated unit testing for 400+ methods, significantly increasing test coverage and reducing regression issues",
                    "Integrated automated tests into Azure DevOps CI pipelines, enabling consistent and reliable builds",
                    "Supported debugging, validation, and test data preparation in test environments",
                    "Gained hands-on experience with .NET backend development, CI/CD pipelines, and enterprise application workflows"
                },
                Technologies = new List<string> { ".NET", "C#", "Azure DevOps", "Unit Testing", "CI/CD", "SQL Server" }
            }
        };

        context.Experiences.AddRange(experiences);

        // Seed Projects
        var projects = new Project[]
        {
            new Project
            {
                Title = "EDI Export Documentation System",
                Description = "Enterprise-level EDI system for export compliance and government integrations, handling RFP, EDN, and Phytosanitary Certificate workflows.",
                Technologies = new List<string> { ".NET", "PostgreSQL", "Azure DevOps", "EDI", "REST APIs" },
                Category = "Enterprise",
                Featured = true,
                CreatedDate = DateTime.UtcNow.AddMonths(-6)
            },
            new Project
            {
                Title = "Automated Testing Framework",
                Description = "Comprehensive automated testing framework with 400+ unit tests integrated into CI/CD pipelines, reducing regression issues by 60%.",
                Technologies = new List<string> { "C#", "xUnit", "Azure DevOps", "CI/CD" },
                Category = "DevOps",
                Featured = true,
                CreatedDate = DateTime.UtcNow.AddMonths(-8)
            },
            new Project
            {
                Title = "OnboardAI SaaS MVP",
                Description = "Futuristic B2B Client Onboarding SaaS platform with .NET backend, PostgreSQL database, and modern React frontend.",
                Technologies = new List<string> { ".NET 8", "PostgreSQL", "React", "Azure" },
                Category = "SaaS",
                Featured = true,
                CreatedDate = DateTime.UtcNow.AddMonths(-2)
            }
        };

        context.Projects.AddRange(projects);

        // Seed Skills
        var skills = new Skill[]
        {
            // Backend
            new Skill { Name = ".NET/C#", Category = "Backend", ProficiencyLevel = 90, YearsOfExperience = 2.5m, Icon = "devicon-csharp-plain" },
            new Skill { Name = "ASP.NET Core", Category = "Backend", ProficiencyLevel = 85, YearsOfExperience = 2.5m, Icon = "devicon-dotnetcore-plain" },
            new Skill { Name = "Entity Framework", Category = "Backend", ProficiencyLevel = 85, YearsOfExperience = 2.5m, Icon = "devicon-dotnetcore-plain" },
            new Skill { Name = "REST APIs", Category = "Backend", ProficiencyLevel = 90, YearsOfExperience = 2.5m, Icon = "devicon-fastapi-plain" },
            
            // Database
            new Skill { Name = "PostgreSQL", Category = "Database", ProficiencyLevel = 80, YearsOfExperience = 2m, Icon = "devicon-postgresql-plain" },
            new Skill { Name = "SQL Server", Category = "Database", ProficiencyLevel = 75, YearsOfExperience = 1.5m, Icon = "devicon-microsoftsqlserver-plain" },
            
            // Frontend
            new Skill { Name = "React", Category = "Frontend", ProficiencyLevel = 80, YearsOfExperience = 2m, Icon = "devicon-react-original" },
            new Skill { Name = "JavaScript/TypeScript", Category = "Frontend", ProficiencyLevel = 85, YearsOfExperience = 2.5m, Icon = "devicon-typescript-plain" },
            new Skill { Name = "HTML/CSS", Category = "Frontend", ProficiencyLevel = 90, YearsOfExperience = 3m, Icon = "devicon-html5-plain" },
            
            // DevOps & Tools
            new Skill { Name = "Azure DevOps", Category = "DevOps", ProficiencyLevel = 85, YearsOfExperience = 2m, Icon = "devicon-azure-plain" },
            new Skill { Name = "CI/CD Pipelines", Category = "DevOps", ProficiencyLevel = 80, YearsOfExperience = 2m, Icon = "devicon-github-original" },
            new Skill { Name = "Git", Category = "DevOps", ProficiencyLevel = 90, YearsOfExperience = 3m, Icon = "devicon-git-plain" },
            new Skill { Name = "Docker", Category = "DevOps", ProficiencyLevel = 70, YearsOfExperience = 1m, Icon = "devicon-docker-plain" },
            
            // Testing
            new Skill { Name = "Unit Testing", Category = "Testing", ProficiencyLevel = 90, YearsOfExperience = 2m, Icon = "devicon-jest-plain" },
            new Skill { Name = "Test Automation", Category = "Testing", ProficiencyLevel = 85, YearsOfExperience = 2m, Icon = "devicon-selenium-original" }
        };

        context.Skills.AddRange(skills);

        // Seed Stats
        var stats = new Stat[]
        {
            new Stat { MetricName = "Tests Automated", MetricValue = "400+", LastUpdated = DateTime.UtcNow },
            new Stat { MetricName = "Production Features", MetricValue = "15+", LastUpdated = DateTime.UtcNow },
            new Stat { MetricName = "Years Experience", MetricValue = "2.5", LastUpdated = DateTime.UtcNow },
            new Stat { MetricName = "Projects Completed", MetricValue = "10+", LastUpdated = DateTime.UtcNow }
        };

        context.Stats.AddRange(stats);

        context.SaveChanges();
    }
}

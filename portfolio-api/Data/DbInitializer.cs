using PortfolioApi.Models;

namespace PortfolioApi.Data;

public static class DbInitializer
{
    public static void Initialize(PortfolioDbContext context)
    {
        context.Database.EnsureCreated();

        // Clear existing data to ensure CV sync
        context.Experiences.RemoveRange(context.Experiences);
        context.Projects.RemoveRange(context.Projects);
        context.Skills.RemoveRange(context.Skills);
        context.Stats.RemoveRange(context.Stats);
        context.SaveChanges();

        // Seed Experiences
        var experiences = new Experience[]
        {
            new Experience
            {
                Company = "DDT Holdings",
                Role = "Junior Software Engineer",
                StartDate = DateTime.SpecifyKind(new DateTime(2025, 10, 1), DateTimeKind.Utc),
                EndDate = null,
                Location = "Ultimo, Sydney, NSW, Australia",
                IsCurrentRole = true,
                Description = "Taking ownership of production features for EDI and export compliance systems, supporting live government and trade integrations.",
                Responsibilities = new List<string>
                {
                    "Took ownership of production features for EDI and export compliance systems, supporting live government and trade integrations.",
                    "Implemented and enhanced RFP, EDN, and Phytosanitary Certificate workflows, including document printing, draft generation, and watermarking.",
                    "Delivered end-to-end EDI mappings and validations, including Treatment Type logic (E34), Additional Declaration Text, and verified EDI file generation.",
                    "Fixed critical production-impacting bugs, including search filter logic errors and timezone-related notification inconsistencies.",
                    "Implemented automatic status transitions based on Print Indicator rules and validated behavior in test and production.",
                    "Updated and deployed UN/LOCODE picklists, ensuring accurate and current trade location data.",
                    "Strengthened role-based access control, enabling Global Admin permission overrides and tenant-specific role assignments.",
                    "Implemented Test vs Production environment indicators and revert-to-test functionality.",
                    "Collaborated with senior engineers and stakeholders during production approvals and release cycles."
                },
                Technologies = new List<string> { ".NET Core", "C#", "Azure DevOps", "PostgreSQL", "EDI", "REST APIs" }
            },
            new Experience
            {
                Company = "DDT Holdings",
                Role = "Junior Software Tester Intern",
                StartDate = DateTime.SpecifyKind(new DateTime(2025, 8, 1), DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(new DateTime(2025, 10, 31), DateTimeKind.Utc),
                Location = "Sydney, Australia",
                IsCurrentRole = false,
                Description = "Focused on functional testing and backend API development for .NET and React-based applications.",
                Responsibilities = new List<string>
                {
                    "Conducted functional and unit testing in Azure DevOps for .NET and React-based applications.",
                    "Implemented backend APIs for authentication and user management, improving reliability and security.",
                    "Automated unit tests using xUnit and Moq, increasing test coverage across modules.",
                    "Designed and optimized documentation UI in React/TypeScript, adding responsive navigation and dropdowns.",
                    "Debugged TypeScript mapping issues and resolved deployment errors in Dockerized environments."
                },
                Technologies = new List<string> { "C#", "xUnit", "Moq", "React", "TypeScript", "Docker" }
            },
            new Experience
            {
                Company = "James Anthony Consulting",
                Role = "Software Engineer",
                StartDate = DateTime.SpecifyKind(new DateTime(2024, 10, 1), DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(new DateTime(2025, 8, 31), DateTimeKind.Utc),
                Location = "Adelaide, Australia",
                IsCurrentRole = false,
                Description = "Built enterprise applications using .NET MAUI and C#, focusing on modular and scalable architectures.",
                Responsibilities = new List<string>
                {
                    "Built enterprise applications using .NET MAUI and C#, implementing modular and scalable architectures.",
                    "Designed and maintained relational database schemas (PostgreSQL) and optimized SQL queries for performance.",
                    "Developed backend services and integrated with REST APIs for real-time data processing.",
                    "Implemented CI/CD pipelines using GitHub Actions and Docker, deployed containerized services to Kubernetes."
                },
                Technologies = new List<string> { ".NET MAUI", "C#", "PostgreSQL", "Docker", "Kubernetes", "GitHub Actions" }
            },
            new Experience
            {
                Company = "Codewing Solutions",
                Role = "Software Engineer",
                StartDate = DateTime.SpecifyKind(new DateTime(2021, 2, 1), DateTimeKind.Utc),
                EndDate = DateTime.SpecifyKind(new DateTime(2022, 9, 30), DateTimeKind.Utc),
                Location = "Kathmandu, Nepal",
                IsCurrentRole = false,
                Description = "Developed C# and PHP applications for client-facing and internal solutions.",
                Responsibilities = new List<string>
                {
                    "Developed C# and PHP applications for client-facing and internal solutions.",
                    "Designed and optimized relational databases (MySQL, SQL Server) for enterprise-grade performance.",
                    "Automated deployments and managed version control using Git and CI/CD pipelines.",
                    "Collaborated with cross-functional teams to deliver robust software features."
                },
                Technologies = new List<string> { "C#", "PHP", "MySQL", "SQL Server", "Git", "CI/CD" }
            }
        };

        context.Experiences.AddRange(experiences);

        // Seed Projects
        var projects = new Project[]
        {
            new Project
            {
                Title = "EDI Export Compliance System",
                Description = "High-traffic system supporting live government and trade integrations with automated status transitions and EDI file generation.",
                Technologies = new List<string> { ".NET", "PostgreSQL", "EDI", "Azure DevOps" },
                Category = "Enterprise",
                Featured = true,
                CreatedDate = DateTime.UtcNow.AddMonths(-3)
            },
            new Project
            {
                Title = "Enterprise MAUI App",
                Description = "Modular and scalable mobile application built with .NET MAUI and integrated with real-time REST APIs.",
                Technologies = new List<string> { ".NET MAUI", "C#", "REST API", "PostgreSQL" },
                Category = "Mobile",
                Featured = true,
                CreatedDate = DateTime.UtcNow.AddMonths(-6)
            }
        };

        context.Projects.AddRange(projects);

        // Seed Skills
        var skills = new Skill[]
        {
            new Skill { Name = "C#", Category = "Languages", ProficiencyLevel = 95, YearsOfExperience = 2.5m, Icon = "devicon-csharp-plain" },
            new Skill { Name = ".NET Core", Category = "Backend", ProficiencyLevel = 90, YearsOfExperience = 2.5m, Icon = "devicon-dotnetcore-plain" },
            new Skill { Name = ".NET MAUI", Category = "Mobile", ProficiencyLevel = 85, YearsOfExperience = 1.0m, Icon = "devicon-dotnetcore-plain" },
            new Skill { Name = "TypeScript", Category = "Frontend", ProficiencyLevel = 85, YearsOfExperience = 1.5m, Icon = "devicon-typescript-plain" },
            new Skill { Name = "React.js", Category = "Frontend", ProficiencyLevel = 80, YearsOfExperience = 1.5m, Icon = "devicon-react-original" },
            new Skill { Name = "PostgreSQL", Category = "Database", ProficiencyLevel = 85, YearsOfExperience = 2.0m, Icon = "devicon-postgresql-plain" },
            new Skill { Name = "SQL Server", Category = "Database", ProficiencyLevel = 80, YearsOfExperience = 2.0m, Icon = "devicon-microsoftsqlserver-plain" },
            new Skill { Name = "Docker", Category = "Tools", ProficiencyLevel = 85, YearsOfExperience = 1.5m, Icon = "devicon-docker-plain" },
            new Skill { Name = "Kubernetes", Category = "Tools", ProficiencyLevel = 75, YearsOfExperience = 1.0m, Icon = "devicon-kubernetes-plain" },
            new Skill { Name = "Azure DevOps", Category = "Tools", ProficiencyLevel = 90, YearsOfExperience = 1.5m, Icon = "devicon-azure-plain" }
        };

        context.Skills.AddRange(skills);

        // Seed Stats
        var stats = new Stat[]
        {
            new Stat { MetricName = "Years Experience", MetricValue = "2.5+", LastUpdated = DateTime.UtcNow },
            new Stat { MetricName = "Production Systems", MetricValue = "5+", LastUpdated = DateTime.UtcNow },
            // Removed specific test count, keeping it more professional/broad
            new Stat { MetricName = "Tech Stack", MetricValue = "15+", LastUpdated = DateTime.UtcNow }
        };

        context.Stats.AddRange(stats);

        context.SaveChanges();
    }
}

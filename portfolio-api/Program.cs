using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PortfolioApi.Data;
using PortfolioApi.Models;
using PortfolioApi.Services;
using Microsoft.AspNetCore.Identity;
using Hangfire;
using Hangfire.PostgreSql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddDataProtection();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=portfolio_db;Username=nareshshrestha;Password=";

var dataSourceBuilder = new Npgsql.NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson();
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<PortfolioDbContext>(options =>
    options.UseNpgsql(dataSource));

// Configure Identity
builder.Services.AddIdentity<JobHuntUser, IdentityRole<int>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<PortfolioDbContext>()
.AddDefaultTokenProviders();

// Register Services
builder.Services.AddScoped<IEmailService, EmailService>();

// LinkedIn AI Services
builder.Services.AddScoped<IOpenAiService, OpenAiService>();
builder.Services.AddScoped<ILinkedInPostJobService, LinkedInPostJobService>();
builder.Services.AddScoped<ILinkedInShareService, LinkedInShareService>();
builder.Services.AddScoped<LinkedInDataCleanupJob>();

// Hangfire
builder.Services.AddHangfire(config =>
    config.UsePostgreSqlStorage(c =>
        c.UseNpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"))));
builder.Services.AddHangfireServer();


// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "default_secret_key_that_is_long_enough_32_chars";
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<PortfolioDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHangfireDashboard("/hangfire");
}

app.UseCors("AllowFrontend");
// app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Schedule recurring Hangfire jobs for any active schedules at startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PortfolioDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    // Retry registration up to 5 times to handle transient lock timeouts
    for (int i = 0; i < 5; i++)
    {
        try 
        {
            var hasActive = db.LinkedInSchedules.Any(s => s.IsActive);
            if (hasActive)
            {
                RecurringJob.AddOrUpdate<ILinkedInPostJobService>(
                    "linkedin-post-generation",
                    svc => svc.GenerateScheduledPostsAsync(),
                    Cron.Daily());
            }

            RecurringJob.AddOrUpdate<LinkedInDataCleanupJob>(
                "linkedin-data-cleanup",
                job => job.CleanupExpiredAccountsAsync(),
                Cron.Hourly());
            
            logger.LogInformation("Successfully registered Hangfire recurring jobs.");
            break; // Success!
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Attempt {Count} to register Hangfire jobs failed due to lock. Retrying in 2 seconds...", i + 1);
            if (i == 4) logger.LogError("Max retries reached. Some recurring jobs might not be registered.");
            Thread.Sleep(2000); // Wait for lock to potentially clear
        }
    }
}

app.Run();
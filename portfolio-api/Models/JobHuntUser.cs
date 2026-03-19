using System;

using Microsoft.AspNetCore.Identity;

namespace PortfolioApi.Models;

public class JobHuntUser : IdentityUser<int>
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

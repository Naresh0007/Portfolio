using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PortfolioApi.Migrations
{
    /// <inheritdoc />
    public partial class AddLinkedInTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // LinkedInUsers
            migrationBuilder.CreateTable(
                name: "LinkedInUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkedInUsers", x => x.Id);
                });

            // LinkedInNotifications
            migrationBuilder.CreateTable(
                name: "LinkedInNotifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkedInNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LinkedInNotifications_LinkedInUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "LinkedInUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // LinkedInPosts
            migrationBuilder.CreateTable(
                name: "LinkedInPosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Topic = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScheduledFor = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkedInPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LinkedInPosts_LinkedInUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "LinkedInUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // LinkedInSchedules
            migrationBuilder.CreateTable(
                name: "LinkedInSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Topic = table.Column<string>(type: "text", nullable: false),
                    Tone = table.Column<string>(type: "text", nullable: false),
                    Frequency = table.Column<string>(type: "text", nullable: false),
                    CustomPerWeek = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkedInSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LinkedInSchedules_LinkedInUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "LinkedInUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LinkedInNotifications_UserId",
                table: "LinkedInNotifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkedInPosts_UserId",
                table: "LinkedInPosts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LinkedInSchedules_UserId",
                table: "LinkedInSchedules",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "LinkedInNotifications");
            migrationBuilder.DropTable(name: "LinkedInPosts");
            migrationBuilder.DropTable(name: "LinkedInSchedules");
            migrationBuilder.DropTable(name: "LinkedInUsers");
        }
    }
}

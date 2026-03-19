using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortfolioApi.Migrations
{
    /// <inheritdoc />
    public partial class AddLinkedInOAuthFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsConnected",
                table: "LinkedInUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInAccessToken",
                table: "LinkedInUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInProfileId",
                table: "LinkedInUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInProfileName",
                table: "LinkedInUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInProfilePicture",
                table: "LinkedInUsers",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsConnected",
                table: "LinkedInUsers");

            migrationBuilder.DropColumn(
                name: "LinkedInAccessToken",
                table: "LinkedInUsers");

            migrationBuilder.DropColumn(
                name: "LinkedInProfileId",
                table: "LinkedInUsers");

            migrationBuilder.DropColumn(
                name: "LinkedInProfileName",
                table: "LinkedInUsers");

            migrationBuilder.DropColumn(
                name: "LinkedInProfilePicture",
                table: "LinkedInUsers");
        }
    }
}

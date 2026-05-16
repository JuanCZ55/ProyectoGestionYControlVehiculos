using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMatafuegoAndNeumatico2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehiculos_Matafuegos_IdMatafuego",
                table: "Vehiculos");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehiculos_Matafuegos_IdMatafuego",
                table: "Vehiculos",
                column: "IdMatafuego",
                principalTable: "Matafuegos",
                principalColumn: "IdMatafuego",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vehiculos_Matafuegos_IdMatafuego",
                table: "Vehiculos");

            migrationBuilder.AddForeignKey(
                name: "FK_Vehiculos_Matafuegos_IdMatafuego",
                table: "Vehiculos",
                column: "IdMatafuego",
                principalTable: "Matafuegos",
                principalColumn: "IdMatafuego");
        }
    }
}

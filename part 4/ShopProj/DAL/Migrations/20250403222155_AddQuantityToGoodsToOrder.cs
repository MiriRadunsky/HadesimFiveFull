using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityToGoodsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // הוספת העמודה החדשה 'Quantity' לטבלת GoodsToOrders
            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "GoodsToOrders",
                nullable: false,
                defaultValue: 0); // ערך ברירת המחדל הוא 0
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // אם נחזור אחורה במיגרציה, נמחוק את העמודה שנוספה
            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "GoodsToOrders");
        }
    }
}

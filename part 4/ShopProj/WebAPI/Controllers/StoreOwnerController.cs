
using BLL.Models;
using BLL.Services;
using DAL.Models;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{


    [Route("[Controller]")]
    [ApiController]
    public class StoreOwnerController : Controller
    {
        IOrderManager orderManager;

        public StoreOwnerController(IOrderManager _orderManager)
        {
            orderManager = _orderManager;
        }

        [HttpPost("CreateOrder")]
        public async Task<IActionResult> CreateOrder([FromQuery] Dictionary<string, int> goodsWithQuantities, [FromBody] string company)
        {
           
            var idSupplier = await orderManager.GetIdSupplierByCompanyName(company);

            M_Orders order = new M_Orders() { IdSuppliers = idSupplier };

            var result = await orderManager.CreateOrder(goodsWithQuantities, order.Convert());

            if (result)
            {
                return Ok("ההזמנה נוצרה בהצלחה.");
            }
            else
            {
                return BadRequest("נכשל ביצירת הזמנה.");
            }
        }



        [HttpPut("ApproveOrder")]
        public async Task<IActionResult> ApproveOrder([FromQuery] int id)
        {
            var result = await orderManager.ApproveOrder(id);
            if (result)
            {
                return Ok("Order approved successfully.");
            }
            else
            {
                return BadRequest("Failed to approve order.");
            }
        }



        [HttpGet("StatusOrders")]
        public async Task<IActionResult> AllStatusOrders( )
        {
            var orders = await orderManager.GetAllStatusOrders();
            return Ok(orders);
        }


        [HttpGet("AllOrders")]
        public async Task<IActionResult> AllOrders()
        {
            var orders = await orderManager.GetAllOrdersWithGoods();
            return Ok(orders);
        }
    }
}

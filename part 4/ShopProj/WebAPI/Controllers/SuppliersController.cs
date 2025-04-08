using Microsoft.AspNetCore.Mvc;
using BLL.Models;
using BLL.Services;

namespace WebAPI.Controllers
{

    [Route("[Controller]")]
    [ApiController]
    public class SuppliersController : Controller
    {
        IOrderManager orderManager;

        public SuppliersController(IOrderManager _orderManager)
        {
            orderManager = _orderManager;
        }

        [HttpPost("AddSupplier")]
        public async Task<IActionResult> AddSupplier([FromBody] M_Suppliers supplier)
        {
            if (supplier == null)
            {
                throw new ArgumentNullException(nameof(supplier));
            }

            if (supplier.Convert() == null)
            {
                return BadRequest();
            }

            try
            {
                await orderManager.creatSupplierAsync(supplier.Convert());
                return Ok(); 
            }
            catch (Exception ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

     


        [HttpPost("LoginSupplier")]
        public async Task<IActionResult> LoginSupplier([FromForm] string company, [FromForm] string phone)
        {
            if (company == null || phone == null)
            {
                throw new ArgumentNullException("Company or phone cannot be null");
            }

            var loginResult = await orderManager.loginSupplierAsync(company, phone);

            if (loginResult == 1) 
            {
                return Ok();
            }
            else if (loginResult == 0) 
            {
                return StatusCode(403, "Invalid phone"); 
            }
            else
            {
                return Unauthorized();
            }
        }

       

        [HttpGet("AllOrdersForSupplier")]
        public async Task<IActionResult> AllOrders(string company)
        {
            var orders = await orderManager.GetAllOrdersWithGoodsForSupplier(company);
            return Ok(orders);
        }

     


        [HttpPost("AddGoodsToSupplier")]
        public async Task<IActionResult> AddGoodsToSupplier([FromQuery] string company, [FromBody] Dictionary<string, float> goodsWithQuantities, [FromQuery] int quantity)
        {
            try
            {
                var result = await orderManager.AddGoodsToSupplier(company, goodsWithQuantities, quantity);
                return Ok("Goods added successfully.");
            }
            catch (Exception ex)
            {
                return Conflict(ex.Message); 
            }
        }



        [HttpPut("InProgressOrder")]
        public async Task<IActionResult> InProgressOrder([FromQuery] int id)
        {
            var result = await orderManager.InProgressOrder(id);
            if (result)
            {
                return Ok("Order In Progress....");
            }
            else
            {
                return BadRequest("Failed In Progress order.");
            }
        }
    }
}

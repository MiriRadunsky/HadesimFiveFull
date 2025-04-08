using System.Threading.Tasks;
using DAL.Models;

namespace DAL.Api
{
    public interface IGoodsToOrderService
    {
        Task AddGoodsToOrder(int orderId, int goodsId, int quantity);
        Task<List<GoodsToOrder>> GetGoodsByOrder(int orderId);
        Task AddGoodsToOrder(int orderId, List<GoodsToOrder> goodsToOrders);

        
    }
}
using DAL.Models;

namespace DAL.Api
{
    public interface IGoodsService
    {
        Task AddGood(Good good);
        Task<List<Good>> GetAllGoods();
        Task<Good> GetGoodByName(string name);
        Task<Good> GetGoodByNameAndPrice(string name, double price);
        Task<Good> GetGoodByID(int id);
        Task<Good> GetGoodByAll(string name, float price, int minQuantity);
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Api;
using DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace DAL.Service
{
    public class GoodsService : IGoodsService
    {
        private readonly DB_Manager _context;
        public GoodsService()
        {
            _context = new DB_Manager();
        }

        public async Task<List<Good>> GetAllGoods()
        {
            return await _context.Goods.ToListAsync();
        }

        public async Task<Good> GetGoodByName(string name)
        {
            return await _context.Goods.FirstOrDefaultAsync(x => x.ProductName == name);
        }
        public async Task<Good> GetGoodByID(int id)
        {
            return await _context.Goods.FirstOrDefaultAsync(x => x.Id == id);
        }
        public async Task AddGood(Good good)
        {
            await _context.Goods.AddAsync(good);

            await _context.SaveChangesAsync();
        }
        public async Task<Good> GetGoodByNameAndPrice(string name, double price)
        {
            return await _context.Goods.FirstOrDefaultAsync(x => x.ProductName == name && x.Price == price);
        }

        public async Task<Good> GetGoodByAll(string name, float price, int minQuantity)
        {
            return await _context.Goods
                .FirstOrDefaultAsync(g => g.ProductName == name && g.Price == price && g.MinQuantity == minQuantity);
        }





    }
}

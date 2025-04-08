﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.Api;
using DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace DAL.Service
{
    public class GoodsToOrderService : IGoodsToOrderService
    {
        private readonly DB_Manager _context;

        public GoodsToOrderService()
        {
            _context = new DB_Manager();
        }

        public async Task<List<GoodsToOrder>> GetGoodsByOrder(int orderId)
        {
            return await _context.GoodsToOrders
                .Where(gto => gto.IdOrders == orderId)
                .Include(gto => gto.IdGoodsNavigation)
                .ToListAsync();
        }

        public async Task AddGoodsToOrder(int orderId, int goodsId, int quantity)
        {
            var goodsToOrder = new GoodsToOrder()
            {
                IdGoods = goodsId,
                IdOrders = orderId,
                Quantity = quantity
            };

            await _context.GoodsToOrders.AddAsync(goodsToOrder);
            await _context.SaveChangesAsync();
        }

        public async Task AddGoodsToOrder(int orderId, List<GoodsToOrder> goodsToOrders)
        {
            var order = await _context.Orders.Include(o => o.GoodsToOrders).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order != null)
            {
                foreach (var goodsToOrder in goodsToOrders)
                {
                    goodsToOrder.IdOrders = orderId;
                    order.GoodsToOrders.Add(goodsToOrder);
                }
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();
            }
        }
    }
}

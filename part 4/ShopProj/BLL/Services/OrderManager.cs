using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;


using DAL.Api;
using BLL.Models;
using DAL.Models;
using DAL.Service;


namespace BLL.Services
{
    public class OrderManager : IOrderManager
    {
        private IOrderService _orderService;
        private ISuppliersService _suppliersService;
        private IGoodsService _goodsService;
        private IGoodsToSuppliersService _goodsToSupplierService;
        private IGoodsToOrderService _goodsToOrderService;



        public OrderManager(IOrderService orderService, ISuppliersService isuppliersService, IGoodsService goodsService, IGoodsToSuppliersService goodsToSupplierService, IGoodsToOrderService goodsToOrderService)
        {
            _orderService = orderService;
            _suppliersService = isuppliersService;
            _goodsService = goodsService;
            _goodsToSupplierService = goodsToSupplierService;
            _goodsToOrderService = goodsToOrderService;
        }

        public async Task<bool> CreateOrder(Dictionary<string, int> goodsWithPrices, Order order)
        {
            List<GoodsToOrder> goodsList = new List<GoodsToOrder>();

            List<Good> supplierGoods = await _goodsToSupplierService.GetGoodsBySupplierId(order.IdSuppliers);

            foreach (var good in goodsWithPrices)
            {
                string productName = good.Key;
                int quantityRequested = good.Value;

                var matchingGood = supplierGoods.FirstOrDefault(g => g.ProductName == productName);

                if (matchingGood == null)
                {
                    throw new Exception($"Good '{productName}' not found for this supplier.");
                }

                if (quantityRequested < matchingGood.MinQuantity)
                {
                    throw new Exception($"The quantity for '{productName}' is less than the minimum required quantity of {matchingGood.MinQuantity}");
                }

                var supplierProductPrice = matchingGood.Price;

                goodsList.Add(new GoodsToOrder()
                {
                    IdOrders = order.Id,
                    IdGoods = matchingGood.Id,
                    Quantity = quantityRequested,
                    
                });
            }

            await _orderService.AddOrder(order);
            await _goodsToOrderService.AddGoodsToOrder(order.Id, goodsList);

            return true;
        }





        public async Task<bool> ApproveOrder(int id)
        {
            var order = await _orderService.GetOrderById(id);
            if (order.Status == "inProgress")
            {
                await _orderService.ChangeOrderStatus(id, "approved");
                return true;
            }
            return false;
        }

        public async Task<bool> InProgressOrder(int id)
        {
            var order = await _orderService.GetOrderById(id);
            if (order.Status == "waiting")
            {
                _orderService.ChangeOrderStatus(id, "inProgress");
                return true;
            }
            return false;
        }

        public async Task<bool> AddGoodsToSupplier(string company, Dictionary<string, float> goodsWithQuantities, int minQuantity)
        {
            var supplier = await _suppliersService.GetSupplierByCompany(company);
            if (supplier == null)
            {
                throw new Exception("Supplier not found");
            }

            var existingGoodsForSupplier = await _goodsToSupplierService.GetGoodsBySupplierId(supplier.Id);
            var allGoods = await _goodsService.GetAllGoods();

            foreach (var good in goodsWithQuantities)
            {
                string productName = good.Key;
                float price = good.Value;

                if (existingGoodsForSupplier.Any(g => g.ProductName == productName))
                {
                    throw new Exception($"The supplier already has the good: {productName}");
                }

                var matchingGood = allGoods.FirstOrDefault(g =>
                    g.ProductName == productName &&
                    g.Price == price &&
                    g.MinQuantity == minQuantity
                );

                if (matchingGood != null)
                {
                    await _goodsToSupplierService.AddGoodsToSupplier(supplier.Id, matchingGood.Id);
                }
                else
                {
                    var newGood = new Good
                    {
                        ProductName = productName,
                        Price = price,
                        MinQuantity = minQuantity
                    };

                    await _goodsService.AddGood(newGood);

                    var createdGood = await _goodsService.GetGoodByAll(productName, price, minQuantity);

                    await _goodsToSupplierService.AddGoodsToSupplier(supplier.Id, createdGood.Id);
                }
            }

            return true;
        }


        public async Task creatSupplierAsync(Supplier supplier)
        {
            var existingSupplier = await _suppliersService.GetSupplierByCompany(supplier.Company);
            if (existingSupplier != null)
            {
                throw new Exception("Supplier already exists");
            }

            var existingSupplierByPhone = await _suppliersService.ProxyByCompanyAndPhoneNumber(supplier.Company, supplier.PhoneNumber);
            if (existingSupplierByPhone != null)
            {
                throw new Exception("Supplier with this phone number already exists");
            }

            await _suppliersService.AddSupplier(supplier);
        }


   

        public async Task<int> loginSupplierAsync(string company, string phone)
        {
            var supplierExists = await _suppliersService.GetSupplierByCompany(company);
            if (supplierExists == null)
            {
                return -1; 
            }

            var supplier = await _suppliersService.ProxyByCompanyAndPhoneNumber(company, phone);
            if (supplier == null)
            {
                return 0; 
            }

            return 1; 
        }


        public async Task<List<Order>> GetAllOrders()
        {
            return await _orderService.GetAllOrders();
        }


        public async Task<int> GetIdSupplierByCompanyName(string name)
        {
            var supplier = await _suppliersService.GetSupplierByCompany(name);
            if (supplier == null)
            {
                throw new Exception("Supplier not found");
            }
            return supplier.Id;
        }


        public async Task CreatGood(Good good)
        {

            await _goodsService.AddGood(good);
        }
        public async Task<List<object>> GetAllOrdersWithGoodsForSupplier(string company)
        {
            var supplierId = await GetIdSupplierByCompanyName(company);
            var orders = await _orderService.GetAllOrders();
            var goods = await _goodsToSupplierService.GetGoodsBySupplierId(supplierId);
            var ordersWithGoods = new List<object>();

            foreach (var order in orders)
            {
                if (order.IdSuppliers != supplierId)
                {
                    continue;
                }
               
                    var goodsInOrder = await _goodsToOrderService.GetGoodsByOrder(order.Id);
                    if (goodsInOrder.Any(g => goods.Any(s => s.Id == g.IdGoods)))
                    {
                        ordersWithGoods.Add(new
                        {
                            OrderId = order.Id,
                            OrderStatus = order.Status,
                            OrderDate = order.OrderDate.ToString("yyyy-MM-dd HH:mm:ss"),
                            Goods = goodsInOrder.Select(g => new
                            {
                                g.Id,
                                g.IdGoodsNavigation.ProductName,
                                g.Quantity
                            }).ToList()
                        });
                    
                }
            }

            return ordersWithGoods;
        }


        public async Task<List<object>> GetAllStatusOrders()
        {
            var orders = await _orderService.GetAllOrders();
            var ordersWithDetails = new List<object>();

            foreach (var order in orders)
            {
                if (order.Status == "waiting" || order.Status == "inProgress")
                {
                    var company = await _suppliersService.GetSupplierById(order.IdSuppliers);
                    ordersWithDetails.Add(new
                    {
                        OrderId = order.Id,
                        CompanyName = company.Company,
                        OrderDate = order.OrderDate.ToString("yyyy-MM-dd HH:mm:ss"),
                        Status = order.Status
                    });
                }
            }

            return ordersWithDetails;
        }

        public async Task<List<object>> GetAllOrdersWithGoods()
        {
            var orders = await _orderService.GetAllOrders();
            var ordersWithGoods = new List<object>();

            foreach (var order in orders)
            {
                var goodsInOrder = await _goodsToOrderService.GetGoodsByOrder(order.Id);
                var goodsDetails = new List<object>();

                foreach (var good in goodsInOrder)
                {
                    var goodDetails = await _goodsService.GetGoodByID(good.IdGoods);

                    var supplierProductPrice = await _goodsToSupplierService.GetProductPriceForSupplier(good.IdGoods, order.IdSuppliers);

                    goodsDetails.Add(new
                    {
                        good.Id,
                        good.IdGoodsNavigation.ProductName,
                        good.Quantity,
                        Price = supplierProductPrice
                    });
                }

                var supplier = await _suppliersService.GetSupplierById(order.IdSuppliers);

                ordersWithGoods.Add(new
                {
                    OrderId = order.Id,
                    OrderStatus = order.Status,
                    OrderDate = order.OrderDate.ToString("yyyy-MM-dd HH:mm:ss"),
                    CompanyName = supplier.Company,
                    Goods = goodsDetails
                });
            }

            return ordersWithGoods;
        }



       


    }

}


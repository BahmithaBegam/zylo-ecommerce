import { Response } from 'express';
import { db } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    const totalOrders = db.orders.length;
    const totalRevenue = db.orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalCustomers = db.users.filter(u => u.role === 'customer').length;
    const totalProducts = db.products.length;
    const totalProductsSold = db.orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);

    // Low stock items (< 15)
    const lowStockProducts = db.products.filter(p => p.stock < 15).slice(0, 10);
    const outOfStockCount = db.products.filter(p => p.stock === 0).length;
    const lowStockCount = db.products.filter(p => p.stock > 0 && p.stock < 15).length;

    // Recent orders
    const recentOrders = db.orders.slice(0, 8);

    // Top selling products (calculated from order items)
    const productSalesMap = new Map<string, { product: any; salesCount: number; revenue: number }>();
    db.orders.forEach(o => {
      if (o.orderStatus !== 'Cancelled') {
        o.items.forEach(i => {
          const current = productSalesMap.get(i.productId) || {
            product: { _id: i.productId, name: i.name, image: i.image, price: i.price },
            salesCount: 0,
            revenue: 0,
          };
          current.salesCount += i.quantity;
          current.revenue += i.price * i.quantity;
          productSalesMap.set(i.productId, current);
        });
      }
    });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 6);

    // Category sales distribution
    const categoryStats = db.categories.map(cat => {
      const count = db.products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
      return {
        name: cat.name,
        productCount: count,
      };
    });

    // 7-day sales graph mock data points for analytics
    const salesChart = [
      { day: 'Mon', sales: 34500, orders: 18 },
      { day: 'Tue', sales: 48200, orders: 24 },
      { day: 'Wed', sales: 41900, orders: 21 },
      { day: 'Thu', sales: 56300, orders: 29 },
      { day: 'Fri', sales: 68400, orders: 36 },
      { day: 'Sat', sales: 89200, orders: 48 },
      { day: 'Sun', sales: 74100, orders: 42 },
    ];

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        totalProductsSold,
        outOfStockCount,
        lowStockCount,
      },
      recentOrders,
      topSellingProducts,
      lowStockProducts,
      categoryStats,
      salesChart,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate admin dashboard metrics.' });
  }
};

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    let items = [...db.products];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (status === 'out_of_stock') {
      items = items.filter(p => p.stock === 0);
    } else if (status === 'low_stock') {
      items = items.filter(p => p.stock > 0 && p.stock < 15);
    } else if (status === 'in_stock') {
      items = items.filter(p => p.stock >= 15);
    }

    return res.json({
      success: true,
      inventory: items,
      metrics: {
        totalItems: db.products.length,
        inStock: db.products.filter(p => p.stock >= 15).length,
        lowStock: db.products.filter(p => p.stock > 0 && p.stock < 15).length,
        outOfStock: db.products.filter(p => p.stock === 0).length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve inventory.' });
  }
};

export const updateInventoryStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, stock } = req.body;
    if (!productId || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and stock count are required.' });
    }

    const product = db.products.find(p => p._id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.stock = Math.max(0, parseInt(stock, 10));

    return res.json({
      success: true,
      message: `Stock for "${product.name}" updated to ${product.stock} units.`,
      product,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update product stock.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const safeUsers = db.users.map(({ passwordHash, ...user }) => {
      const orderCount = db.orders.filter(o => o.userId === user._id).length;
      const totalSpent = db.orders
        .filter(o => o.userId === user._id && o.orderStatus !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      return {
        ...user,
        orderCount,
        totalSpent,
      };
    });

    return res.json({
      success: true,
      users: safeUsers,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = db.users.find(u => u._id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (status && ['active', 'disabled'].includes(status)) {
      user.status = status;
    }

    if (role && ['customer', 'admin', 'staff'].includes(role)) {
      user.role = role;
    }

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

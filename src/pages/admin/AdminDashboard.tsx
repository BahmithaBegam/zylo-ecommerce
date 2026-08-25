import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { DashboardStats, Order, Product } from '../../types/index.js';
import { formatINR } from '../../utils/formatters.js';
import api from '../../services/api.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<{
    monthlySales: Array<{ month: string; revenue: number; orders: number }>;
    categoryDistribution: Array<{ name: string; count: number; value: number }>;
  }>({ monthlySales: [], categoryDistribution: [] });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockList, setLowStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
          setRecentOrders(res.data.recentOrders);
          setLowStockList(res.data.lowStockList);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-200 rounded-3xl" />
          ))}
        </div>
        <div className="h-80 bg-zinc-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Store Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time business performance, revenue streams, and inventory health
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-zinc-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Sales</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900">
            {formatINR(stats.totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% from last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900">{stats.totalOrders}</div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{stats.pendingOrders} pending fulfillment</span>
          </div>
        </div>

        {/* Live Catalog Products */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Catalog</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900">{stats.totalProducts}</div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{stats.lowStockProducts} items low on stock</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Customers</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-zinc-900">{stats.totalUsers}</div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <span>Active registered buyers</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Revenue Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-zinc-900">Revenue Growth Trend</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Monthly gross transaction volume ($ USD)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlySales}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-zinc-900">Category Breakdown</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Product assortment distribution</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.categoryDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis type="number" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={10} width={90} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [val, 'Products']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h3 className="text-base font-black text-zinc-900">Recent Customer Orders</h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              All Orders <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-100">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {recentOrders.map(o => (
                  <tr key={o._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-zinc-900">{o.orderNumber}</td>
                    <td className="py-3 font-medium text-zinc-700">{o.userName}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 font-black text-zinc-900 text-right">{formatINR(o.totalAmount || o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
            </h3>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Manage Inventory
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockList.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">All inventory levels are healthy!</p>
            ) : (
              lowStockList.map((item: any) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-zinc-900 truncate">{item.name}</h4>
                    <p className="text-zinc-500 text-[11px]">SKU: {item.sku} • {item.category}</p>
                  </div>
                  <div className="text-right pl-3">
                    <span className="text-amber-800 font-black px-2 py-0.5 bg-amber-200/80 rounded-lg text-xs">
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

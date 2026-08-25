import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Grid,
  Users,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/admin', label: 'Dashboard & Metrics', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products & Inventory', icon: Package },
    { to: '/admin/orders', label: 'Order Management', icon: ShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: Grid },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/reviews', label: 'Review Moderation', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-zinc-300 flex flex-col justify-between shrink-0 border-r border-zinc-800">
        <div>
          {/* Logo & Admin Status */}
          <div className="p-5 border-b border-zinc-800">
            <Link to="/" className="flex flex-col gap-2.5 group">
              <div className="flex items-center gap-2.5">
                <img
                  src="/zylo-icon.svg"
                  alt="Zylo"
                  className="w-9 h-9 rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
                />
                <span className="text-xl font-black tracking-tight text-white leading-none">
                  Zylo
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-md self-start border border-amber-400/20">
                <ShieldCheck className="w-3 h-3" /> Admin Control
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Back to Live Store Link */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 text-xs font-bold transition-all w-full"
          >
            <Store className="w-4 h-4 text-indigo-400" /> Return to Store
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 overflow-y-auto min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Search, Heart, User as UserIcon } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.js';
import { useAuth } from '../../context/AuthContext.js';

export const MobileBottomNav: React.FC = () => {
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide mobile nav on admin routes or checkout for clean focus
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/shop', label: 'Categories', icon: Grid },
    { to: '/shop?focus=search', label: 'Search', icon: Search },
    {
      to: '/wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistCount,
    },
    {
      to: isAuthenticated ? '/profile' : '/login',
      label: isAuthenticated ? 'Account' : 'Sign In',
      icon: UserIcon,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-zinc-800 shadow-lg px-2 py-1 safe-area-bottom">
      <nav className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[60px] py-1 px-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

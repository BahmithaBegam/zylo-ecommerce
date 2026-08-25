import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Moon,
  Sun,
  Monitor,
  User,
  ShieldCheck,
  Bell,
  MapPin,
  Lock,
  LogOut,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Globe,
  CreditCard,
  Trash2,
  ShoppingBag,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    flashDeals: true,
    smsDelivery: false,
    newsletter: true,
  });

  const [savedPincode, setSavedPincode] = useState(() => {
    return localStorage.getItem('zylo_pincode') || '110001';
  });
  const [savedCity, setSavedCity] = useState(() => {
    return localStorage.getItem('zylo_city') || 'New Delhi, DL';
  });
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [pinInput, setPinInput] = useState(savedPincode);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length >= 4) {
      const cityMap: Record<string, string> = {
        '1': 'New Delhi, DL',
        '2': 'Lucknow, UP',
        '3': 'Ahmedabad, GJ',
        '4': 'Mumbai, MH',
        '5': 'Hyderabad, TS',
        '6': 'Bengaluru, KA',
        '7': 'Kolkata, WB',
        '8': 'Patna, BR',
        '9': 'Chandigarh, PB',
      };
      const firstDigit = pinInput.trim().charAt(0);
      const city = cityMap[firstDigit] || 'Metro Hub';
      setSavedPincode(pinInput.trim());
      setSavedCity(city);
      localStorage.setItem('zylo_pincode', pinInput.trim());
      localStorage.setItem('zylo_city', city);
      setIsEditingPin(false);
      success('Delivery location updated to ' + city + ' (' + pinInput.trim() + ')');
    }
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      success('Notification preferences updated.');
      return next;
    });
  };

  const handleClearCache = () => {
    localStorage.removeItem('zylo_cart');
    localStorage.removeItem('zylo_recent_searches');
    success('Temporary cache and search history cleared.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Preferences & System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Settings & Customization
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your visual theme, delivery location, account security, and notification alerts.
          </p>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> Edit Profile
            </Link>
          </div>
        )}
      </div>

      {/* 1. APPEARANCE & THEME CARD */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs dark:shadow-none space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Interface Theme</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose between high-contrast crisp Light mode or eye-friendly Dark mode.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800/80 uppercase">
            Active: {theme}
          </span>
        </div>

        {/* Theme Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </div>
              {theme === 'light' && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            {/* Visual Mini Mockup */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2">
              <div className="h-2 w-16 bg-zinc-900 rounded-full" />
              <div className="flex gap-1.5">
                <div className="h-4 w-12 bg-white rounded border border-zinc-200" />
                <div className="h-4 w-12 bg-white rounded border border-zinc-200" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3">
              Default crisp view with vibrant colors and optimal daylight readability.
            </p>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
              theme === 'dark'
                ? 'border-indigo-500 bg-zinc-950 ring-2 ring-indigo-500/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-white">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Mode</span>
              </div>
              {theme === 'dark' && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            {/* Visual Mini Mockup */}
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
              <div className="h-2 w-16 bg-white rounded-full" />
              <div className="flex gap-1.5">
                <div className="h-4 w-12 bg-zinc-800 rounded border border-zinc-700" />
                <div className="h-4 w-12 bg-zinc-800 rounded border border-zinc-700" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3">
              Sleek deep-slate styling designed for reduced glare and OLED energy efficiency.
            </p>
          </button>
        </div>
      </div>

      {/* 2. REGION & DELIVERY PREFERENCES */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs dark:shadow-none space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Default Delivery Hub</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Used for calculating live product stock, shipping rates, and express arrival dates.
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Selected Location</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>{savedCity}</span>
              <span className="font-mono text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 font-bold">
                {savedPincode}
              </span>
            </div>
          </div>

          {!isEditingPin ? (
            <button
              type="button"
              onClick={() => setIsEditingPin(true)}
              className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Change Location
            </button>
          ) : (
            <form onSubmit={handleSavePin} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit PIN"
                className="w-32 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-1.5 text-xs text-zinc-900 dark:text-white font-mono font-bold outline-none focus:border-indigo-600"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingPin(false)}
                className="px-2.5 py-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. NOTIFICATION PREFERENCES */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs dark:shadow-none space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Notification Channels</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Customize real-time dispatch alerts, courier tracking links, and special deals.
            </p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="py-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Order Status & Invoice Emails</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Receive instant confirmation with PDF receipt and tracking link after checkout.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={() => handleToggleNotification('orderUpdates')}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Flash Sale & Price Drop Alerts</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Get notified when items in your wishlist go on discount or limited stock.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.flashDeals}
              onChange={() => handleToggleNotification('flashDeals')}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Zylo VIP Weekly Digest</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Curated trends, new seasonal arrivals, and coupon codes once a week.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newsletter}
              onChange={() => handleToggleNotification('newsletter')}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. ACCOUNT & SESSION */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-xs dark:shadow-none space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Account & Data</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage your active session, security profile, and temporary cache.
            </p>
          </div>
        </div>

        {isAuthenticated && user ? (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white flex items-center justify-center font-black text-sm uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase mt-0.5">
                  Role: {user.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/orders"
                className="px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Orders
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-between">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              You are currently browsing as a guest. Sign in to sync your wishlist and order history.
            </div>
            <Link
              to="/login"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Local Storage & Cache</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Clear temporary offline cache, local search suggestions, and guest filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearCache}
            className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" /> Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};

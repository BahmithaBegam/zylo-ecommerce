import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Check, ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones, Lock, Zap } from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubscribed(true);
      success('Thank you for subscribing to Zylo insider deals & flash drops!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 text-sm border-t border-zinc-800">
      {/* 4 Value Pillars */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-800/50 text-violet-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Free Express Delivery</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Free dispatch on all orders over ₹999.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">100% Genuine Quality</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Directly verified brands & artisan hubs.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">7-Day Easy Replacement</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Instant doorstep return & instant refunds.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-pink-950/60 border border-pink-800/50 text-pink-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">24/7 Smart Support</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Live tracking updates & order assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/zylo-icon.svg"
                alt="Zylo"
                className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white leading-none">
                  Zylo
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-0.5">
                  Smart Shopping, Delivered.
                </span>
              </div>
            </Link>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Zylo brings you thousands of trending styles, premium modest fashion, high-performance electronics, organic beauty, and home accents at unbeatable factory-direct prices.
            </p>

            {/* Newsletter */}
            <div className="space-y-2.5">
              <h5 className="text-white font-bold text-xs">Join Zylo Club for Flash Drops & Coupons</h5>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl pl-3.5 pr-3 py-2 focus:outline-none focus:border-violet-500 placeholder:text-zinc-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1 shrink-0"
                >
                  {isSubscribed ? <Check className="w-3.5 h-3.5" /> : <>Subscribe <ArrowRight className="w-3 h-3" /></>}
                </button>
              </form>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Shop Departments</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop?category=Women" className="hover:text-white transition-colors">Women's Fashion & Sarees</Link></li>
              <li><Link to="/shop?category=Men" className="hover:text-white transition-colors">Men's Casual & Ethnic</Link></li>
              <li><Link to="/kids" className="hover:text-white transition-colors">Kids & Baby Essentials</Link></li>
              <li><Link to="/toys" className="hover:text-white transition-colors">Toys & STEM Games</Link></li>
              <li><Link to="/shop?category=Electronics" className="hover:text-white transition-colors">Electronics & Wearables</Link></li>
              <li><Link to="/shop?category=Home+%26+Living" className="hover:text-white transition-colors">Home, Living & Decor</Link></li>
              <li><Link to="/shop?category=Beauty" className="hover:text-white transition-colors">Beauty & Personal Care</Link></li>
              <li><Link to="/shop?category=Books+%26+Stationery" className="hover:text-white transition-colors">Books & Stationery</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders/track" className="hover:text-white transition-colors">Track Live Order</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Help Center & FAQs</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping & PIN Code Info</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Returns & Refunds Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* About & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">About Zylo</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Zylo Story</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Sell on Zylo</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Artisan Partnerships</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Privacy & Security</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment icons */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            © 2026 Zylo Marketplace Inc. All rights reserved. Smart Shopping, Delivered.
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
              <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit Bank Grade SSL
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md text-[10px] text-zinc-300 font-bold">
              <span>UPI / QR</span>
              <span>•</span>
              <span>CARDS</span>
              <span>•</span>
              <span>NET BANKING</span>
              <span>•</span>
              <span>COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

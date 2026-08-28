import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Sparkles,
  ShieldCheck,
  MapPin,
  Flame,
  Zap,
  CheckCircle2,
  TrendingUp,
  Tag,
  ArrowRight,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';
import { formatINR } from '../../utils/formatters.js';
import api from '../../services/api.js';

interface SuggestionProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  image: string;
}

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category') || '';

  const isHomeActive = location.pathname === '/';
  const isShopActive = location.pathname === '/shop' && !currentCategory;
  const isWomenActive = currentCategory.toLowerCase() === 'women';
  const isMenActive = currentCategory.toLowerCase() === 'men';
  const isKidsActive = location.pathname === '/kids' || currentCategory.toLowerCase() === 'kids';
  const isFootwearActive = currentCategory.toLowerCase() === 'footwear';
  const isBeautyActive = currentCategory.toLowerCase() === 'beauty';
  const isElectronicsActive = currentCategory.toLowerCase() === 'electronics';
  const isHomeLivingActive = currentCategory.toLowerCase().includes('home');
  const isToysActive = location.pathname === '/toys' || currentCategory.toLowerCase().includes('toy');
  const isBagsActive = currentCategory.toLowerCase().includes('bag');
  const isSportsActive = currentCategory.toLowerCase().includes('sport');
  const isBooksActive = currentCategory.toLowerCase().includes('book') || currentCategory.toLowerCase().includes('stationery');

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hoveredMegaMenu, setHoveredMegaMenu] = useState<string | null>(null);

  // Pin code delivery modal state
  const [userPincode, setUserPincode] = useState<string>(() => {
    return localStorage.getItem('zylo_pincode') || '110001';
  });
  const [userCity, setUserCity] = useState<string>(() => {
    return localStorage.getItem('zylo_city') || 'New Delhi';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [tempPincode, setTempPincode] = useState('');
  const [pinError, setPinError] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<any>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setShowSearchPopup(false);
    setHoveredMegaMenu(null);
  }, [location.pathname, location.search]);

  // Click outside listener for search & profile dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchPopup(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/products/search/suggestions', {
          params: { q: searchQuery.trim() },
        });
        if (res.data?.success && res.data.suggestions) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.warn('Search suggestions error:', err);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchPopup(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePincodeSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPincode.trim() || tempPincode.length < 4) {
      setPinError('Please enter a valid postal / PIN code');
      return;
    }
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
    const firstDigit = tempPincode.trim().charAt(0);
    const resolvedCity = cityMap[firstDigit] || 'Metro Hub';

    setUserPincode(tempPincode.trim());
    setUserCity(resolvedCity);
    localStorage.setItem('zylo_pincode', tempPincode.trim());
    localStorage.setItem('zylo_city', resolvedCity);
    setShowPinModal(false);
    setPinError('');
  };

  const handleMegaMenuEnter = (menuId: string) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setHoveredMegaMenu(menuId);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setHoveredMegaMenu(null);
    }, 150);
  };

  const trendingKeywords = [
    'Cotton Anarkali Kurta',
    'Banarasi Silk Saree',
    'Kids Party Frocks',
    'STEM Robotics Kit',
    'RC Drift Car',
    'Noise ANC Earbuds',
    'Men Oversized Tee',
    'Linen Co-ord Set',
  ];

  const navCategories = [
    {
      id: 'women',
      name: "Women's Fashion",
      path: '/shop?category=Women',
      badge: 'Trending',
      isHot: true,
      columns: [
        {
          title: 'Ethnic & Festive',
          links: [
            { name: 'Kurtas & Anarkali Suits', url: '/shop?category=Women&subcategory=Kurtis+%26+Suits' },
            { name: 'Sarees (Banarasi & Organza)', url: '/shop?category=Women&subcategory=Sarees' },
            { name: 'Sharara & Palazzo Sets', url: '/shop?category=Women&subcategory=Ethnic+Wear' },
            { name: 'Gota Patti & Jacquard Kurtis', url: '/shop?category=Women&subcategory=Ethnic+Wear' },
          ],
        },
        {
          title: 'Western & Daily Wear',
          links: [
            { name: 'Floral Dresses & Maxis', url: '/shop?category=Women&subcategory=Dresses' },
            { name: 'Ribbed Crop Tops & Tees', url: '/shop?category=Women&subcategory=Tops+%26+Tees' },
            { name: 'High-Rise Denim Jeans', url: '/shop?category=Women&subcategory=Jeans+%26+Trousers' },
            { name: 'Pleated Satin Skirts', url: '/shop?category=Women&subcategory=Skirts' },
          ],
        },
        {
          title: 'Co-ords & Outerwear',
          links: [
            { name: '2-Piece Linen Co-ords', url: '/shop?category=Women&subcategory=Co-ords' },
            { name: 'Tailored Power Blazers', url: '/shop?category=Women&subcategory=Western+Wear' },
            { name: 'Chunky Knit Sweaters', url: '/shop?category=Women&subcategory=Jackets+%26+Sweaters' },
            { name: 'Faux Leather Moto Jackets', url: '/shop?category=Women&subcategory=Jackets+%26+Sweaters' },
          ],
        },
      ],
    },
    {
      id: 'kids',
      name: 'Kids & Baby',
      path: '/kids',
      badge: 'Playful',
      columns: [
        {
          title: 'Girls Fashion',
          links: [
            { name: 'Dresses & Frocks', url: '/kids?subcategory=Girls+Dresses' },
            { name: 'Festive Lehengas & Gowns', url: '/kids?subcategory=Girls+Dresses' },
            { name: 'Tops, Tees & Skirts', url: '/kids?subcategory=Girls+Dresses' },
          ],
        },
        {
          title: 'Boys Fashion',
          links: [
            { name: 'Boys Clothing Sets', url: '/kids?subcategory=Boys+Clothing' },
            { name: 'Kurtas & Sherwanis', url: '/kids?subcategory=Boys+Clothing' },
            { name: 'Jeans & Cargo Pants', url: '/kids?subcategory=Boys+Clothing' },
          ],
        },
        {
          title: 'Baby & Care',
          links: [
            { name: '0–2 Years Rompers', url: '/kids?ageGroup=0-2+Years' },
            { name: 'Baby Care & Bedding', url: '/kids?subcategory=Baby+Clothing' },
            { name: 'Kids Footwear & Light Shoes', url: '/kids?subcategory=Kids+Footwear' },
            { name: 'School Bags & Water Bottles', url: '/kids?subcategory=School+Essentials' },
          ],
        },
      ],
    },
    {
      id: 'toys',
      name: 'Toys & Games',
      path: '/toys',
      badge: 'Fun',
      columns: [
        {
          title: 'Smart & Creative Play',
          links: [
            { name: 'STEM & Robotics Kits', url: '/toys?toyType=Educational+%26+STEM+Toys' },
            { name: 'Building Blocks & Magnetic Tiles', url: '/toys?toyType=Building+Blocks+%26+LEGO' },
            { name: '3D Puzzles & Brainteasers', url: '/toys?toyType=Puzzles+%26+Brainteasers' },
          ],
        },
        {
          title: 'Action & Electronics',
          links: [
            { name: 'Remote Control Cars & Crawlers', url: '/toys?toyType=Remote+Control' },
            { name: 'Dolls & Handcrafted Dollhouses', url: '/toys?toyType=Dolls+%26+Dollhouses' },
            { name: 'Superhero Action Figures', url: '/toys?toyType=Action+Figures' },
          ],
        },
      ],
    },
    {
      id: 'men',
      name: 'Men',
      path: '/shop?category=Men',
      columns: [
        {
          title: 'Casual & Streetwear',
          links: [
            { name: 'Graphic & Oversized Tees', url: '/shop?category=Men' },
            { name: 'Casual Shirts', url: '/shop?category=Men' },
            { name: 'Denim & Cargo Joggers', url: '/shop?category=Men' },
          ],
        },
        {
          title: 'Ethnic & Formal',
          links: [
            { name: 'Ethnic Kurta Pajamas', url: '/shop?category=Men' },
            { name: 'Formal Linen Shirts', url: '/shop?category=Men' },
            { name: 'Jackets & Hoodies', url: '/shop?category=Men' },
          ],
        },
      ],
    },
    {
      id: 'electronics',
      name: 'Electronics',
      path: '/shop?category=Electronics',
      badge: 'Next-Gen',
      columns: [
        {
          title: 'Personal Audio & Wearables',
          links: [
            { name: 'TWS Noise Cancelling Earbuds', url: '/shop?category=Electronics' },
            { name: 'AMOLED Bluetooth Smartwatches', url: '/shop?category=Electronics' },
            { name: 'Hi-Fi Over-Ear Headphones', url: '/shop?category=Electronics' },
          ],
        },
        {
          title: 'Accessories & Smart Home',
          links: [
            { name: 'Magnetic Fast Power Banks', url: '/shop?category=Electronics' },
            { name: '65W GaN Fast Chargers', url: '/shop?category=Electronics' },
            { name: 'Waterproof RGB Bluetooth Speakers', url: '/shop?category=Electronics' },
          ],
        },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xs select-none transition-colors duration-150 overflow-x-clip">
      {/* Top Banner Notice */}
      <div className="bg-zinc-950 text-white text-[11px] py-1.5 px-4 hidden sm:block font-medium border-b border-zinc-800 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-black uppercase text-[10px] tracking-wider border border-rose-500/30">
              <Zap className="w-3 h-3 fill-rose-400 text-rose-400" /> LIMITED TIME
            </span>
            <span className="text-zinc-200 font-bold tracking-wide">
              FREE SHIPPING ON ORDERS ABOVE ₹999
            </span>
            <span className="text-zinc-400 text-[10px]">
              • Use code <strong className="text-amber-300 font-mono">ZYLO100</strong> for Flat ₹100 OFF
            </span>
          </div>
          <div className="flex items-center gap-4 text-zinc-300 text-[11px]">
            <Link to="/deals" className="hover:text-amber-300 transition-colors flex items-center gap-1 font-bold text-amber-400">
              <Flame className="w-3 h-3 fill-amber-400" /> Flash Deals
            </Link>
            <span>•</span>
            <Link to="/orders/track" className="hover:text-white transition-colors flex items-center gap-1">
              <Package className="w-3 h-3" /> Track Order
            </Link>
            <span>•</span>
            <Link to="/settings" className="hover:text-white transition-colors flex items-center gap-1">
              <Settings className="w-3 h-3" /> Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-1.5 sm:gap-4 lg:gap-6 w-full min-w-0">
          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Open navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
              <img
                src="/zylo-icon.svg"
                alt="Zylo"
                className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-none font-display">
                    Zylo
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5 hidden xs:block">
                  Smart Shopping
                </span>
              </div>
            </Link>
          </div>

          {/* Delivery PIN Code Selector (Desktop/Tablet) */}
          <button
            onClick={() => {
              setTempPincode(userPincode);
              setShowPinModal(true);
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-left hover:bg-zinc-100/90 dark:hover:bg-zinc-800/90 border border-zinc-200/60 dark:border-zinc-800 transition-all shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight text-xs">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Deliver to</div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                <span className="truncate max-w-[85px]">{userCity.split(',')[0]}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">{userPincode}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </div>
            </div>
          </button>

          {/* Search Bar on Desktop/Tablet */}
          <div ref={searchRef} className="hidden md:block relative flex-1 max-w-lg lg:max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchPopup(true)}
                placeholder="Search Women's Fashion, Men's wear, Kids, Toys, Audio..."
                className="w-full bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm rounded-2xl pl-10 pr-10 py-2.5 border border-zinc-200/80 dark:border-zinc-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Popup dropdown (Trending + Live suggestions) */}
            {showSearchPopup && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 divide-y divide-zinc-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-150">
                {suggestions.length > 0 ? (
                  <>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5" /> Instant Matching Products
                      </span>
                      <Link
                        to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowSearchPopup(false)}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                      >
                        View all results →
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/40">
                      {suggestions.map(item => (
                        <Link
                          key={item._id}
                          to={`/product/${item._id}`}
                          onClick={() => setShowSearchPopup(false)}
                          className="flex items-center gap-3 p-3 hover:bg-indigo-50/60 dark:hover:bg-zinc-800/80 transition-colors group"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-100 dark:border-zinc-700"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-medium">
                                {item.category}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.brand}</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-zinc-900 dark:text-white">
                            {formatINR(item.price)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trendingKeywords.map(kw => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => {
                            setSearchQuery(kw);
                            setShowSearchPopup(false);
                            navigate(`/shop?search=${encodeURIComponent(kw)}`);
                          }}
                          className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition-colors"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons & Profile */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-500 hover:text-white transition-all shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-2 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-amber-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700" />
              )}
              <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hidden xl:inline">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-1.5 sm:p-2 text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="View Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-500 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-900">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-1.5 sm:p-2 text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-indigo-600 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-900">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Menu */}
            <div ref={profileRef} className="relative">
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-1 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 transition-all text-left"
                    aria-label="User profile menu"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-rose-500 text-white flex items-center justify-center font-black text-[11px] sm:text-xs uppercase shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[80px]">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold">
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden lg:block" />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 divide-y divide-zinc-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                        {user.role === 'admin' && (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Administrator
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-800"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-zinc-400" /> My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <Package className="w-3.5 h-3.5 text-zinc-400" /> My Orders & Timeline
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <Heart className="w-3.5 h-3.5 text-zinc-400" /> Saved Items ({wishlistCount})
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <Settings className="w-3.5 h-3.5 text-zinc-400" /> Settings & Theme
                        </Link>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-white bg-zinc-950 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl shadow-xs transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Row (Clean, dedicated full-width input on mobile) */}
        <div className="md:hidden pb-2 pt-0 w-full">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search fashion, sarees, electronics, toys..."
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-xl pl-8 pr-8 py-2 border border-zinc-200/80 dark:border-zinc-700/80 focus:border-indigo-500 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs"
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Modern Mega-Menu Navigation Bar (Desktop & Horizontal Scroll for Mobile) */}
      <div className="relative bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200/80 dark:border-zinc-800 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between w-full min-w-0">
          <nav className="flex items-center gap-1 sm:gap-1.5 py-1 overflow-x-auto no-scrollbar min-w-0 flex-1 w-full">
            {/* Home */}
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isHomeActive
                  ? 'bg-zinc-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Home
            </Link>

            {/* Categories All */}
            <Link
              to="/shop"
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isShopActive
                  ? 'bg-zinc-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Categories
            </Link>

            {/* Women */}
            <div
              onMouseEnter={() => handleMegaMenuEnter('women')}
              onMouseLeave={handleMegaMenuLeave}
              className="relative"
            >
              <Link
                to="/shop?category=Women"
                className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-1 transition-all ${
                  isWomenActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <span>Women</span>
                <ChevronDown className="w-3 h-3 opacity-75" />
              </Link>
            </div>

            {/* Men */}
            <div
              onMouseEnter={() => handleMegaMenuEnter('men')}
              onMouseLeave={handleMegaMenuLeave}
              className="relative"
            >
              <Link
                to="/shop?category=Men"
                className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-1 transition-all ${
                  isMenActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <span>Men</span>
                <ChevronDown className="w-3 h-3 opacity-75" />
              </Link>
            </div>

            {/* Dedicated Kids Link */}
            <div
              onMouseEnter={() => handleMegaMenuEnter('kids')}
              onMouseLeave={handleMegaMenuLeave}
              className="relative"
            >
              <Link
                to="/kids"
                className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1 ${
                  isKidsActive
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <span>Kids</span>
                <ChevronDown className="w-3 h-3 opacity-75" />
              </Link>
            </div>

            {/* Footwear */}
            <Link
              to="/shop?category=Footwear"
              className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                isFootwearActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Footwear
            </Link>

            {/* Beauty */}
            <Link
              to="/shop?category=Beauty"
              className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                isBeautyActive
                  ? 'bg-pink-600 text-white font-bold shadow-xs'
                  : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Beauty
            </Link>

            {/* Electronics */}
            <div
              onMouseEnter={() => handleMegaMenuEnter('electronics')}
              onMouseLeave={handleMegaMenuLeave}
              className="relative"
            >
              <Link
                to="/shop?category=Electronics"
                className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-1 transition-all ${
                  isElectronicsActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <span>Electronics</span>
                <ChevronDown className="w-3 h-3 opacity-75" />
              </Link>
            </div>

            {/* Home & Living */}
            <Link
              to="/shop?category=Home+%26+Living"
              className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                isHomeLivingActive
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Home & Living
            </Link>

            {/* Dedicated Toys Link */}
            <div
              onMouseEnter={() => handleMegaMenuEnter('toys')}
              onMouseLeave={handleMegaMenuLeave}
              className="relative"
            >
              <Link
                to="/toys"
                className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1 ${
                  isToysActive
                    ? 'bg-cyan-600 text-white font-bold shadow-xs'
                    : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <span>Toys</span>
                <ChevronDown className="w-3 h-3 opacity-75" />
              </Link>
            </div>

            {/* Bags & Accessories */}
            <Link
              to="/shop?category=Bags+%26+Accessories"
              className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                isBagsActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Bags
            </Link>

            {/* Sports & Fitness */}
            <Link
              to="/shop?category=Sports+%26+Fitness"
              className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                isSportsActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Sports
            </Link>

            {/* Books & Stationery */}
            <Link
              to="/shop?category=Books+%26+Stationery"
              className={`px-2.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
                isBooksActive
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              Books & Stationery
            </Link>
          </nav>

          {/* Quick Deals & Bestsellers Direct Pills */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-zinc-200 dark:border-zinc-800">
            <Link
              to="/deals"
              className="px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 fill-rose-600 dark:fill-rose-400" />
              <span>⚡ Flash Deals</span>
            </Link>
            <Link
              to="/bestsellers"
              className="px-3 py-1.5 rounded-xl text-xs font-black text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors"
            >
              🏆 Best Sellers
            </Link>
          </div>
        </div>

        {/* Mega Menu Dropdown Panels */}
        {hoveredMegaMenu && (
          <div
            onMouseEnter={() => handleMegaMenuEnter(hoveredMegaMenu)}
            onMouseLeave={handleMegaMenuLeave}
            className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              {(() => {
                const activeCat = navCategories.find(c => c.id === hoveredMegaMenu);
                if (!activeCat) return null;

                return (
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-zinc-900 dark:text-white">{activeCat.name} Collection</span>
                        {activeCat.badge && (
                          <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {activeCat.badge}
                          </span>
                        )}
                      </div>
                      <Link
                        to={activeCat.path}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>View All {activeCat.name}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      {activeCat.columns.map((col, idx) => (
                        <div key={idx} className="space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            {col.title}
                          </h4>
                          <ul className="space-y-1.5">
                            {col.links.map((link, lIdx) => (
                              <li key={lIdx}>
                                <Link
                                  to={link.url}
                                  className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:font-bold transition-all block py-0.5"
                                >
                                  {link.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[96px] sm:top-[112px] bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-5 max-h-[calc(100vh-96px)] sm:max-h-[80vh] overflow-y-auto overflow-x-hidden w-full max-w-full z-40 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-3">
            {/* Delivery address button in mobile */}
            <button
              onClick={() => {
                setTempPincode(userPincode);
                setShowPinModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-zinc-800 rounded-xl text-left text-xs font-bold text-indigo-950 dark:text-indigo-300 border border-indigo-100 dark:border-zinc-700"
            >
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <div>
                  Deliver to: {userCity} ({userPincode})
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">Tap to change PIN code</div>
              </div>
            </button>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/shop?category=Women"
                className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  isWomenActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-purple-50 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200'
                }`}
              >
                <span>👗 Women's Fashion</span>
              </Link>
              <Link
                to="/deals"
                className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  location.pathname === '/deals'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-200'
                }`}
              >
                <span>⚡ Flash Deals</span>
              </Link>
              <Link
                to="/kids"
                className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  isKidsActive
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                }`}
              >
                <span>👶 Kids Wear</span>
              </Link>
              <Link
                to="/toys"
                className={`p-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  isToysActive
                    ? 'bg-cyan-600 text-white'
                    : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-200'
                }`}
              >
                <span>🧸 Toys</span>
              </Link>
            </div>

            <div className="py-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">
                All Departments
              </p>
              <div className="grid grid-cols-1 gap-1">
                <Link
                  to="/shop"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isShopActive
                      ? 'bg-zinc-900 dark:bg-indigo-600 text-white font-bold'
                      : 'font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Explore Full Catalog (550+ Products)
                </Link>
                <Link
                  to="/shop?category=Women"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isWomenActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Women's Western & Ethnic
                </Link>
                <Link
                  to="/shop?category=Men"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isMenActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Men's Streetwear & Formal
                </Link>
                <Link
                  to="/shop?category=Electronics"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isElectronicsActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Smartwatches, TWS & Tech
                </Link>
                <Link
                  to="/shop?category=Home+%26+Living"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isHomeLivingActive
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Home, Living & Decor
                </Link>
                <Link
                  to="/shop?category=Footwear"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isFootwearActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Sneakers & Ethnic Juttis
                </Link>
                <Link
                  to="/shop?category=Beauty"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isBeautyActive
                      ? 'bg-pink-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Skincare & Beauty Essentials
                </Link>
                <Link
                  to="/shop?category=Bags+%26+Accessories"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isBagsActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Bags, Wallets & Luggage
                </Link>
                <Link
                  to="/shop?category=Sports+%26+Fitness"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isSportsActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Sports, Gym & Fitness
                </Link>
                <Link
                  to="/shop?category=Books+%26+Stationery"
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                    isBooksActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Books, Journals & Stationery
                </Link>
              </div>
            </div>

            <div className="py-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
              <Link to="/orders" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                My Orders & Timeline
              </Link>
              <Link to="/orders/track" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Track Order by Tracking ID
              </Link>
              <Link to="/settings" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Settings & Theme</span>
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">{theme} Mode</span>
              </Link>
              <Link to="/faq" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Customer Support & Help
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* PIN Code Delivery Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Select Delivery Location</h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="w-7 h-7 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Enter your 6-digit postal PIN code to see exact delivery times and item availability in your area.
            </p>

            <form onSubmit={handlePincodeSave} className="space-y-3">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={tempPincode}
                  onChange={e => setTempPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit PIN code (e.g. 110001)"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-mono font-bold rounded-xl px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none"
                  autoFocus
                />
                {pinError && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{pinError}</p>}
              </div>

              {/* Popular quick PIN suggestions */}
              <div className="pt-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Popular Cities
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: '110001', city: 'Delhi' },
                    { code: '400001', city: 'Mumbai' },
                    { code: '560001', city: 'Bengaluru' },
                    { code: '700001', city: 'Kolkata' },
                    { code: '500001', city: 'Hyderabad' },
                  ].map(p => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setTempPincode(p.code)}
                      className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      {p.city} ({p.code})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Apply Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

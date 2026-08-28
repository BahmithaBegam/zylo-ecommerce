import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  Share2,
  Package,
  Sparkles,
  Clock,
  UserCheck,
  MessageSquarePlus,
  X,
  Tag,
  Percent,
  Ruler,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Product, Review } from '../types/index.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useToast } from '../context/ToastContext.js';
import { formatINR } from '../utils/formatters.js';
import { handleImageError, getCategoryFallback, getProductImageUrl } from '../utils/imageFallbacks.js';
import api from '../services/api.js';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction states
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'features' | 'reviews'>('description');
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Delivery check state
  const [pincode, setPincode] = useState<string>(() => localStorage.getItem('zylo_pincode') || '110001');
  const [deliveryStatus, setDeliveryStatus] = useState('Free Delivery by Tomorrow, 5:00 PM');

  // Review submission modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        setLoading(true);
        setSelectedImage(0);

        const prodRes = await api.get(`/products/${id}`);

        if (prodRes.data?.success && prodRes.data.product) {
          const prod: Product = prodRes.data.product;
          setProduct(prod);
          setSelectedColor(prod.colors?.[0] || '');
          setSelectedSize(prod.sizes?.[0] || '');

          // If backend already included reviews and related products
          if (prodRes.data.reviews) {
            setReviews(prodRes.data.reviews);
          }
          if (prodRes.data.relatedProducts && prodRes.data.relatedProducts.length > 0) {
            setRelatedProducts(prodRes.data.relatedProducts);
          } else if (prod.category) {
            // Optional fetch related products from same category
            try {
              const relRes = await api.get('/products', {
                params: { category: prod.category, limit: 6 },
              });
              if (relRes.data?.products) {
                setRelatedProducts(relRes.data.products.filter((p: Product) => p._id !== prod._id));
              }
            } catch {
              // Ignore related products fetch error
            }
          }

          // Fetch additional reviews asynchronously without blocking page render
          try {
            const revRes = await api.get(`/reviews/${id}`);
            if (revRes.data?.success && Array.isArray(revRes.data.reviews)) {
              setReviews(revRes.data.reviews);
            }
          } catch {
            // Fallback reviews already set from prodRes
          }
        } else {
          error('Product details could not be retrieved.');
        }
      } catch (err: any) {
        console.error('Error loading product:', err);
        error(err.message || 'Product not found.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-zinc-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-zinc-200 rounded w-1/4" />
            <div className="h-10 bg-zinc-200 rounded w-3/4" />
            <div className="h-6 bg-zinc-200 rounded w-1/3" />
            <div className="h-24 bg-zinc-200 rounded" />
            <div className="h-12 bg-zinc-200 rounded-2xl w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 text-center p-8 bg-white rounded-3xl border border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-zinc-500 mb-6">The requested product could not be located in our catalog.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    const added = await addToCart(product._id, quantity, selectedColor, selectedSize);
    if (added) {
      setTimeout(() => setIsAdding(false), 1000);
    } else {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      error('Please sign in to proceed with direct checkout.');
      navigate('/login?redirect=/checkout');
      return;
    }
    const added = await addToCart(product._id, quantity, selectedColor, selectedSize);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      info('Product link copied to clipboard!');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      error('Please log in to submit a review.');
      return;
    }

    if (!reviewTitle.trim() || !reviewComment.trim()) {
      error('Please provide both a title and review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/reviews/${product._id}`, {
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      if (res.data?.success) {
        success(res.data.message || 'Review submitted successfully!');
        setReviews([res.data.review, ...reviews]);
        setIsReviewModalOpen(false);
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (err: any) {
      error(err.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex-wrap">
        <Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={product.category === 'Kids' ? '/kids' : product.category === 'Toys & Games' ? '/toys' : `/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-zinc-900 dark:hover:text-white transition-colors font-bold text-indigo-600 dark:text-indigo-400"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Stage: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] sm:aspect-square w-full bg-zinc-100 dark:bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-md">
            <img
              src={getProductImageUrl([product.images[selectedImage]], product.category)}
              alt={`${product.name} - View ${selectedImage + 1}`}
              onError={(e) => handleImageError(e, product.category)}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount > 0 && (
                <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  -{product.discount}% OFF
                </span>
              )}
              {product.bestseller && (
                <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  ★ Bestseller
                </span>
              )}
              {product.isFlashDeal && (
                <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-white" /> Flash Deal
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center shadow-md transition-all"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isSaved
                    ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-zinc-800'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 dark:fill-rose-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails Row (Thumbnails 1-4) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === idx
                      ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-900 scale-102 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                  aria-label={`View ${idx + 1}`}
                >
                  <img
                    src={getProductImageUrl([img], product.category)}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    onError={(e) => handleImageError(e, product.category)}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/60 text-white px-1 py-0.2 rounded">
                    {idx === 0 ? 'Front' : idx === 1 ? 'Angle' : idx === 2 ? 'Detail' : 'Look'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Trust Highlights under image */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <div className="flex flex-col items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Free Express Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">7-Day Doorstep Return</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">100% Genuine Certified</span>
            </div>
          </div>
        </div>

        {/* Right Info & Purchasing Block (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{product.brand}</span>
              <span className="text-[11px]">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating & reviews */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-xs font-black">
                <span>{product.rating}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  const el = document.getElementById('product-tabs');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
              >
                ({reviews.length || product.reviewCount} Ratings & Reviews)
              </button>
            </div>

            {/* Price Box */}
            <div className="pt-2 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-zinc-400 dark:text-zinc-500 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {product.discount}% OFF Special Deal
                </span>
              )}
            </div>

            {/* Saree / Fabric / Occasion Badges */}
            {(product.fabric || product.occasion || product.ageGroup || product.toyType) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.fabric && (
                  <span className="text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-lg">
                    🧵 Fabric: {product.fabric}
                  </span>
                )}
                {product.occasion && (
                  <span className="text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg">
                    ✨ Occasion: {product.occasion}
                  </span>
                )}
                {product.ageGroup && (
                  <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-lg">
                    👶 Age Group: {product.ageGroup}
                  </span>
                )}
                {product.toyType && (
                  <span className="text-xs font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-2.5 py-1 rounded-lg">
                    🧸 Category: {product.toyType}
                  </span>
                )}
              </div>
            )}

            {/* Bank & Coupon Offers Box */}
            <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-300">
                <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Available Offers & Coupons</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.2 rounded font-mono">
                    ZYLO100
                  </span>
                  <span>Flat ₹100 OFF on orders over ₹999. Use code at checkout.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-indigo-800 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.2 rounded">
                    Bank Offer
                  </span>
                  <span>10% Instant Discount up to ₹500 on HDFC, SBI, & ICICI Bank Cards.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded">
                    UPI Special
                  </span>
                  <span>Flat ₹50 cashback on payments via Google Pay, PhonePe or Paytm.</span>
                </div>
              </div>
            </div>

            {/* Delivery & Pincode Checker */}
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Delivery Options
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-200 dark:border-emerald-900">
                  FREE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter PIN code"
                  className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white w-36 outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('zylo_pincode', pincode);
                    setDeliveryStatus('Delivery by Tomorrow, 5:00 PM (Verified)');
                    success(`Pincode ${pincode} verified for Free Express Shipping!`);
                  }}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-indigo-600 dark:bg-zinc-100 dark:hover:bg-indigo-500 text-white dark:text-zinc-900 dark:hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Verify
                </button>
              </div>
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex flex-col gap-1 pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>{deliveryStatus}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Cash on Delivery (COD) available for this item</span>
                </div>
              </div>
            </div>

            {/* Variants Picker */}
            <div className="space-y-4 pt-2">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                    <span>
                      Color: <strong className="text-indigo-600 dark:text-indigo-400">{selectedColor}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl border font-bold transition-all ${
                          selectedColor === color
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes + Size Guide */}
              {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Standard' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                    <span>
                      Size: <strong className="text-indigo-600 dark:text-indigo-400">{selectedSize}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Ruler className="w-3 h-3" /> Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`text-xs px-4 py-2 rounded-xl border font-bold transition-all ${
                          selectedSize === size
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Purchasing Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-3.5 py-3 text-sm font-black text-zinc-900 dark:text-white min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3.5 py-3 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdding}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  isAdding
                    ? 'bg-emerald-600 text-white'
                    : product.stock === 0
                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900'
                }`}
              >
                {isAdding ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" /> Buy Now with 1-Click
            </button>
          </div>
        </div>
      </div>

      {/* Product Tabs: Description, Specs, Features, Reviews */}
      <div id="product-tabs" className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'description'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Description & Highlights
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Key Features
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm">
              <p>{product.description}</p>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 mt-4">
                <h4 className="font-bold text-zinc-900 dark:text-white mb-1">Manufacturer Warranty & Care:</h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs">{product.warranty}</p>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {Object.entries(product.specifications || {}).map(([key, val]) => (
                <div key={key} className="grid grid-cols-2 p-3.5 text-xs sm:text-sm">
                  <span className="font-semibold text-zinc-500 dark:text-zinc-400 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="max-w-2xl space-y-3">
              {product.features?.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Summary Header */}
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-4xl font-black text-zinc-900 dark:text-white">{product.rating}</div>
                  <div className="flex text-amber-400 justify-center md:justify-start my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{reviews.length} verified buyer ratings</div>
                </div>

                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-6 py-3 bg-zinc-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-zinc-900 dark:hover:text-white font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center gap-2"
                >
                  <MessageSquarePlus className="w-4 h-4" /> Write a Review
                </button>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
                  No customer reviews yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div
                      key={rev._id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                            {rev.userName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              {rev.userName}
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-semibold border border-emerald-200 dark:border-emerald-900">
                                  <UserCheck className="w-3 h-3" /> Verified Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{rev.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">Similar Products You May Like</h2>
            <Link
              to={product.category === 'Kids' ? '/kids' : product.category === 'Toys & Games' ? '/toys' : `/shop?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View More in {product.category} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Size & Fitting Guide</h3>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {product.category === 'Sarees' ? (
              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <p>
                  <strong>Saree Dimensions:</strong> 5.5 meters standard drape length + 0.8 meters unstitched matching blouse piece attached at end of saree.
                </p>
                <p>
                  <strong>Blouse Fitting:</strong> Can be customized and stitched to sizes 32 to 44 inches bust.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Chest (in)</th>
                      <th className="p-2.5">Waist (in)</th>
                      <th className="p-2.5">Length (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 text-zinc-900 dark:text-zinc-200">
                    <tr>
                      <td className="p-2.5 font-bold">S / 3-4Y</td>
                      <td className="p-2.5">24 - 26</td>
                      <td className="p-2.5">22 - 24</td>
                      <td className="p-2.5">24</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">M / 5-6Y</td>
                      <td className="p-2.5">26 - 28</td>
                      <td className="p-2.5">24 - 26</td>
                      <td className="p-2.5">28</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">L / 7-8Y</td>
                      <td className="p-2.5">28 - 30</td>
                      <td className="p-2.5">26 - 28</td>
                      <td className="p-2.5">32</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">XL / 9-10Y</td>
                      <td className="p-2.5">30 - 32</td>
                      <td className="p-2.5">28 - 30</td>
                      <td className="p-2.5">36</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={() => setShowSizeGuide(false)}
              className="mt-6 w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Write a Review</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Share your honest feedback on {product.name}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 ml-2">{reviewRating} out of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">Review Headline</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="e.g., Exceeded my expectations, premium finish"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">Detailed Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike? How does it perform?"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-zinc-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-zinc-900 dark:hover:text-white font-bold text-xs rounded-xl transition-colors shadow-md disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

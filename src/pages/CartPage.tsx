import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
  Check,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { formatINR } from '../utils/formatters.js';
import { handleImageError, getCategoryFallback } from '../utils/imageFallbacks.js';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountType, setAppliedDiscountType] = useState<'flat' | 'percentage' | null>(null);
  const [appliedDiscountValue, setAppliedDiscountValue] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'ZYLO100') {
      if (cart && cart.subtotal < 999) {
        error('Coupon ZYLO100 requires minimum order value of ₹999');
        return;
      }
      setAppliedDiscountType('flat');
      setAppliedDiscountValue(100);
      setAppliedCoupon('ZYLO100 (₹100 OFF)');
      success('Coupon ZYLO100 applied! Flat ₹100 discount deducted.');
      setCouponCode('');
    } else if (code === 'ZYLO15') {
      setAppliedDiscountType('percentage');
      setAppliedDiscountValue(0.15);
      setAppliedCoupon('ZYLO15 (15% OFF)');
      success('Coupon ZYLO15 applied! 15% discount deducted.');
      setCouponCode('');
    } else {
      error('Invalid promo code. Try "ZYLO100" or "ZYLO15".');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscountType(null);
    setAppliedDiscountValue(0);
    setAppliedCoupon('');
    info('Promo coupon removed.');
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="Looks like you haven't added any products to your bag yet. Explore our curated collections to find your next favorite."
          actionText="Start Shopping"
          actionHref="/shop"
        />
      </div>
    );
  }

  const subtotal = cart.subtotal;
  let discountAmount = 0;
  if (appliedDiscountType === 'flat') {
    discountAmount = Math.min(appliedDiscountValue, subtotal);
  } else if (appliedDiscountType === 'percentage') {
    discountAmount = Math.round(subtotal * appliedDiscountValue);
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const freeShippingThreshold = 999;
  const shipping = discountedSubtotal >= freeShippingThreshold ? 0 : 79;
  const tax = Math.round(discountedSubtotal * 0.05); // 5% GST
  const grandTotal = discountedSubtotal + shipping + tax;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Shopping Bag</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Bag
        </button>
      </div>

      {/* Free Shipping Progress Alert */}
      <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-200 font-black">
            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {remainingForFreeShipping === 0
              ? '🎉 You have unlocked Free Express Shipping!'
              : `Add ${formatINR(remainingForFreeShipping)} more for FREE Express Shipping!`}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Cart Split: Items Column & Summary Sticky Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {cart.items.map((item, index) => (
            <div
              key={`${item.productId}-${item.selectedColor}-${item.selectedSize}-${index}`}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all hover:border-indigo-200 dark:hover:border-indigo-800"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Link to={`/product/${item.productId}`} className="shrink-0">
                  <img
                    src={item.image || getCategoryFallback('general')}
                    alt={item.name}
                    onError={(e) => handleImageError(e, 'general')}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800"
                  />
                </Link>

                <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[10px] font-black tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                    {(item as any).brand || 'Zylo'}
                  </span>
                  <Link
                    to={`/product/${item.productId}`}
                    className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block"
                  >
                    {item.name}
                  </Link>

                  {/* Attributes */}
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium pt-0.5">
                    {item.selectedSize && <span>Size: <strong className="text-zinc-800 dark:text-zinc-200">{item.selectedSize}</strong></span>}
                    {item.selectedColor && (
                      <>
                        <span>•</span>
                        <span>Color: <strong className="text-zinc-800 dark:text-zinc-200">{item.selectedColor}</strong></span>
                      </>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div className="text-sm font-black text-zinc-900 dark:text-white pt-1">
                    {formatINR(item.price)}
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Subtotal & Delete */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                {/* Quantity Control */}
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor, item.selectedSize)}
                    disabled={item.quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black font-mono text-zinc-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor, item.selectedSize)}
                    className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-zinc-950 dark:text-white">
                    {formatINR(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedSize)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Value Guarantees Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-[11px]">256-Bit SSL Secure</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-[11px]">7-Day Easy Returns</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 col-span-2 sm:col-span-1">
              <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-semibold text-[11px]">Verified Fast Dispatch</span>
            </div>
          </div>
        </div>

        {/* Order Summary Sticky Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-6 shadow-md space-y-6">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Order Summary
            </h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Promo or Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ZYLO100 / ZYLO15"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="flex-1 uppercase font-mono text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-zinc-950 hover:bg-indigo-600 dark:bg-white dark:hover:bg-indigo-500 text-white dark:text-zinc-900 dark:hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {appliedCoupon}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-rose-600 dark:text-rose-400 hover:underline font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Breakdown List */}
            <div className="space-y-2.5 text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Bag Subtotal ({cart.itemCount} items)</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Shipping Fee</span>
                {shipping === 0 ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                ) : (
                  <span className="font-bold text-zinc-900 dark:text-white">{formatINR(shipping)}</span>
                )}
              </div>

              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Estimated Taxes (GST 5%)</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatINR(tax)}</span>
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline">
                <span className="text-base font-black text-zinc-900 dark:text-white">Grand Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                    {formatINR(grandTotal)}
                  </span>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500">Inclusive of all taxes</div>
                </div>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Link
              to="/checkout"
              className="w-full py-4 bg-zinc-950 hover:bg-indigo-600 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              🔒 Safe & Encrypted Payment with UPI, Cards & Net Banking
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

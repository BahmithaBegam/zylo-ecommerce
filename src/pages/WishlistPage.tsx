import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { ProductCard } from '../components/common/ProductCard.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const WishlistPage: React.FC = () => {
  const { wishlistProducts, wishlistCount, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { success } = useToast();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 sm:p-10 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">My Wishlist</h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          Please sign in to view and manage your saved wishlist products across all your devices.
        </p>
        <Link
          to="/login?redirect=/wishlist"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          Sign In to Zylo
        </Link>
      </div>
    );
  }

  if (!loading && wishlistCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save the products you love to your personal wishlist so you can easily purchase them whenever you are ready."
          actionText="Continue Shopping"
          actionHref="/shop"
        />
      </div>
    );
  }

  const handleMoveAllToCart = async () => {
    let count = 0;
    for (const prod of wishlistProducts) {
      if (prod.stock > 0) {
        await addToCart(prod._id, 1, prod.colors?.[0], prod.sizes?.[0]);
        count++;
      }
    }
    if (count > 0) {
      success(`Moved ${count} item(s) to your shopping cart!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">My Wishlist</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {wishlistCount} {wishlistCount === 1 ? 'saved product' : 'saved products'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/shop"
            className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            Continue Shopping
          </Link>
          {wishlistCount > 0 && (
            <button
              onClick={handleMoveAllToCart}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Move All to Cart
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistProducts.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

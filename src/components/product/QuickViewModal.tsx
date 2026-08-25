import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Truck, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';
import { useToast } from '../../context/ToastContext.js';
import { formatINR } from '../../utils/formatters.js';
import { handleImageError, getCategoryFallback, getProductImageUrl } from '../../utils/imageFallbacks.js';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { success } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const inWish = isInWishlist(product._id);
  const activeColor = selectedColor || product.colors?.[0] || 'Standard';
  const activeSize = selectedSize || product.sizes?.[0] || 'Standard';
  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(
      product._id,
      quantity,
      activeColor,
      activeSize
    );
    setIsAdding(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-zinc-100/80 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media Gallery */}
        <div className="w-full md:w-1/2 p-6 bg-zinc-50 flex flex-col justify-between">
          <div className="relative aspect-4/5 rounded-2xl overflow-hidden bg-white border border-zinc-200/80 group">
            <img
              src={getProductImageUrl([images[selectedImage]], product.category)}
              alt={product.name}
              onError={(e) => handleImageError(e, product.category)}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                {product.badge}
              </span>
            )}
            {product.discount > 0 && (
              <span className="absolute bottom-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Thumbnail ${idx + 1}`}
                >
                  <img
                    src={getProductImageUrl([img], product.category)}
                    alt=""
                    onError={(e) => handleImageError(e, product.category)}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-zinc-400 font-normal text-[10px]">({product.reviewCount})</span>
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-black text-zinc-900 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-zinc-900">{formatINR(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm font-semibold text-zinc-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-black text-rose-600">
                  {product.discount}% OFF
                </span>
              )}
              {product.freeDelivery && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                  Free Delivery
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Fabric / Spec badges if applicable */}
            {product.fabric && (
              <div className="text-xs bg-zinc-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="font-bold text-zinc-700">Fabric:</span>
                <span className="text-zinc-900 font-medium">{product.fabric}</span>
                {product.occasion && (
                  <>
                    <span className="text-zinc-300">•</span>
                    <span className="font-bold text-zinc-700">Occasion:</span>
                    <span className="text-zinc-900 font-medium">{product.occasion}</span>
                  </>
                )}
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Color: <span className="text-zinc-900">{activeColor}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                        activeColor === col
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Size: <span className="text-zinc-900">{activeSize}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold border transition-all ${
                        activeSize === sz
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fast 2-3 Day Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine Certified</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-zinc-100 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 h-10 px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-zinc-900 font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-zinc-900 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock <= 0}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.stock <= 0 ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product._id)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  inWish
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
                title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            <Link
              to={`/product/${product._id}`}
              onClick={onClose}
              className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 py-1"
            >
              <span>View Full Product Specifications & Reviews</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

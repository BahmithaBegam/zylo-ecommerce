import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Product } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const activeColor = selectedColor || product.colors[0];
  const activeSize = selectedSize || product.sizes[0];
  const isSaved = isInWishlist(product._id);

  const handleAddToCart = async () => {
    setIsAdded(true);
    await addToCart(product._id, quantity, activeColor, activeSize);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === idx ? 'border-indigo-600 scale-95' : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Controls */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>

              <h2 className="text-xl font-bold text-zinc-900 leading-snug">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-zinc-800">{product.rating}</span>
                <span className="text-xs text-zinc-400">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-black text-zinc-900">${product.price.toFixed(2)}</span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-zinc-400 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
                {product.discount > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Save {product.discount}%
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-600 mt-3 line-clamp-3 leading-relaxed">
                {product.description}
              </p>

              {/* Variants */}
              <div className="mt-5 space-y-4">
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">Color: {activeColor}</label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map(c => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                            activeColor === c
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Standard' && (
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">Size: {activeSize}</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                            activeSize === s
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                              : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-5 border-t border-zinc-100 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-zinc-600 hover:bg-zinc-200 transition-colors text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-zinc-900 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-zinc-600 hover:bg-zinc-200 transition-colors text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : product.stock === 0
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-900 hover:bg-indigo-600 text-white active:scale-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`p-3 rounded-xl border transition-all ${
                    isSaved
                      ? 'border-rose-200 bg-rose-50 text-rose-600'
                      : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              {/* View Full Details Link */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="flex items-center gap-1 text-zinc-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Free Returns within 30 days
                </span>
                <Link
                  to={`/product/${product._id}`}
                  onClick={onClose}
                  className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                >
                  Full Details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

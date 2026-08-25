import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types/index.js';
import api from '../services/api.js';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface WishlistContextType {
  wishlistProducts: Product[];
  wishlistIds: string[];
  wishlistCount: number;
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { success, error, info } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistProducts([]);
      setWishlistIds([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      if (response.data.success) {
        const products: Product[] = response.data.wishlist?.products || response.data.products || [];
        const ids: string[] = response.data.wishlist?.productIds || products.map(p => p._id) || [];
        setWishlistProducts(products);
        setWishlistIds(Array.from(new Set(ids)));
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      error('Please log in to save items to your wishlist.');
      return false;
    }

    const wasWishlisted = wishlistIds.includes(productId);

    // Optimistic local state update
    if (wasWishlisted) {
      setWishlistIds(prev => prev.filter(id => id !== productId));
      setWishlistProducts(prev => prev.filter(p => p._id !== productId));
    } else {
      setWishlistIds(prev => Array.from(new Set([...prev, productId])));
    }

    try {
      const response = await api.post('/wishlist/toggle', { productId });
      if (response.data.success) {
        const isSaved = response.data.isSaved ?? !wasWishlisted;
        if (isSaved) {
          success(response.data.message || 'Added to your wishlist!');
        } else {
          info(response.data.message || 'Removed from wishlist.');
        }

        if (response.data.wishlist) {
          if (response.data.wishlist.products) {
            setWishlistProducts(response.data.wishlist.products);
          }
          if (response.data.wishlist.productIds) {
            setWishlistIds(Array.from(new Set(response.data.wishlist.productIds)));
          }
        }
        return isSaved;
      } else {
        // Rollback
        await fetchWishlist();
        return wasWishlisted;
      }
    } catch (err: any) {
      // Rollback on error
      await fetchWishlist();
      error(err.response?.data?.message || err.message || 'Could not update wishlist.');
      return wasWishlisted;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;

    // Optimistic local update
    setWishlistIds(prev => prev.filter(id => id !== productId));
    setWishlistProducts(prev => prev.filter(p => p._id !== productId));

    try {
      const response = await api.delete(`/wishlist/${productId}`);
      if (response.data.success) {
        info('Removed from wishlist.');
        if (response.data.wishlist) {
          if (response.data.wishlist.products) {
            setWishlistProducts(response.data.wishlist.products);
          }
          if (response.data.wishlist.productIds) {
            setWishlistIds(Array.from(new Set(response.data.wishlist.productIds)));
          }
        }
      } else {
        await fetchWishlist();
      }
    } catch (err: any) {
      await fetchWishlist();
      error(err.response?.data?.message || err.message || 'Failed to remove from wishlist.');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistProducts,
        wishlistIds,
        wishlistCount: wishlistIds.length,
        loading,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '../types/index.js';
import api from '../services/api.js';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, selectedColor?: string, selectedSize?: string) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => Promise<void>;
  removeFromCart: (productId: string, selectedColor?: string, selectedSize?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (err: any) {
      console.warn('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (
    productId: string,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      error('Please sign in to add items to your shopping cart.');
      return false;
    }

    try {
      const response = await api.post('/cart', {
        productId,
        quantity,
        selectedColor,
        selectedSize,
      });

      if (response.data.success) {
        success(response.data.message || 'Item added to cart!');
        await fetchCart();
        return true;
      }
      return false;
    } catch (err: any) {
      error(err.message || 'Could not add product to cart.');
      return false;
    }
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    if (!isAuthenticated) return;
    try {
      const response = await api.put(`/cart/${productId}`, {
        quantity,
        selectedColor,
        selectedSize,
      });
      if (response.data.success) {
        await fetchCart();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update item quantity.');
    }
  };

  const removeFromCart = async (
    productId: string,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    if (!isAuthenticated) return;
    try {
      const response = await api.delete(`/cart/${productId}`, {
        params: { selectedColor, selectedSize },
      });
      if (response.data.success) {
        success('Item removed from cart.');
        await fetchCart();
      }
    } catch (err: any) {
      error(err.message || 'Failed to remove item.');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.delete('/cart');
      if (response.data.success) {
        setCart(null);
      }
    } catch (err: any) {
      error(err.message || 'Failed to clear cart.');
    }
  };

  const cartCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

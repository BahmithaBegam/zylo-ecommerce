import { Response } from 'express';
import { db, CartDoc, CartItemDoc } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let cart = db.carts.find(c => c.userId === req.user?._id);
    if (!cart) {
      cart = {
        _id: `crt_${req.user._id}`,
        userId: req.user._id,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      db.carts.push(cart);
    }

    // Populate and verify real-time stock and prices
    const populatedItems: any[] = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = db.products.find(p => p._id === item.productId);
      if (product) {
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        populatedItems.push({
          ...item,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0],
          stock: product.stock,
          sku: product.sku,
          category: product.category,
        });
      }
    }

    const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + shipping + tax;

    return res.json({
      success: true,
      cart: {
        _id: cart._id,
        userId: cart.userId,
        items: populatedItems,
        subtotal,
        shipping,
        tax,
        total,
        itemCount: populatedItems.reduce((acc, item) => acc + item.quantity, 0),
        updatedAt: cart.updatedAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve shopping cart.' });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { productId, quantity = 1, selectedColor, selectedSize } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const product = db.products.find(p => p._id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock.`,
      });
    }

    let cart = db.carts.find(c => c.userId === req.user?._id);
    if (!cart) {
      cart = {
        _id: `crt_${req.user._id}`,
        userId: req.user._id,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      db.carts.push(cart);
    }

    const existingIndex = cart.items.findIndex(
      i =>
        i.productId === productId &&
        (i.selectedColor || 'Standard') === (selectedColor || 'Standard') &&
        (i.selectedSize || 'Standard') === (selectedSize || 'Standard')
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. You have ${cart.items[existingIndex].quantity} in cart and stock is ${product.stock}.`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      const newItem: CartItemDoc = {
        productId,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: Math.max(1, quantity),
        selectedColor: selectedColor || product.colors[0] || 'Standard',
        selectedSize: selectedSize || product.sizes[0] || 'Standard',
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date().toISOString();
    db.syncCartToMongo(cart).catch(console.error);

    return res.json({
      success: true,
      message: `Added "${product.name}" to your cart!`,
      cartCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { itemId } = req.params; // Can be productId or index
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const cart = db.carts.find(c => c.userId === req.user?._id);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.find(i => i.productId === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }

    const product = db.products.find(p => p._id === item.productId);
    if (product && quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available in stock.`,
      });
    }

    item.quantity = Number(quantity);
    cart.updatedAt = new Date().toISOString();
    db.syncCartToMongo(cart).catch(console.error);

    return res.json({
      success: true,
      message: 'Cart updated successfully.',
      cartCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update cart.' });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { itemId } = req.params;
    const cart = db.carts.find(c => c.userId === req.user?._id);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter(i => i.productId !== itemId);
    cart.updatedAt = new Date().toISOString();
    db.syncCartToMongo(cart).catch(console.error);

    return res.json({
      success: true,
      message: 'Item removed from cart.',
      cartCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to remove item from cart.' });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const cart = db.carts.find(c => c.userId === req.user?._id);
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date().toISOString();
      db.syncCartToMongo(cart).catch(console.error);
    }

    return res.json({ success: true, message: 'Cart cleared successfully.', cartCount: 0 });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};

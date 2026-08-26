import { Response } from 'express';
import mongoose from 'mongoose';
import { db } from '../db.js';
import { WishlistModel, ProductModel } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let productIds: string[] = [];

    if (mongoose.connection.readyState === 1) {
      const mongoWishlist = await (WishlistModel as any).findOne({ userId: req.user._id }).lean();
      if (mongoWishlist && Array.isArray(mongoWishlist.productIds)) {
        productIds = Array.from(new Set(mongoWishlist.productIds));
      }
    }

    // Fallback or memory sync
    let memWishlist = db.wishlists.find(w => w.userId === req.user?._id);
    if (!memWishlist) {
      memWishlist = {
        _id: `wsh_${req.user._id}`,
        userId: req.user._id,
        productIds: productIds,
        updatedAt: new Date().toISOString(),
      };
      db.wishlists.push(memWishlist);
    } else if (productIds.length > 0) {
      memWishlist.productIds = productIds;
    } else {
      productIds = memWishlist.productIds || [];
    }

    // Ensure unique IDs
    productIds = Array.from(new Set(productIds));
    memWishlist.productIds = productIds;

    // Fetch full product documents
    let products = db.products.filter(p => productIds.includes(p._id));
    if (products.length < productIds.length && mongoose.connection.readyState === 1) {
      const mongoProducts = await (ProductModel as any).find({ _id: { $in: productIds } }).lean();
      if (mongoProducts && mongoProducts.length > 0) {
        products = mongoProducts as any;
      }
    }

    return res.json({
      success: true,
      wishlist: {
        _id: memWishlist._id,
        userId: req.user._id,
        productIds,
        products,
      },
      products,
      count: productIds.length,
      wishlistCount: productIds.length,
    });
  } catch (err: any) {
    console.error('Get wishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wishlist.' });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    let product = db.products.find(p => p._id === productId);
    if (!product && mongoose.connection.readyState === 1) {
      product = await (ProductModel as any).findById(productId).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let memWishlist = db.wishlists.find(w => w.userId === req.user?._id);
    if (!memWishlist) {
      memWishlist = {
        _id: `wsh_${req.user._id}`,
        userId: req.user._id,
        productIds: [],
        updatedAt: new Date().toISOString(),
      };
      db.wishlists.push(memWishlist);
    }

    // Prevent duplicate entries
    if (!memWishlist.productIds.includes(productId)) {
      memWishlist.productIds.push(productId);
      memWishlist.updatedAt = new Date().toISOString();
    }
    memWishlist.productIds = Array.from(new Set(memWishlist.productIds));

    // Persist to MongoDB
    if (mongoose.connection.readyState === 1) {
      await (WishlistModel as any).findOneAndUpdate(
        { userId: req.user._id },
        {
          _id: memWishlist._id,
          userId: req.user._id,
          productIds: memWishlist.productIds,
          updatedAt: new Date(),
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const products = db.products.filter(p => memWishlist?.productIds.includes(p._id));

    return res.json({
      success: true,
      message: `Added "${product.name}" to your wishlist!`,
      isSaved: true,
      isWishlisted: true,
      wishlistCount: memWishlist.productIds.length,
      wishlist: {
        _id: memWishlist._id,
        userId: req.user._id,
        productIds: memWishlist.productIds,
        products,
      },
    });
  } catch (err: any) {
    console.error('Add to wishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add to wishlist.' });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    let memWishlist = db.wishlists.find(w => w.userId === req.user?._id);
    if (!memWishlist) {
      memWishlist = {
        _id: `wsh_${req.user._id}`,
        userId: req.user._id,
        productIds: [],
        updatedAt: new Date().toISOString(),
      };
      db.wishlists.push(memWishlist);
    }

    memWishlist.productIds = memWishlist.productIds.filter(id => id !== productId);
    memWishlist.updatedAt = new Date().toISOString();

    // Persist to MongoDB
    if (mongoose.connection.readyState === 1) {
      await (WishlistModel as any).findOneAndUpdate(
        { userId: req.user._id },
        {
          _id: memWishlist._id,
          userId: req.user._id,
          productIds: memWishlist.productIds,
          updatedAt: new Date(),
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const products = db.products.filter(p => memWishlist?.productIds.includes(p._id));

    return res.json({
      success: true,
      message: 'Item removed from wishlist.',
      isSaved: false,
      isWishlisted: false,
      wishlistCount: memWishlist.productIds.length,
      wishlist: {
        _id: memWishlist._id,
        userId: req.user._id,
        productIds: memWishlist.productIds,
        products,
      },
    });
  } catch (err: any) {
    console.error('Remove from wishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist.' });
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    let memWishlist = db.wishlists.find(w => w.userId === req.user?._id);
    if (!memWishlist) {
      memWishlist = {
        _id: `wsh_${req.user._id}`,
        userId: req.user._id,
        productIds: [],
        updatedAt: new Date().toISOString(),
      };
      db.wishlists.push(memWishlist);
    }

    const isCurrentlySaved = memWishlist.productIds.includes(productId);
    let message = '';
    let isSaved = false;

    if (isCurrentlySaved) {
      memWishlist.productIds = memWishlist.productIds.filter(id => id !== productId);
      message = 'Item removed from wishlist.';
      isSaved = false;
    } else {
      memWishlist.productIds.push(productId);
      const product = db.products.find(p => p._id === productId);
      message = product ? `Added "${product.name}" to your wishlist!` : 'Added to wishlist.';
      isSaved = true;
    }

    memWishlist.productIds = Array.from(new Set(memWishlist.productIds));
    memWishlist.updatedAt = new Date().toISOString();

    if (mongoose.connection.readyState === 1) {
      await (WishlistModel as any).findOneAndUpdate(
        { userId: req.user._id },
        {
          _id: memWishlist._id,
          userId: req.user._id,
          productIds: memWishlist.productIds,
          updatedAt: new Date(),
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const products = db.products.filter(p => memWishlist?.productIds.includes(p._id));

    return res.json({
      success: true,
      message,
      isSaved,
      isWishlisted: isSaved,
      wishlistCount: memWishlist.productIds.length,
      wishlist: {
        _id: memWishlist._id,
        userId: req.user._id,
        productIds: memWishlist.productIds,
        products,
      },
    });
  } catch (err: any) {
    console.error('Toggle wishlist error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
};

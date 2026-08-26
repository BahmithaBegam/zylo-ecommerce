import { Request, Response } from 'express';
import { db, CouponDoc } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const subtotal = Number(cartAmount) || 0;
    const cleanCode = code.trim().toUpperCase();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return res.status(404).json({ success: false, message: `Coupon code "${cleanCode}" is invalid.` });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is currently inactive.' });
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon redemption limit has been reached.' });
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required to apply this coupon.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      const calculated = Math.round((subtotal * coupon.discountValue) / 100);
      discountAmount = coupon.maxDiscountAmount ? Math.min(calculated, coupon.maxDiscountAmount) : calculated;
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return res.json({
      success: true,
      message: `Coupon "${cleanCode}" applied! You saved ₹${discountAmount.toLocaleString('en-IN')}`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        minOrderAmount: coupon.minOrderAmount,
        description: coupon.description,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
  }
};

export const getCoupons = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      coupons: db.coupons,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve coupons.' });
  }
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate, usageLimit, description } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Code, discount type, discount value, and expiry date are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = db.coupons.find(c => c.code.toUpperCase() === cleanCode);
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon with code "${cleanCode}" already exists.` });
    }

    const newCoupon: CouponDoc = {
      _id: `cpn_${Date.now()}`,
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      startDate: new Date().toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      usageLimit: Number(usageLimit || 1000),
      usageCount: 0,
      isActive: true,
      description: description || `${discountValue}${discountType === 'percentage' ? '%' : '₹'} OFF`,
      createdAt: new Date().toISOString(),
    };

    db.coupons.unshift(newCoupon);
    db.syncCouponToMongo(newCoupon).catch(console.error);

    return res.status(201).json({
      success: true,
      message: `Coupon "${cleanCode}" created successfully!`,
      coupon: newCoupon,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = db.coupons.findIndex(c => c._id === id || c.code.toUpperCase() === id.toUpperCase());

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    db.coupons[index] = {
      ...db.coupons[index],
      ...req.body,
    };

    db.syncCouponToMongo(db.coupons[index]).catch(console.error);

    return res.json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon: db.coupons[index],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = db.coupons.length;
    db.coupons = db.coupons.filter(c => c._id !== id && c.code.toUpperCase() !== id.toUpperCase());

    if (db.coupons.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    return res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
};

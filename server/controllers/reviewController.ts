import { Request, Response } from 'express';
import { db, ReviewDoc } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId || req.params.id;
    let reviews = db.reviews.filter(r => r.productId === productId && r.status === 'approved');
    return res.json({ success: true, reviews });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const productId = req.body.productId || req.params.productId;
    const { rating, title, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product ID, rating (1-5), and review comment are required.' });
    }

    const ratingNum = Math.min(5, Math.max(1, Number(rating)));
    const product = db.products.find(p => p._id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if user has purchased this product
    const hasPurchased = db.orders.some(
      o => o.userId === req.user?._id && o.items.some(i => i.productId === productId)
    );

    const newReview: ReviewDoc = {
      _id: `rev_${Date.now()}`,
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating: ratingNum,
      title: title?.trim() || 'Customer Review',
      comment: comment.trim(),
      verifiedPurchase: hasPurchased,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);

    // Recalculate product rating and reviewCount
    const allApprovedProductReviews = db.reviews.filter(r => r.productId === productId && r.status === 'approved');
    const totalRatingSum = allApprovedProductReviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Number((totalRatingSum / allApprovedProductReviews.length).toFixed(1));
    product.reviewCount = allApprovedProductReviews.length;

    db.syncReviewToMongo(newReview).catch(console.error);
    db.syncProductToMongo(product).catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: newReview,
      productRating: product.rating,
      reviewCount: product.reviewCount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

export const moderateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const review = db.reviews.find(r => r._id === id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (['approved', 'pending', 'rejected'].includes(status)) {
      review.status = status;
    }

    return res.json({ success: true, message: `Review status updated to ${status}.`, review });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update review.' });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = db.reviews.length;
    db.reviews = db.reviews.filter(r => r._id !== id);

    if (db.reviews.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

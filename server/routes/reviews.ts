import { Router } from 'express';
import {
  getReviewsByProduct,
  createReview,
  moderateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getReviewsByProduct);
router.get('/:productId', getReviewsByProduct);
router.post('/', requireAuth, createReview);
router.post('/:productId', requireAuth, createReview);
router.put('/:id', requireAdmin, moderateReview);
router.delete('/:id', requireAdmin, deleteReview);

export default router;

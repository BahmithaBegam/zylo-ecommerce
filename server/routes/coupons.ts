import { Router } from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', getCoupons);
router.post('/', requireAdmin, createCoupon);
router.put('/:id', requireAdmin, updateCoupon);
router.delete('/:id', requireAdmin, deleteCoupon);

export default router;

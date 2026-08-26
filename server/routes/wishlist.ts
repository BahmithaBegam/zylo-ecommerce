import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getWishlist);
router.post('/', requireAuth, addToWishlist);
router.post('/toggle', requireAuth, toggleWishlist);
router.delete('/:productId', requireAuth, removeFromWishlist);

export default router;

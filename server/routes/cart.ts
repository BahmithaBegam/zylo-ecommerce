import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getCart);
router.post('/', requireAuth, addToCart);
router.put('/:itemId', requireAuth, updateCartItem);
router.delete('/:itemId', requireAuth, removeCartItem);
router.delete('/', requireAuth, clearCart);

export default router;

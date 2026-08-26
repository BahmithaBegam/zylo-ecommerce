import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  trackOrderPublic,
  cancelOrder,
  updateOrderStatus,
  testEmailConfig,
  deleteOrder,
} from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Order creation & customer order access
router.post('/', requireAuth, createOrder);
router.post('/email-test', requireAuth, testEmailConfig);

// Specific paths before parameterized /:id
router.get('/my-orders', requireAuth, getOrders);
router.get('/track/:trackingNumber', trackOrderPublic);
router.get('/', requireAuth, getOrders);

// Order actions by ID
router.get('/:id', requireAuth, getOrderById);
router.put('/:id/cancel', requireAuth, cancelOrder);
router.delete('/:id', requireAuth, deleteOrder);
router.delete('/:id/history', requireAuth, deleteOrder);

// Admin order status update
router.put('/:id/status', requireAdmin, updateOrderStatus);

export default router;



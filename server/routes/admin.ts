import { Router } from 'express';
import {
  getDashboardOverview,
  getInventory,
  updateInventoryStock,
  getUsers,
  updateUserStatus,
} from '../controllers/adminController.js';
import { testEmailConfig } from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/overview', requireAdmin, getDashboardOverview);
router.get('/inventory', requireAdmin, getInventory);
router.put('/inventory/stock', requireAdmin, updateInventoryStock);
router.get('/users', requireAdmin, getUsers);
router.put('/users/:id/status', requireAdmin, updateUserStatus);
router.post('/email/test', requireAdmin, testEmailConfig);

export default router;


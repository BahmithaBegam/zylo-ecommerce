import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  validateImages,
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public catalog routes
router.get('/', getProducts);
router.get('/validate-images', validateImages);
router.get('/:id', getProductByIdOrSlug);

// Admin product management routes
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;

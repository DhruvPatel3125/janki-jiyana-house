import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody, productSchema } from '../middleware/validate.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, validateBody(productSchema), createProduct);
router.route('/:id').get(getProductById).put(protect, admin, validateBody(productSchema), updateProduct).delete(protect, admin, deleteProduct);

export default router;

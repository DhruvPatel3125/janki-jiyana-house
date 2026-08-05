import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody, productSchema, updateProductSchema } from '../middleware/validate.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route('/').get(getProducts).post(protect, admin, validateBody(productSchema), createProduct);
router.route('/import').post(protect, admin, upload.single('file'), importProducts);
router.route('/:id').get(getProductById).put(protect, admin, validateBody(updateProductSchema), updateProduct).delete(protect, admin, deleteProduct);

export default router;

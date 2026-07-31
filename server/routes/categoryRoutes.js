import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody, categorySchema } from '../middleware/validate.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, admin, validateBody(categorySchema), createCategory);

router.route('/:id')
  .put(protect, admin, validateBody(categorySchema), updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;

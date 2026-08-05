import express from 'express';
import {
  getBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody, bannerSchema } from '../middleware/validate.js';

const router = express.Router();

router
  .route('/')
  .get(getBanners)
  .post(protect, admin, validateBody(bannerSchema), createBanner);

router.get('/admin', protect, admin, getAdminBanners);

router
  .route('/:id')
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;

import express from 'express';
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/toggle/:productId', protect, toggleWishlist);
router.delete('/:productId', protect, removeFromWishlist);

export default router;

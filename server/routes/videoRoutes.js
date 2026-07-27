import express from 'express';
import {
  getVideos,
  getAllVideosAdmin,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getVideos);
router.get('/admin', protect, admin, getAllVideosAdmin);
router.post('/', protect, admin, createVideo);
router.put('/:id', protect, admin, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

export default router;

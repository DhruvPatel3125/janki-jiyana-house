import express from 'express';
import {
  getVideos,
  getAllVideosAdmin,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody, videoSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/admin', protect, admin, getAllVideosAdmin);
router.route('/')
  .get(getVideos)
  .post(protect, admin, validateBody(videoSchema), createVideo);

router.route('/:id')
  .put(protect, admin, validateBody(videoSchema), updateVideo)
  .delete(protect, admin, deleteVideo);

export default router;

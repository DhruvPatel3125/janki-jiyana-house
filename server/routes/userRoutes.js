import express from 'express';
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  getUsers,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  validateBody,
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from '../middleware/validate.js';

const router = express.Router();

router.route('/').get(protect, admin, getUsers);
router.post('/register', validateBody(registerSchema), registerUser);
router.post('/login', validateBody(loginSchema), loginUser);
router.post('/send-otp', validateBody(sendOtpSchema), sendOtp);
router.post('/verify-otp', validateBody(verifyOtpSchema), verifyOtp);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;

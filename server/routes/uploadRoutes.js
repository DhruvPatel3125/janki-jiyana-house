import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import { protect, admin } from '../middleware/authMiddleware.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'janki-jiyana-house', // Folder name in your Cloudinary account
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (req.file && req.file.path) {
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path, // Cloudinary secure URL
    });
  } else {
    res.status(400).json({ message: 'No image uploaded' });
  }
});

// @route   POST /api/upload/payment-proof
// @desc    Upload payment screenshot (Public/Customer)
// @access  Public
router.post('/payment-proof', upload.single('image'), (req, res) => {
  if (req.file && req.file.path) {
    res.json({
      message: 'Payment proof uploaded successfully',
      imageUrl: req.file.path,
    });
  } else {
    res.status(400).json({ message: 'No image uploaded' });
  }
});

export default router;

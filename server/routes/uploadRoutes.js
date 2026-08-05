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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Maximum file size limit
});

const router = express.Router();

// Helper middleware to handle multer file size limit errors
const handleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 5MB limit. Please upload a smaller image.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
};

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private/Admin
router.post('/', protect, admin, handleUpload('image'), (req, res) => {
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
router.post('/payment-proof', handleUpload('image'), (req, res) => {
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

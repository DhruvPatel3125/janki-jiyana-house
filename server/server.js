import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { startCronJobs } from './utils/cronJobs.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Avoid blocking inline images/scripts in dev/prod
}));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 150 requests per windowMs
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many authentication attempts, please try again later' },
});

app.use('/api/', apiLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/send-otp', authLimiter);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Janki Jiyana House API server is running smooth!' });
});

// Sitemap XML route (accessible at both /sitemap.xml and /api/sitemap.xml)
app.use('/sitemap.xml', sitemapRoutes);
app.use('/api/sitemap.xml', sitemapRoutes);

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);



// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Initialize Cron Jobs (always run, including production)
startCronJobs();

export default app;

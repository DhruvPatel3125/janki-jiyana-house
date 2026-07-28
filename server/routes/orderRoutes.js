import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
  requestCancelOrReturn,
} from '../controllers/orderController.js';
import { protect, optionalProtect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(optionalProtect, createOrder).get(protect, admin, getAllOrders);
router.route('/stats').get(protect, admin, getAdminStats);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(optionalProtect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, requestCancelOrReturn);

export default router;


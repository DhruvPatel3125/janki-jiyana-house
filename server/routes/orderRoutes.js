import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
  requestCancelOrReturn,
  submitPaymentProof,
  verifyPayment,
  cancelItem,
} from '../controllers/orderController.js';
import { protect, optionalProtect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(optionalProtect, createOrder).get(protect, admin, getAllOrders);
router.route('/stats').get(protect, admin, getAdminStats);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(optionalProtect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, requestCancelOrReturn);
router.route('/:id/cancel-item/:itemId').put(protect, cancelItem);
router.route('/:id/submit-payment').put(optionalProtect, submitPaymentProof);
router.route('/:id/verify-payment').put(protect, admin, verifyPayment);

export default router;


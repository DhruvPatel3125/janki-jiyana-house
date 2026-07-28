import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail } from '../config/nodemailer.js';

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'];
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      return res.status(409).json({ message: 'Order has already been processed' });
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, shippingAddress, paymentMethod, guestInfo } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'No order items specified' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Shipping address details are incomplete' });
    }

    // Verify products and calculate total amount on server to prevent client price tampering
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (item.quantity <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Invalid quantity for product` });
      }

      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
      });

      // Deduct stock quantity
      product.stock -= item.quantity;
      await product.save({ session });
    }

    const order = new Order({
      user: req.user ? req.user._id : undefined,
      guestInfo: !req.user ? guestInfo : undefined,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      isPaid: paymentMethod === 'Online' || paymentMethod === 'Razorpay',
      paidAt: paymentMethod === 'Online' || paymentMethod === 'Razorpay' ? Date.now() : undefined,
      idempotencyKey,
    });

    const createdOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Trigger async order confirmation email to customer & admin
    const recipientEmail = req.user?.email || guestInfo?.email || shippingAddress?.email;
    const customerName = req.user?.name || guestInfo?.name || shippingAddress?.name || 'Customer';

    if (recipientEmail) {
      sendOrderConfirmationEmail(createdOrder, recipientEmail, customerName);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Catch duplicate key error if a concurrent request with the same idempotency key attempts to save simultaneously
    if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
      return res.status(409).json({ message: 'Order has already been processed' });
    }
    
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure users can only access their own orders unless admin
    if (
      req.user &&
      req.user.role !== 'admin' &&
      order.user &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = getOrders;

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status || order.status;
      if (status === 'Delivered') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin analytics overview (total sales, counts, dynamic charts)
// @route   GET /api/orders/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const totalOrdersCount = await Order.countDocuments();
    const pendingOrdersCount = await Order.countDocuments({ status: 'Pending' });
    const confirmedOrdersCount = await Order.countDocuments({ status: 'Confirmed' });
    const shippedOrdersCount = await Order.countDocuments({ status: 'Shipped' });
    const deliveredOrdersCount = await Order.countDocuments({ status: 'Delivered' });

    // Calculate total sales from non-cancelled orders
    const salesAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = salesAggregation.length > 0 ? salesAggregation[0].totalRevenue : 0;
    const productsCount = await Product.countDocuments();
    const lowStockProductsCount = await Product.countDocuments({ stock: { $lte: 5 } });
    const usersCount = await User.countDocuments({ role: 'customer' });

    // Dynamic Monthly Sales Trend Aggregation
    const monthlyAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySalesData = monthsMap.map((m, idx) => {
      const found = monthlyAggregation.find((a) => a._id === idx + 1);
      return {
        month: m,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      };
    });

    // Dynamic Category Distribution Aggregation
    const categoryAggregation = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const colorsList = ['#0d9488', '#f97316', '#0284c7', '#8b5cf6', '#ec4899', '#10b981'];
    const categoryDistributionData = categoryAggregation.map((cat, idx) => ({
      name: cat._id || 'General',
      value: cat.count,
      color: colorsList[idx % colorsList.length],
    }));

    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      totalRevenue,
      totalOrdersCount,
      pendingOrdersCount,
      confirmedOrdersCount,
      shippedOrdersCount,
      deliveredOrdersCount,
      productsCount,
      lowStockProductsCount,
      usersCount,
      monthlySalesData,
      categoryDistributionData,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

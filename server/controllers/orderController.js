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
    const { items, shippingAddress, paymentMethod, guestInfo, paymentProof } = req.body;

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

    if (paymentMethod === 'UPI_QR' && (!paymentProof || !paymentProof.screenshotUrl || !paymentProof.utrNumber)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Payment proof (screenshot and UTR) is required for UPI QR orders' });
    }

    // Duplicate UTR Check
    if (paymentMethod === 'UPI_QR' && paymentProof && paymentProof.utrNumber) {
      const existingOrder = await Order.findOne({
        'paymentProof.utrNumber': paymentProof.utrNumber,
        paymentStatus: { $in: ['verification_pending', 'verified'] }
      }).session(session);

      if (existingOrder) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          message: 'This UTR number has already been used for another order. Please contact support if this is a mistake.' 
        });
      }
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

      let currentPrice = product.price;
      
      if (item.variant && product.variants && product.variants.length > 0) {
        const matchedVariant = product.variants.find(
          (v) => v.name === item.variant.name && v.value === item.variant.value
        );
        if (matchedVariant && matchedVariant.price != null) {
          currentPrice = matchedVariant.price;
        }
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      const itemTotal = currentPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: currentPrice,
        quantity: item.quantity,
        variant: item.variant || undefined,
      });

      // Deduct stock quantity
      product.stock -= item.quantity;
      
      // Also deduct from variant stock if applicable
      if (item.variant && product.variants && product.variants.length > 0) {
        const variantIndex = product.variants.findIndex(
          (v) => v.name === item.variant.name && v.value === item.variant.value
        );
        if (variantIndex !== -1 && product.variants[variantIndex].stock >= item.quantity) {
          product.variants[variantIndex].stock -= item.quantity;
        }
      }

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
      paymentProof: paymentMethod === 'UPI_QR' ? paymentProof : undefined,
      paymentStatus: paymentMethod === 'UPI_QR' ? 'verification_pending' : 'pending',
      status: paymentMethod === 'UPI_QR' ? 'Verification Pending' : 'Pending',
    });

    const createdOrder = await order.save({ session });

    // Save the shipping address to the user's profile for future autofill
    if (req.user) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            address: shippingAddress,
            ...(shippingAddress.phone && { phone: shippingAddress.phone }),
          },
        },
        { session }
      );
    }

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
    if (order.user) {
      if (!req.user || (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this order. Please log in.' });
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user orders (paginated)
// @route   GET /api/orders/myorders
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalOrders] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin, paginated)
// @route   GET /api/orders
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    // Allow multi-field search (Customer Name, Phone, Email, Address, UTR Number, or Order ID)
    if (search && search.trim()) {
      const searchTrim = search.trim();
      const searchRegex = new RegExp(searchTrim, 'i');

      const orConditions = [
        { 'guestInfo.name': searchRegex },
        { 'guestInfo.phone': searchRegex },
        { 'guestInfo.email': searchRegex },
        { 'shippingAddress.phone': searchRegex },
        { 'shippingAddress.street': searchRegex },
        { 'shippingAddress.city': searchRegex },
        { 'paymentProof.utrNumber': searchRegex },
      ];

      if (searchTrim.match(/^[a-f\d]{24}$/i)) {
        orConditions.push({ _id: searchTrim });
      }

      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      }).select('_id');

      if (matchingUsers.length > 0) {
        orConditions.push({ user: { $in: matchingUsers.map((u) => u._id) } });
      }

      query.$or = orConditions;
    }

    const [orders, totalOrders] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
    });
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
      const prevStatus = order.status;
      order.status = status || order.status;
      if (status === 'Delivered') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }

      // Restore stock if order is cancelled or return requested (and wasn't already)
      if (
        (status === 'Cancelled' || status === 'Return Requested') &&
        prevStatus !== 'Cancelled' && prevStatus !== 'Return Requested'
      ) {
        for (const item of order.items) {
          // Only restore stock for items that are still Active (not already individually cancelled)
          if (item.status === 'Active') {
            await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
          }
        }
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

// @desc    User requests order cancellation or return
// @route   PUT /api/orders/:id/cancel
export const requestCancelOrReturn = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'Cancelled' || order.status === 'Return Requested') {
      throw new Error('Order is already cancelled or return requested');
    }

    if (order.status === 'Shipped' || order.status === 'Delivered') {
      order.status = 'Return Requested';
    } else {
      order.status = 'Cancelled';
      
      // Restock items since order is cancelled before shipping
      for (const item of order.items) {
        if (item.status !== 'Cancelled') {
          item.status = 'Cancelled';
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }
    }

    const updatedOrder = await order.save({ session });
    
    await session.commitTransaction();
    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message || 'Error processing request' });
  } finally {
    session.endSession();
  }
};

// @desc    User requests single item cancellation
// @route   PUT /api/orders/:id/cancel-item/:itemId
export const cancelItem = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'Cancelled' || order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Return Requested') {
      throw new Error('Cannot cancel item at this stage');
    }

    const item = order.items.id(req.params.itemId);
    if (!item) {
      throw new Error('Item not found in order');
    }

    if (item.status === 'Cancelled') {
      throw new Error('Item is already cancelled');
    }

    const originalQuantity = item.quantity;
    let cancelQuantity = originalQuantity;

    if (req.body.quantity !== undefined) {
      cancelQuantity = parseInt(req.body.quantity, 10);
      if (isNaN(cancelQuantity) || cancelQuantity <= 0 || cancelQuantity > originalQuantity) {
        throw new Error('Invalid cancellation quantity');
      }
    }

    if (cancelQuantity < originalQuantity) {
      // Partial cancellation: Split item
      item.quantity = originalQuantity - cancelQuantity;
      
      const cancelledItem = {
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: cancelQuantity,
        variant: item.variant,
        status: 'Cancelled'
      };
      order.items.push(cancelledItem);
    } else {
      // Full cancellation
      item.status = 'Cancelled';
    }

    // Restock product stock
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: cancelQuantity } },
      { session }
    );

    // Restock variant stock if applicable
    if (item.variant) {
      const productObj = await Product.findById(item.product).session(session);
      if (productObj && productObj.variants) {
        const variantIndex = productObj.variants.findIndex(
          (v) => v.name === item.variant.name && v.value === item.variant.value
        );
        if (variantIndex !== -1) {
          productObj.variants[variantIndex].stock += cancelQuantity;
          await productObj.save({ session });
        }
      }
    }

    // Recalculate total amount
    order.totalAmount -= (item.price * cancelQuantity);

    // If all items are cancelled, mark the entire order as cancelled
    const allCancelled = order.items.every(i => i.status === 'Cancelled');
    if (allCancelled) {
      order.status = 'Cancelled';
    }

    const updatedOrder = await order.save({ session });
    
    await session.commitTransaction();
    res.json(updatedOrder);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message || 'Error processing request' });
  } finally {
    session.endSession();
  }
};

// @desc    Submit payment proof (UTR & Screenshot)
// @route   PUT /api/orders/:id/submit-payment
// @access  Public (Guest accessible with order ID)
export const submitPaymentProof = async (req, res) => {
  try {
    const { utrNumber, paymentApp, screenshotUrl } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!utrNumber || !screenshotUrl || !paymentApp) {
      return res.status(400).json({ message: 'UTR Number, Payment App, and Screenshot are required' });
    }

    // Duplicate UTR Check
    const existingOrder = await Order.findOne({
      'paymentProof.utrNumber': utrNumber,
      _id: { $ne: order._id }, // Ignore the current order in case they are re-submitting the same UTR
      paymentStatus: { $in: ['verification_pending', 'verified'] } // Check against pending or verified orders
    });

    if (existingOrder) {
      return res.status(400).json({ 
        message: 'This UTR number has already been used for another order. Please contact support if this is a mistake.' 
      });
    }

    order.paymentProof = {
      utrNumber,
      paymentApp,
      screenshotUrl,
      submittedAt: Date.now(),
    };
    order.paymentStatus = 'verification_pending';
    order.status = 'Verification Pending';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Verify payment (Admin)
// @route   PUT /api/orders/:id/verify-payment
// @access  Private/Admin
export const verifyPayment = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (isApproved) {
      order.paymentStatus = 'verified';
      order.status = 'Confirmed';
      order.isPaid = true;
      order.paidAt = Date.now();
      
      if (!order.paymentProof) order.paymentProof = {};
      order.paymentProof.verifiedAt = Date.now();
      order.paymentProof.verifiedBy = req.user._id;
    } else {
      order.paymentStatus = 'rejected';
      if (!order.paymentProof) order.paymentProof = {};
      order.paymentProof.verifiedAt = Date.now();
      order.paymentProof.verifiedBy = req.user._id;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

let adminStatsCache = null;
let adminStatsCacheTime = 0;
const STATS_CACHE_TTL = 30 * 1000; // 30 seconds cache TTL

// @desc    Get admin analytics overview (total sales, counts, dynamic charts)
// @route   GET /api/orders/stats
export const getAdminStats = async (req, res, next) => {
  try {
    // Return cached stats if within 30 seconds TTL
    if (adminStatsCache && Date.now() - adminStatsCacheTime < STATS_CACHE_TTL) {
      return res.json(adminStatsCache);
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const yearEnd = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    // ── Run all 3 collections in parallel (was 10+ sequential queries before) ──
    const [orderFacet, productFacet, usersCount] = await Promise.all([

      // Single $facet aggregation covers: status counts, revenue, monthly trend, recent orders
      Order.aggregate([
        {
          $facet: {
            // Count per status in ONE collection scan
            statusCounts: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
            ],
            // Total revenue (non-cancelled)
            revenue: [
              { $match: { status: { $ne: 'Cancelled' } } },
              { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ],
            // Monthly sales — current year only (fixes cross-year bug)
            monthlySales: [
              {
                $match: {
                  status: { $ne: 'Cancelled' },
                  createdAt: { $gte: yearStart, $lte: yearEnd },
                },
              },
              {
                $group: {
                  _id: { month: { $month: '$createdAt' } },
                  revenue: { $sum: '$totalAmount' },
                  orders: { $sum: 1 },
                },
              },
              { $sort: { '_id.month': 1 } },
            ],
            // Recent 6 orders (no separate find() needed)
            recentOrders: [
              { $sort: { createdAt: -1 } },
              { $limit: 6 },
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'userInfo',
                  pipeline: [{ $project: { name: 1, email: 1 } }],
                },
              },
              { $addFields: { user: { $arrayElemAt: ['$userInfo', 0] } } },
              { $project: { userInfo: 0 } },
            ],
          },
        },
      ]),

      // Single $facet aggregation covers: product count, low stock, category distribution
      Product.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            lowStock: [
              { $match: { stock: { $lte: 5 } } },
              { $count: 'count' },
            ],
            categoryDistribution: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
            ],
          },
        },
      ]),

      // Simple count for users
      User.countDocuments({ role: 'customer' }),
    ]);

    // ── Extract order stats from $facet result ──
    const oFacet = orderFacet[0];
    const statusMap = {};
    for (const s of oFacet.statusCounts) {
      statusMap[s._id] = s.count;
    }
    const totalOrdersCount = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const pendingOrdersCount = (statusMap['Pending'] || 0) + (statusMap['Pending Payment'] || 0);
    const confirmedOrdersCount = statusMap['Confirmed'] || 0;
    const shippedOrdersCount = statusMap['Shipped'] || 0;
    const deliveredOrdersCount = statusMap['Delivered'] || 0;
    const totalRevenue = oFacet.revenue.length > 0 ? oFacet.revenue[0].total : 0;

    // ── Build 12-month trend (current year) ──
    const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySalesData = monthsMap.map((m, idx) => {
      const found = oFacet.monthlySales.find((a) => a._id.month === idx + 1);
      return {
        month: m,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      };
    });

    // ── Extract product stats ──
    const pFacet = productFacet[0];
    const productsCount = pFacet.total.length > 0 ? pFacet.total[0].count : 0;
    const lowStockProductsCount = pFacet.lowStock.length > 0 ? pFacet.lowStock[0].count : 0;
    const colorsList = ['#0d9488', '#f97316', '#0284c7', '#8b5cf6', '#ec4899', '#10b981'];
    const categoryDistributionData = pFacet.categoryDistribution.map((cat, idx) => ({
      name: cat._id || 'General',
      value: cat.count,
      color: colorsList[idx % colorsList.length],
    }));

    const responsePayload = {
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
      recentOrders: oFacet.recentOrders,
    };

    // Cache the payload
    adminStatsCache = responsePayload;
    adminStatsCacheTime = Date.now();

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};

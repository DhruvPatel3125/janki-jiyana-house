import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order (supports registered user or guest checkout)
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, guestInfo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.phone) {
      return res.status(400).json({ message: 'Shipping address with phone number is required' });
    }

    // Server-side validation of products, stock & calculation of exact total
    let calculatedTotal = 0;
    const verifiedOrderItems = [];
    const stockUpdates = [];

    for (const item of items) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product "${dbProduct.name}". Only ${dbProduct.stock} units left.`,
        });
      }

      calculatedTotal += dbProduct.price * item.quantity;
      verifiedOrderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        image: dbProduct.images[0] || '',
        price: dbProduct.price,
        quantity: item.quantity,
      });

      stockUpdates.push({
        product: dbProduct,
        newStock: dbProduct.stock - item.quantity,
      });
    }

    // Deduct stock
    for (const update of stockUpdates) {
      update.product.stock = update.newStock;
      await update.product.save();
    }

    const order = new Order({
      user: req.user ? req.user._id : null,
      guestInfo: req.user ? null : guestInfo,
      items: verifiedOrderItems,
      shippingAddress,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod || 'COD',
      status: 'Confirmed',
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
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
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

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

// @desc    Get admin analytics overview (total sales, counts, etc.)
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

    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

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
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};


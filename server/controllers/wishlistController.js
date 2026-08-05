import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// Helper: user ki wishlist products return karna (populated)
const getPopulatedWishlist = async (userId) => {
  const items = await Wishlist.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('product');
  // Return array of product objects (same shape as before — frontend ko pata nahi chalega)
  return items.map((item) => item.product).filter(Boolean);
};

// @desc    Get user's populated wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await getPopulatedWishlist(req.user._id);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch wishlist' });
  }
};

// @desc    Toggle product in/out of user wishlist
// @route   POST /api/wishlist/toggle/:productId
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const productExists = await Product.findById(productId).select('_id');
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });

    let added = false;
    if (existing) {
      // Remove from wishlist — single delete query
      await Wishlist.deleteOne({ _id: existing._id });
      added = false;
    } else {
      // Add to wishlist — single insert query
      await Wishlist.create({ user: req.user._id, product: productId });
      added = true;
    }

    // Return updated wishlist
    const wishlist = await getPopulatedWishlist(req.user._id);

    res.json({
      added,
      message: added ? 'Added to Wishlist ❤️' : 'Removed from Wishlist',
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update wishlist' });
  }
};

// @desc    Explicitly remove product from user wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    await Wishlist.deleteOne({ user: req.user._id, product: productId });

    const wishlist = await getPopulatedWishlist(req.user._id);

    res.json({
      message: 'Removed from Wishlist',
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to remove item from wishlist' });
  }
};

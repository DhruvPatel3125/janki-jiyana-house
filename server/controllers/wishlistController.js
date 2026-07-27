import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user's populated wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(440).json({ message: 'User not found' });
    }
    res.json(user.wishlist || []);
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
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const isExisting = user.wishlist.some(
      (id) => id.toString() === productId.toString()
    );

    let added = false;
    if (isExisting) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
      added = false;
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();

    // Populate and return updated wishlist
    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      added,
      message: added ? 'Added to Wishlist ❤️' : 'Removed from Wishlist',
      wishlist: updatedUser.wishlist || [],
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

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wishlist) {
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );
      await user.save();
    }

    const updatedUser = await User.findById(req.user._id).populate('wishlist');

    res.json({
      message: 'Removed from Wishlist',
      wishlist: updatedUser.wishlist || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to remove item from wishlist' });
  }
};

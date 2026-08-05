import Banner from '../models/Banner.js';

// @desc    Get all active discount banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching banners' });
  }
};

// @desc    Get all banners for admin (including inactive)
// @route   GET /api/banners/admin
// @access  Private/Admin
export const getAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching banners' });
  }
};

// @desc    Create new discount banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
  try {
    const { title, image, category, isActive } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'Banner image is required' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const banner = await Banner.create({
      title: title || '',
      image,
      category,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating banner' });
  }
};

// @desc    Update discount banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const { title, image, category, isActive } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    if (title !== undefined) banner.title = title;
    if (image !== undefined) banner.image = image;
    if (category !== undefined) banner.category = category;
    if (isActive !== undefined) banner.isActive = isActive;

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error updating banner' });
  }
};

// @desc    Delete discount banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.deleteOne();
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting banner' });
  }
};

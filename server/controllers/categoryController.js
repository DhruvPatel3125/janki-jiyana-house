import Category from '../models/Category.js';
import Product from '../models/Product.js';



// @desc    Get all categories (auto-syncs defaults if empty)
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({})
      .populate('parentCategory', 'name')
      .sort({ createdAt: 1 });


    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category (admin)
// @route   POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentCategory } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      name: trimmedName,
      description: description || `${trimmedName} care products`,
      image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
      parentCategory: parentCategory || null,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      if (req.body.name) {
        const trimmedName = req.body.name.trim();
        // Check if another category exists with this name
        if (trimmedName.toLowerCase() !== category.name.toLowerCase()) {
          const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
          if (existing) {
            return res.status(400).json({ message: 'Category with this name already exists' });
          }
        }
        category.name = trimmedName;
      }
      
      category.description = req.body.description !== undefined ? req.body.description : category.description;
      category.image = req.body.image !== undefined ? req.body.image : category.image;
      category.parentCategory = req.body.parentCategory !== undefined ? (req.body.parentCategory || null) : category.parentCategory;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    next(error);
  }
};

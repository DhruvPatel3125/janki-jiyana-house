import Product from '../models/Product.js';

// @desc    Fetch all products with optional filter, search & pagination
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, limit = 20, page = 1 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      // Use $text index if available, fallback to regex for partial matches
      query.name = { $regex: search, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-low') sortOptions = { price: 1 };
    if (sort === 'price-high') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100 per page
    const skip = (pageNum - 1) * limitNum;

    const [products, totalProducts] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum);

    res.json({
      products,
      totalProducts,
      totalPages,
      currentPage: pageNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Fetch single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, mrp, stock, images, description, features, isFeatured, variants } = req.body;
    const product = new Product({
      name,
      category,
      price,
      mrp: mrp || price,
      stock,
      images,
      description,
      features: features || [],
      isFeatured: isFeatured || false,
      variants: variants || [],
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.price = req.body.price !== undefined ? req.body.price : product.price;
      product.mrp = req.body.mrp !== undefined ? req.body.mrp : product.mrp;
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
      product.images = req.body.images || product.images;
      product.description = req.body.description || product.description;
      product.features = req.body.features || product.features;
      product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;
      product.variants = req.body.variants !== undefined ? req.body.variants : product.variants;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

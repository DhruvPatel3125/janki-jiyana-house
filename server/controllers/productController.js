import Product from '../models/Product.js';
import * as xlsx from 'xlsx';

// @desc    Fetch all products with optional filter, search & pagination
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, limit = 20, page = 1 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      const categories = category.split(',').map(c => c.trim());
      query.category = { $in: categories };
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
    const { name, category, price, mrp, stock, images, videoUrl, description, features, isFeatured, variants } = req.body;
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
      videoUrl: videoUrl || '',
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
      if (req.body.videoUrl !== undefined) {
        product.videoUrl = req.body.videoUrl;
      }

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

// @desc    Bulk import products from Excel/CSV
// @route   POST /api/products/import
export const importProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'The uploaded file is empty or invalid' });
    }

    const productsToInsert = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Basic validation
      if (!row.name || !row.category || row.price === undefined) {
        errors.push(`Row ${i + 2}: Missing required fields (Name, Category, Price)`);
        continue;
      }

      let parsedVariants = [];
      if (row.variants) {
        try {
          // Attempt to parse as JSON first
          parsedVariants = JSON.parse(row.variants);
        } catch (e) {
          // If not JSON, try a delimited format: name:value:price:mrp:stock:sku:image | name2:value2...
          const variantStrings = row.variants.split('|');
          parsedVariants = variantStrings.map(v => {
            const parts = v.split('::').map(p => p.trim());
            return {
              name: parts[0] || '',
              value: parts[1] || '',
              price: parts[2] ? Number(parts[2]) : undefined,
              mrp: parts[3] ? Number(parts[3]) : undefined,
              stock: parts[4] ? Number(parts[4]) : 0,
              sku: parts[5] || '',
              image: parts[6] || '',
            };
          }).filter(v => v.name && v.value);
        }
      }

      // Format data based on schema
      const newProduct = {
        name: row.name,
        category: row.category,
        price: Number(row.price),
        mrp: row.mrp ? Number(row.mrp) : Number(row.price),
        stock: row.stock !== undefined ? Number(row.stock) : 0,
        images: row.images ? row.images.split(',').map(img => img.trim()) : [],
        description: row.description || 'No description provided',
        features: row.features ? row.features.split('|').map(f => f.trim()) : [],
        isFeatured: row.isFeatured === 'true' || row.isFeatured === true || row.isFeatured === 1,
        variants: parsedVariants,
      };

      productsToInsert.push(newProduct);
    }

    if (productsToInsert.length > 0) {
      // Use insertMany for bulk insert (it skips hooks, but fast)
      // Alternatively, we could iterate and save or check for duplicates
      await Product.insertMany(productsToInsert);
    }

    res.status(201).json({
      message: `Successfully imported ${productsToInsert.length} products.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};

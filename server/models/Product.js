import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    mrp: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: 0,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    videoUrl: {
      type: String,
      trim: true,
    },
    detailImages: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    features: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    variants: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
        price: { type: Number },
        mrp: { type: Number },
        stock: { type: Number, default: 0 },
        sku: { type: String },
        image: { type: String },
      },
    ],
    aPlusContent: [
      {
        type: {
          type: String,
          enum: ['hero_banner', 'feature_split', 'three_cards', 'comparison_table'],
          required: true,
        },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        image: { type: String, default: '' },
        description: { type: String, default: '' },
        cards: [
          {
            title: String,
            description: String,
            image: String,
            icon: String,
          },
        ],
        comparisonTable: {
          headers: [String],
          rows: [
            {
              productName: String,
              productImage: String,
              features: [String],
            },
          ],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
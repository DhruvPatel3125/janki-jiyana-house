import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;

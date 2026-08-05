import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: ek user ek product sirf ek baar wishlist mein rakh sakta hai
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Fast lookup: user ki poori wishlist fetch karna
wishlistSchema.index({ user: 1, createdAt: -1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;

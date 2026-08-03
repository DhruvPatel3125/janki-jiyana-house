import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['Active', 'Cancelled', 'Returned'],
    default: 'Active',
  },
  variant: {
    name: String,
    value: String
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allows guest checkout
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Razorpay', 'WhatsApp', 'UPI_QR'],
      default: 'WhatsApp',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'verification_pending', 'verified', 'rejected'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['Pending', 'Pending Payment', 'Verification Pending', 'Payment Verified', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Rejected'],
      default: 'Pending',
    },
    paymentProof: {
      utrNumber: String,
      paymentApp: String,
      screenshotUrl: String,
      submittedAt: Date,
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // Only enforce uniqueness if the field exists
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentProof.utrNumber': 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;

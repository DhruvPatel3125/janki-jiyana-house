import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    storeUpiId: {
      type: String,
      default: 'bajajpay.6879729.c337835225@indus',
    },
    storeName: {
      type: String,
      default: 'Janki Jiyana House',
    },
    qrAutoGeneration: {
      type: Boolean,
      default: true,
    },
    paymentInstructions: {
      type: String,
      default: 'Please scan the QR code to make the payment. After payment, enter your UTR number and upload a screenshot to verify.',
    },
    whatsappNumber: {
      type: String,
      default: '919737474672',
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

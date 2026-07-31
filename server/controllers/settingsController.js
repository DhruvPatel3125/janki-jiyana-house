import Setting from '../models/Setting.js';

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const { storeUpiId, storeName, qrAutoGeneration, paymentInstructions, whatsappNumber } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    if (storeUpiId !== undefined) settings.storeUpiId = storeUpiId;
    if (storeName !== undefined) settings.storeName = storeName;
    if (qrAutoGeneration !== undefined) settings.qrAutoGeneration = qrAutoGeneration;
    if (paymentInstructions !== undefined) settings.paymentInstructions = paymentInstructions;
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

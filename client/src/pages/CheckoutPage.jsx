import React, { useState, useRef,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Banknote, CreditCard, Lock, CheckCircle2, MailCheck, X, AlertCircle, ShieldAlert, MessageCircle, UploadCloud, Copy, IndianRupee } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { validateIndianMobile } from '../utils/phoneValidation';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const CheckoutPage = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.address?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Gujarat',
    zipCode: user?.address?.zipCode || '',
    paymentMethod: 'WhatsApp',
  });

  // Sync formData with user data if user loads after mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || user.address?.phone || prev.phone,
        street: user.address?.street || prev.street,
        city: user.address?.city || prev.city,
        state: user.address?.state || prev.state || 'Gujarat',
        zipCode: user.address?.zipCode || prev.zipCode,
      }));
    }
  }, [user]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentApp, setPaymentApp] = useState('Google Pay');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateCheckoutForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Recipient Full Name is required';
    }

    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email address is required for invoice & order updates';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com)';
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Delivery mobile number is required';
    } else if (!validateIndianMobile(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number. Dummy numbers (e.g. 9999999999) are not allowed.';
    }

    if (!formData.city || !formData.city.trim()) {
      errors.city = 'City name is required';
    }

    if (!formData.street || !formData.street.trim()) {
      errors.street = 'Street address / landmark is required';
    }

    if (!formData.zipCode || !formData.zipCode.trim()) {
      errors.zipCode = 'Pincode / Zip code is required';
    } else if (formData.zipCode.replace(/\D/g, '').length < 6) {
      errors.zipCode = 'Pincode must be at least 6 digits';
    }

    return errors;
  };

  // Helper to trigger direct order creation
  const finalizeOrderCreation = async (paymentProof = null) => {
    const orderPayload = {
      guestInfo: user
        ? null
        : {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
      },
      paymentMethod: formData.paymentMethod,
      items: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        variant: item.variant || undefined,
      })),
      ...(paymentProof && { paymentProof })
    };

    const createdOrder = await api.createOrder(orderPayload, idempotencyKeyRef.current);
    clearCart();
    
    // Redirect based on payment method
    if (formData.paymentMethod === 'WhatsApp') {
      const text = encodeURIComponent(
        `Hello Janki Jiyana House,\n\nI want to place a new order.\n*Order ID:* ${createdOrder._id}\n\n` +
        `*Name:* ${formData.name.trim()}\n` +
        `*Phone:* ${formData.phone.trim()}\n` +
        `*City:* ${formData.city.trim()}\n` +
        `*Address:* ${formData.street.trim()}, ${formData.zipCode.trim()}\n\n` +
        `*Order Items:*\n` +
        cartItems.map(item => `- ${item.name} ${item.variant ? `(${item.variant.name}: ${item.variant.value})` : ''} (Qty: ${item.quantity}) = ₹${item.price * item.quantity}`).join('\n') +
        `\n\n*Total Payable:* ₹${cartSubtotal}`
      );
      window.open(`https://wa.me/919737474672?text=${text}`, '_blank');
      showSuccessToast('Order placed! Redirecting to WhatsApp...');
      navigate(`/order-success/${createdOrder._id}`);
    } else {
      showSuccessToast('Order placed successfully! Thank you for shopping with us.');
      navigate(`/order-success/${createdOrder._id}`);
    }
  };

  // Main Submit Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = validateCheckoutForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErr = Object.values(errors)[0];
      setError(firstErr);
      showErrorToast(firstErr);
      return;
    }

    setFieldErrors({});
    setError('');

    // Check payment method
    if (formData.paymentMethod === 'UPI_QR') {
      setShowPaymentModal(true);
      return;
    }
    
    setLoading(true);
    try {
      await finalizeOrderCreation();
    } catch (err) {
      const msg = err.message || 'Failed to place order. Please try again.';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('File size must be less than 5MB');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyUpi = () => {
    if (settings?.storeUpiId) {
      navigator.clipboard.writeText(settings.storeUpiId);
      showSuccessToast('UPI ID copied to clipboard');
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      showErrorToast('Please enter the UTR/Reference Number');
      return;
    }
    if (!screenshot) {
      showErrorToast('Please upload a screenshot of the payment');
      return;
    }

    setPaymentSubmitting(true);
    try {
      // 1. Upload screenshot first
      const uploadRes = await api.uploadPaymentProof(screenshot);
      const imageUrl = uploadRes.imageUrl;

      // 2. Prepare payment proof object
      const paymentProof = {
        utrNumber,
        paymentApp,
        screenshotUrl: imageUrl
      };

      // 3. Finalize order creation with proof
      await finalizeOrderCreation(paymentProof);
      
      setShowPaymentModal(false);
    } catch (error) {
      showErrorToast(error.message || 'Failed to submit payment details');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative">
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Checkout & Delivery Details</h1>
      </div>

      <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Step 1 & Step 2 Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              Delivery Address & Verified Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Recipient full name"
                  className={`w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none transition-all ${fieldErrors.name
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                    }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={`w-full border rounded-xl p-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all ${fieldErrors.email
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                    }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={`w-full border rounded-xl p-3 pl-11 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none transition-all ${fieldErrors.phone
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                      }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={`w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none transition-all ${fieldErrors.city
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                    }`}
                />
                {fieldErrors.city && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.city}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / Landmark *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Flat No, Building, Street Name, Landmark"
                  className={`w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none transition-all ${fieldErrors.street
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                    }`}
                />
                {fieldErrors.street && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.street}
                  </p>
                )}
              </div>

              {/* ZipCode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode / Zip Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  maxLength={6}
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="395003"
                  className={`w-full border rounded-xl p-3 text-xs sm:text-sm focus:outline-none transition-all ${fieldErrors.zipCode
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                    }`}
                />
                {fieldErrors.zipCode && (
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.zipCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              Select Payment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${formData.paymentMethod === 'WhatsApp'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WhatsApp"
                  checked={formData.paymentMethod === 'WhatsApp'}
                  onChange={handleChange}
                  className="mt-1 accent-brand-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Order via WhatsApp
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send order details directly to our WhatsApp to confirm.</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${formData.paymentMethod === 'UPI_QR'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI_QR"
                  checked={formData.paymentMethod === 'UPI_QR'}
                  onChange={handleChange}
                  className="mt-1 accent-brand-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" /> Pay via UPI QR
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5 h-fit">
          <h3 className="font-black text-slate-900 text-base sm:text-lg border-b border-slate-100 pb-3">
            Items in Order ({cartItems.length})
          </h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const itemId = item.uniqueId || item.product;
              return (
                <div key={itemId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded-lg bg-slate-50 border border-slate-100" />
                    <span className="font-semibold text-slate-800 line-clamp-2 max-w-[130px] sm:max-w-[160px]">
                      {item.name} {item.variant ? `(${item.variant.name}: ${item.variant.value})` : ''}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {item.quantity} x ₹{item.price}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Delivery Fee</span>
              <span className="font-bold text-emerald-600">Extra</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
              <span className="font-black text-slate-900 text-sm">Total Payable</span>
              <span className="font-black text-slate-900 text-2xl">₹{cartSubtotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Confirm & Place Order
              </>
            )}
          </button>

          {/* BOTTOM ERROR MESSAGE DISPLAY BANNER */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Checkout Warning</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-snug pl-6">{error}</p>
            </div>
          )}

          <div className="bg-teal-50/60 p-3 rounded-2xl text-[11px] text-teal-800 flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Packed in 100% plain unbranded box before dispatch.</span>
          </div>
        </div>
      </form>

      {/* UPI QR PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">Scan & Pay to Confirm</h3>
              <p className="text-slate-500 text-xs">
                Your order will be created once you upload the payment proof.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
              <span className="text-xs font-bold text-slate-500">Amount to Pay</span>
              <div className="text-xl font-black text-slate-900 flex items-center gap-1">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                {cartSubtotal}
              </div>
            </div>

            {settings?.storeUpiId ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <QRCodeSVG 
                    value={`upi://pay?pa=${encodeURIComponent(settings.storeUpiId)}&pn=${encodeURIComponent(settings.storeName)}&am=${cartSubtotal}&cu=INR`}
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="w-full">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 text-center">Or pay directly to this UPI ID</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 max-w-[250px] mx-auto">
                    <div className="flex-1 px-2 text-xs font-bold text-slate-700 truncate text-center">
                      {settings.storeUpiId}
                    </div>
                    <button 
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-rose-500 text-sm font-bold">Store UPI ID is not configured.</div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment App Used *</label>
                <select
                  value={paymentApp}
                  onChange={(e) => setPaymentApp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand-500"
                >
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="BHIM">BHIM UPI</option>
                  <option value="Other">Other Bank App</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">12-Digit UTR / Ref Number *</label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 312456789012"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Screenshot *</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    screenshotPreview 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-300 hover:border-brand-500 hover:bg-slate-50'
                  }`}
                >
                  {screenshotPreview ? (
                    <div className="space-y-2">
                      <img src={screenshotPreview} alt="Preview" className="h-20 object-contain mx-auto rounded-lg shadow-sm" />
                      <p className="text-[10px] font-bold text-emerald-700">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud className="w-5 h-5 text-slate-400 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Upload screenshot</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentSubmitting}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs active:scale-95 disabled:bg-slate-400 mt-2"
              >
                {paymentSubmitting ? 'Uploading Proof...' : 'Submit Proof & Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

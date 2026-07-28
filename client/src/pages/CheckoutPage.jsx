import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Banknote, CreditCard, Lock, CheckCircle2, MailCheck, X, AlertCircle, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { validateIndianMobile } from '../utils/phoneValidation';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const CheckoutPage = () => {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user, sendOtp, verifyOtp } = useAuth();
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
    paymentMethod: 'COD',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Email OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

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
      errors.email = 'Email address is required for invoice & OTP verification';
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
  const finalizeOrderCreation = async () => {
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
      })),
    };

    const createdOrder = await api.createOrder(orderPayload, idempotencyKeyRef.current);
    clearCart();
    showSuccessToast('Order placed successfully! Thank you for shopping with us.');
    navigate(`/order-success/${createdOrder._id}`);
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

    // Check if user is already verified
    if (user && user.isPhoneVerified && user.email === formData.email.trim().toLowerCase()) {
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
    } else {
      // Trigger Nodemailer Email OTP Verification Modal
      setOtpLoading(true);
      setOtpError('');
      try {
        const res = await sendOtp(formData.email.trim().toLowerCase(), formData.phone);
        const msg = res.message || `OTP verification code sent to ${formData.email}`;
        setOtpSentMsg(msg);
        showSuccessToast(msg);
        setShowOtpModal(true);
      } catch (err) {
        const msg = err.message || 'Failed to send OTP verification email. Please check your email address.';
        setError(msg);
        showErrorToast(msg);
      } finally {
        setOtpLoading(false);
      }
    }
  };

  // Modal OTP Verification Submit
  const handleVerifyOtpAndPlaceOrder = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      const msg = 'Please enter the 6-digit verification code sent to your email';
      setOtpError(msg);
      showErrorToast(msg);
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      // Verify Email OTP via Nodemailer API
      await verifyOtp(formData.email.trim().toLowerCase(), otpCode.trim(), formData.name);

      // Verification Successful! Proceed to place order
      await finalizeOrderCreation();
      setShowOtpModal(false);
    } catch (err) {
      const msg = err.message || 'Invalid OTP code. Please check your email inbox.';
      setOtpError(msg);
      showErrorToast(msg);
    } finally {
      setOtpLoading(false);
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (OTP Verification) *</label>
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
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${formData.paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="mt-1 accent-brand-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" /> Cash on Delivery (COD)
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash when order reaches your home.</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${formData.paymentMethod === 'Razorpay'
                    ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={formData.paymentMethod === 'Razorpay'}
                  onChange={handleChange}
                  className="mt-1 accent-brand-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                    <CreditCard className="w-4 h-4 text-sky-600 shrink-0" /> Razorpay / Online
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">UPI, Credit/Debit Cards, NetBanking.</p>
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
            {cartItems.map((item) => (
              <div key={item.product} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded-lg bg-slate-50 border border-slate-100" />
                  <span className="font-semibold text-slate-800 line-clamp-1 max-w-[130px] sm:max-w-[160px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  {item.quantity} x ₹{item.price}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Delivery Fee</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
              <span className="font-black text-slate-900 text-sm">Total Payable</span>
              <span className="font-black text-slate-900 text-2xl">₹{cartSubtotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpLoading}
            className={`w-full py-4 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${loading || otpLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
          >
            {loading || otpLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Verification...
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

      {/* NODEMAILER EMAIL OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto border border-brand-100 shadow-sm">
                <MailCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Email Verification Required</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                To confirm your order & prevent fake bookings, we sent a 6-digit OTP code to{' '}
                <span className="font-bold text-slate-800">{formData.email}</span>.
              </p>
            </div>

            {otpError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndPlaceOrder} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  Enter 6-Digit Email Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center tracking-widest text-xl font-black text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
              >
                {otpLoading ? 'Verifying OTP Code...' : 'Verify OTP & Complete Order'} <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

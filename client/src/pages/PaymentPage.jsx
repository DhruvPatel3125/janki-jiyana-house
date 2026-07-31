import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, UploadCloud, CheckCircle2, AlertCircle, IndianRupee, ShieldCheck } from 'lucide-react';

export const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  
  // Payment Submission State
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentApp, setPaymentApp] = useState('Google Pay');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchData = async () => {
    try {
      const [orderData, settingsData] = await Promise.all([
        api.getOrderById(id),
        api.getSettings()
      ]);
      
      setOrder(orderData);
      setSettings(settingsData);

      // If already verified or verification pending, redirect to success
      if (orderData.paymentStatus === 'verification_pending' || orderData.paymentStatus === 'verified') {
        navigate(`/order-success/${orderData._id}`);
      }

      // If payment status is rejected, open the form automatically
      if (orderData.paymentStatus === 'rejected') {
        setShowVerificationForm(true);
      }
    } catch (error) {
      if (error.message.includes('Not authorized') || error.message.includes('log in')) {
        showErrorToast('Please log in to view this payment page.');
        navigate('/login', { state: { returnTo: `/payment/${id}` } });
      } else {
        showErrorToast(error.message || 'Failed to load payment details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUpi = () => {
    if (settings?.storeUpiId) {
      navigator.clipboard.writeText(settings.storeUpiId);
      showSuccessToast('UPI ID copied to clipboard');
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

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      showErrorToast('Please enter the UTR/Reference Number');
      return;
    }
    if (!screenshot && !order?.paymentProof?.screenshotUrl) {
      showErrorToast('Please upload a screenshot of the payment');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl = order?.paymentProof?.screenshotUrl;
      
      // Upload new screenshot if provided
      if (screenshot) {
        const uploadRes = await api.uploadPaymentProof(screenshot);
        uploadedImageUrl = uploadRes.imageUrl;
      }

      await api.submitPaymentProof(order._id, {
        utrNumber,
        paymentApp,
        screenshotUrl: uploadedImageUrl
      });

      showSuccessToast('Payment details submitted successfully!');
      navigate(`/order-success/${order._id}`);
    } catch (error) {
      showErrorToast(error.message || 'Failed to submit payment details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order || !settings) return null;

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Generate UPI URL
  // upi://pay?pa=UPIID&pn=NAME&am=AMOUNT&cu=INR&tn=ORDERID
  const upiUrl = `upi://pay?pa=${encodeURIComponent(settings.storeUpiId)}&pn=${encodeURIComponent(settings.storeName)}&am=${order.totalAmount}&cu=INR&tn=${order._id}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 relative">
      {order.paymentStatus === 'rejected' && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-700 text-sm">Payment Verification Rejected</h3>
            <p className="text-xs mt-1 leading-relaxed">
              Your previous payment proof was rejected. Please re-check the UTR number and upload a clear screenshot of the successful transaction.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-2">
          <h1 className="text-2xl font-black">Complete Your Payment</h1>
          <p className="text-slate-300 text-sm font-medium">Order ID: #{order._id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Amount & Timer */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 gap-4">
            <div className="text-center sm:text-left">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount to Pay</span>
              <div className="text-3xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-1">
                <IndianRupee className="w-7 h-7 text-emerald-600" />
                {order.totalAmount}
              </div>
            </div>
            
            <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 text-center">
              <span className="block text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Time Remaining</span>
              <div className="text-xl font-bold text-rose-700 font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>
          </div>

          {!showVerificationForm ? (
            <div className="space-y-6">
              {/* QR Code Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <QRCodeSVG 
                    value={upiUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <div className="text-center space-y-1 w-full max-w-sm">
                  <span className="text-xs font-bold text-slate-500">Scan with any UPI App</span>
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400 mt-2">
                    <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
                  </div>
                </div>
              </div>

              {/* UPI ID Copy */}
              <div className="max-w-sm mx-auto">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 text-center">Or pay directly to this UPI ID</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <div className="flex-1 px-3 text-sm font-bold text-slate-700 truncate text-center">
                    {settings.storeUpiId}
                  </div>
                  <button 
                    onClick={handleCopyUpi}
                    className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-brand-50 p-4 rounded-2xl text-center border border-brand-100 max-w-md mx-auto">
                <p className="text-sm text-brand-800 font-medium">
                  {settings.paymentInstructions || 'Please scan the QR code to make the payment. After payment, click the button below to verify.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowVerificationForm(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  I have made the payment
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Payment Verification
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowVerificationForm(false)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View QR Again
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment App Used *</label>
                  <select
                    value={paymentApp}
                    onChange={(e) => setPaymentApp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Google Pay">Google Pay</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Paytm">Paytm</option>
                    <option value="BHIM">BHIM UPI</option>
                    <option value="Other">Other Bank App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">12-Digit UTR / Reference Number *</label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 312456789012"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">You can find this 12-digit number in your payment app transaction details.</p>
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
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                      screenshotPreview 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-slate-300 hover:border-brand-500 hover:bg-slate-50'
                    }`}
                  >
                    {screenshotPreview ? (
                      <div className="space-y-3">
                        <img src={screenshotPreview} alt="Preview" className="h-32 object-contain mx-auto rounded-lg shadow-sm" />
                        <p className="text-xs font-bold text-emerald-700">Click to change screenshot</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Click to upload screenshot</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-400"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>Submit Payment Details</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

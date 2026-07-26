import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, MailCheck, CheckCircle2, Eye, EyeOff, AlertCircle, ShieldAlert } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const LoginPage = () => {
  const [authMode, setAuthMode] = useState('otp'); // 'otp' or 'password'
  
  // Password Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP Login State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Per-field validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = location.state?.from || '/';

  // Validate Email
  const validateEmail = (emailStr) => {
    if (!emailStr || !emailStr.trim()) return 'Email address is required';
    if (!emailStr.includes('@') || !emailStr.includes('.')) return 'Please enter a valid email address (e.g. name@example.com)';
    return '';
  };

  // Validate Password Login Form
  const validatePasswordForm = () => {
    const errors = {};
    if (!identifier || !identifier.trim()) errors.identifier = 'Please enter email address or mobile number';
    if (!password || password.trim().length < 6) errors.password = 'Password must be at least 6 characters long';
    return errors;
  };

  // Handle Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErr = Object.values(errors)[0];
      setError(firstErr);
      showErrorToast(firstErr);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    setError('');

    try {
      await login(identifier, password);
      showSuccessToast('Logged in successfully! Welcome back.');
      navigate(redirectTarget);
    } catch (err) {
      const msg = err.message || 'Login failed. Invalid credentials.';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Email OTP via Gmail Nodemailer
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      setError(emailErr);
      showErrorToast(emailErr);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    setError('');
    setStatusMsg('');

    try {
      const res = await sendOtp(email);
      setOtpSent(true);
      const msg = res.message || `OTP verification email sent to ${email}`;
      setStatusMsg(msg);
      showSuccessToast(msg);
    } catch (err) {
      const msg = err.message || 'Failed to send OTP email. Please check your email address.';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Email OTP & Log In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      const msg = 'Please enter the 6-digit OTP code received in your email inbox';
      setFieldErrors({ otp: msg });
      setError(msg);
      showErrorToast(msg);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    setError('');

    try {
      await verifyOtp(email, otp);
      showSuccessToast('Email OTP verified successfully! Welcome.');
      navigate(redirectTarget);
    } catch (err) {
      const msg = err.message || 'OTP verification failed. Please check your email inbox.';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-12 sm:py-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-[11px] font-extrabold px-3 py-1 rounded-full border border-brand-100 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Email OTP Verified Auth
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 text-xs">
            {location.state?.from ? 'Please sign in or verify OTP to complete your order checkout.' : 'Sign in to track orders, manage addresses, and quick checkout.'}
          </p>
        </div>

        {/* Tab Selection: Email OTP vs Password Login */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError('');
              setFieldErrors({});
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              authMode === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✉️ Instant Email OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError('');
              setFieldErrors({});
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              authMode === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔒 Password Login
          </button>
        </div>

        {/* MODE 1: EMAIL OTP AUTHENTICATION */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} noValidate className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      placeholder="name@example.com"
                      className={`w-full border rounded-xl p-3 pl-10 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none transition-all ${
                        fieldErrors.email
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
                >
                  {loading ? 'Sending Email OTP...' : 'Send OTP to Email'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-2xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <MailCheck className="w-4 h-4 text-emerald-600 shrink-0" /> {statusMsg || `OTP email sent to ${email}`}
                  </p>
                  <p className="text-[11px] text-emerald-700">Please check your Gmail / Email Inbox for the 6-digit verification code.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: '' });
                    }}
                    placeholder="Enter 6-digit code"
                    className={`w-full border rounded-xl p-3 text-center tracking-widest text-lg font-black text-slate-900 focus:outline-none transition-all ${
                      fieldErrors.otp
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                    }`}
                  />
                  {fieldErrors.otp && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1 justify-center">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.otp}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
                >
                  {loading ? 'Verifying OTP Code...' : 'Verify OTP & Log In'} <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setFieldErrors({});
                    setError('');
                  }}
                  className="w-full text-xs font-bold text-slate-500 hover:underline text-center"
                >
                  Change Email Address
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 2: EMAIL / PHONE PASSWORD AUTHENTICATION */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email or Mobile Number *</label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: '' });
                  }}
                  placeholder="name@example.com or 9876543210"
                  className={`w-full border rounded-xl p-3 pl-10 text-xs sm:text-sm focus:outline-none transition-all ${
                    fieldErrors.identifier
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {fieldErrors.identifier && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.identifier}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl p-3 pl-10 pr-10 text-xs sm:text-sm focus:outline-none transition-all ${
                    fieldErrors.password
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* BOTTOM ERROR MESSAGE DISPLAY BANNER */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Authentication Warning</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-snug pl-6">{error}</p>
          </div>
        )}

        {/* BOTTOM NAVIGATION FOOTER */}
        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
          <p>
            Don't have an account?{' '}
            <Link to="/register" state={{ from: redirectTarget }} className="font-bold text-brand-600 hover:underline">
              Register new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

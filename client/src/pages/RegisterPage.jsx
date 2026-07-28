import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, MapPin, ArrowRight, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { validateIndianMobile } from '../utils/phoneValidation';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Full Name is required (at least 2 characters)';
    }

    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email address is mandatory for registration';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com)';
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else if (!validateIndianMobile(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number. Dummy numbers (e.g. 9999999999) are not allowed.';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
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
      await register(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.phone.trim(),
        {
          phone: formData.phone.trim(),
          city: formData.city,
        }
      );
      showSuccessToast('Account registered successfully! Welcome to Janki Jiyana House.');
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Registration failed. Try a different email address or mobile number.';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-3 sm:px-4 py-12 sm:py-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Janki Jiyana House Logo"
              className="h-14 w-auto object-contain bg-white p-1 rounded-2xl shadow-sm"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Register Account</h2>
          <p className="text-slate-500 text-xs">Join Janki Jiyana House for fast reordering and order tracking.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={`w-full border rounded-xl p-3 pl-10 text-xs sm:text-sm focus:outline-none transition-all ${fieldErrors.name
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                  }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (For OTP Verification) *</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full border rounded-xl p-3 pl-10 text-xs sm:text-sm font-semibold focus:outline-none transition-all ${fieldErrors.email
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

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={`w-full border rounded-xl p-3 pl-10 text-xs sm:text-sm font-bold focus:outline-none transition-all ${fieldErrors.phone
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                  }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {fieldErrors.phone && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.phone}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={`w-full border rounded-xl p-3 pl-10 text-xs sm:text-sm focus:outline-none transition-all ${fieldErrors.password
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                  }`}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.password}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City / Location</label>
            <div className="relative">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Surat, Gujarat"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
          >
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* BOTTOM ERROR MESSAGE DISPLAY BANNER */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs space-y-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Registration Warning</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-snug pl-6">{error}</p>
          </div>
        )}

        {/* BOTTOM NAVIGATION FOOTER */}
        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
          <p>
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

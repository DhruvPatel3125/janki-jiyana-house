import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, User, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = location.state?.from || '/';

  // Validate Password Login Form
  const validateForm = () => {
    const errors = {};
    if (!identifier || !identifier.trim()) errors.identifier = 'Please enter your email or mobile number';
    if (!password || password.trim().length < 6) errors.password = 'Password must be at least 6 characters long';
    return errors;
  };

  // Handle Login
  const handleLogin = async (e) => {
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
      await login(identifier, password);
      showSuccessToast('Logged in successfully! Welcome back.');
      navigate(redirectTarget);
    } catch (err) {
      const msg = err.message || 'Login failed. Invalid email/phone or password.';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        {/* Header Logo & Title */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Janki Jiyana House Logo"
              className="h-14 w-auto object-contain bg-white p-1 rounded-2xl shadow-sm"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 text-xs">
            {location.state?.from ? 'Please sign in to complete your checkout.' : 'Sign in to track your orders & manage your account.'}
          </p>
        </div>

        {/* Simple Login Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* Email or Mobile Number Input */}
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
                placeholder="Enter email or mobile number"
                className={`w-full border rounded-xl p-3 pl-10 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
                  fieldErrors.identifier
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-brand-500'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {fieldErrors.identifier && (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {fieldErrors.identifier}
              </p>
            )}
          </div>

          {/* Password Input */}
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
                placeholder="Enter your password"
                className={`w-full border rounded-xl p-3 pl-10 pr-10 text-xs sm:text-sm font-medium focus:outline-none transition-all ${
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

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 space-y-2">
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

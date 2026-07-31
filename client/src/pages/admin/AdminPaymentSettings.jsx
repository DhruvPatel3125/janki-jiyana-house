import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Save, Banknote, HelpCircle, CheckCircle2 } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export const AdminPaymentSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeUpiId: '',
    storeName: '',
    qrAutoGeneration: true,
    paymentInstructions: '',
    whatsappNumber: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data) {
        setSettings({
          storeUpiId: data.storeUpiId || '',
          storeName: data.storeName || '',
          qrAutoGeneration: data.qrAutoGeneration !== undefined ? data.qrAutoGeneration : true,
          paymentInstructions: data.paymentInstructions || '',
          whatsappNumber: data.whatsappNumber || '',
        });
      }
    } catch (error) {
      showErrorToast(error.message || 'Failed to fetch payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      showSuccessToast('Payment settings updated successfully!');
    } catch (error) {
      showErrorToast(error.message || 'Failed to update payment settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Payment Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Configure UPI QR and manual payment instructions.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Store UPI ID</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="storeUpiId"
                  value={settings.storeUpiId}
                  onChange={handleChange}
                  placeholder="e.g. yourname@upi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Store Name (For UPI App)</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                placeholder="e.g. Janki Jiyana House"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Support Number</label>
            <input
              type="text"
              name="whatsappNumber"
              value={settings.whatsappNumber}
              onChange={handleChange}
              placeholder="e.g. 919824934361"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              Payment Page Instructions
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer" />
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg text-center z-10">
                  This text will be shown to users when they are on the UPI QR scanning page.
                </div>
              </div>
            </label>
            <textarea
              name="paymentInstructions"
              value={settings.paymentInstructions}
              onChange={handleChange}
              rows="4"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="Write instructions for the customer..."
            ></textarea>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="qrAutoGeneration"
              name="qrAutoGeneration"
              checked={settings.qrAutoGeneration}
              onChange={handleChange}
              className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
            />
            <label htmlFor="qrAutoGeneration" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Enable Auto QR Generation based on Amount & UPI ID
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:bg-brand-400"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

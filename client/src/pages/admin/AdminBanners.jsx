import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Tag, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Pencil, X } from 'lucide-react';
import { api } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    category: '',
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersData, catsData] = await Promise.all([
        api.getAdminBanners().catch(() => api.getBanners().catch(() => [])),
        api.getCategories().catch(() => []),
      ]);
      const list = Array.isArray(bannersData) ? bannersData : [];
      const catsList = Array.isArray(catsData) ? catsData : [];
      setBanners(list);
      setCategories(catsList);
      if (catsList.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: catsList[0].name }));
      }
    } catch (err) {
      showErrorToast(err.message || 'Failed to load discount banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      image: banner.image || '',
      category: banner.category || (categories.length > 0 ? categories[0].name : ''),
      isActive: banner.isActive !== undefined ? banner.isActive : true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      category: categories.length > 0 ? categories[0].name : '',
      isActive: true,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = await api.uploadFile(file);
      setFormData((prev) => ({ ...prev, image: data.imageUrl }));
      showSuccessToast('Banner image uploaded successfully!');
    } catch (err) {
      showErrorToast(err.message || 'Failed to upload banner image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      showErrorToast('Please upload a banner image');
      return;
    }
    if (!formData.category.trim()) {
      showErrorToast('Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBanner) {
        const updated = await api.updateBanner(editingBanner._id, formData);
        setBanners(banners.map((b) => (b._id === editingBanner._id ? updated : b)));
        showSuccessToast('Discount Banner updated successfully!');
      } else {
        const created = await api.createBanner(formData);
        setBanners([created, ...banners]);
        showSuccessToast('Discount Banner saved successfully!');
      }

      // Reset Form
      handleCancelEdit();
    } catch (err) {
      showErrorToast(err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const updated = await api.updateBanner(banner._id, { isActive: !banner.isActive });
      setBanners(banners.map((b) => (b._id === banner._id ? updated : b)));
      showSuccessToast(`Banner status set to ${updated.isActive ? 'Active' : 'Inactive'}`);
    } catch (err) {
      showErrorToast(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount banner?')) return;
    try {
      await api.deleteBanner(id);
      setBanners(banners.filter((b) => b._id !== id));
      showSuccessToast('Banner deleted successfully');
    } catch (err) {
      showErrorToast(err.message || 'Failed to delete banner');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discount Banner Management</h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Upload promotional discount banners linked to specific product categories. These will render directly under "Shop by Category" on the HomePage.
        </p>
      </div>

      {/* ─── ADD / EDIT DISCOUNT BANNER FORM ─── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            {editingBanner ? <Pencil className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-brand-600" />}
            {editingBanner ? 'Edit Discount Banner' : 'Create New Discount Banner'}
          </h2>
          {editingBanner && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title / Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Discount Title / Tag (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Special Deal - FLAT 15% OFF"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Select Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand-500"
                required
              >
                {categories.length === 0 && <option value="">No categories found</option>}
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Banner Image */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Upload Banner Image <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Paste Image URL or click Upload button"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand-500 flex-1"
                required
              />
              <label className={`cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shrink-0 w-full sm:w-auto ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingImage ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-4 h-4" />}
                {uploadingImage ? 'Uploading...' : 'Upload Banner'}
                <input type="file" onChange={handleImageUpload} className="hidden" accept="image/jpeg, image/png, image/webp" disabled={uploadingImage} />
              </label>
            </div>

            {/* Banner Preview */}
            {formData.image && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[3/1] max-h-48 flex items-center justify-center p-2 relative group">
                <img src={formData.image} alt="Banner Preview" className="w-full h-full object-cover rounded-xl" />
                <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md">
                  Preview
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {editingBanner && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={`${editingBanner ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-600 hover:bg-brand-700'} text-white font-bold px-8 py-3.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : editingBanner ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {submitting ? 'Saving...' : editingBanner ? 'Update Discount Banner' : 'Save Discount Banner'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── EXISTING BANNERS LIST ─── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Active & Saved Banners ({banners.length})</h2>

        {banners.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No discount banners uploaded yet</p>
            <p className="text-xs text-slate-400">Use the form above to add discount deal banners for your categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all"
              >
                {/* Image */}
                <div className="relative aspect-[21/9] bg-slate-100 overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title || banner.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full shadow-sm">
                    {banner.category}
                  </div>
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-md ${
                      banner.isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/90 text-slate-200'
                    }`}
                  >
                    {banner.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {banner.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>

                {/* Info & Footer Actions */}
                <div className="p-4 flex items-center justify-between border-t border-slate-100 gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {banner.title || `${banner.category} Discount Banner`}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Redirects to: <span className="text-brand-600 font-bold">/shop?category={encodeURIComponent(banner.category)}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Edit Banner"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

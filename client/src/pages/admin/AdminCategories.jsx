import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderTree, Package, Search, Sparkles, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([api.getCategories(), api.getProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const created = await api.createCategory({
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
      });
      setCategories([...categories, created]);
      setName('');
      setDescription('');
      setImage('');
      showSuccessToast(`Category "${created.name}" created successfully!`);
    } catch (err) {
      const msg = err.message || 'Failed to create category';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
      showSuccessToast(`Category "${catName}" deleted successfully`);
    } catch (err) {
      showErrorToast(err.message || 'Failed to delete category');
    }
  };

  const getProductCountForCategory = (catName) => {
    return products.filter((p) => p.category === catName).length;
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* High-Contrast Vibrant Header Banner */}
      <div
        className="text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between border border-slate-700/50"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0d9488 100%)' }}
      >
        <div className="space-y-1.5 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-teal-500/30 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-teal-400" /> Category Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Store Categories</h1>
          <p className="text-slate-300 text-xs font-medium">
            Create and organize product categories. New categories appear live on shop filters & product creation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Category Form Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-5 h-fit">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Plus className="w-4 h-4" />
            </div>
            Create New Category
          </h3>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maternity Hygiene, Underpants"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief category summary..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-teal-500"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-[11px] focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Image Preview Box */}
            {image && (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={image}
                  alt="Preview"
                  onError={(e) => (e.target.style.display = 'none')}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
            >
              {submitting ? 'Creating Category...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-black text-slate-900 text-lg">
              Active Store Categories ({categories.length})
            </h3>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 text-slate-500 text-xs font-semibold">
              No categories found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((cat) => {
                const count = getProductCountForCategory(cat.name);
                return (
                  <div
                    key={cat._id || cat.name}
                    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-sm font-black text-base"
                            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f172a 100%)' }}
                          >
                            {cat.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{cat.name}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description || 'General category'}</p>
                        </div>
                      </div>

                      {cat._id && (
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-teal-600" /> Products Count
                      </span>
                      <span className="bg-teal-50 text-teal-800 font-extrabold px-3 py-0.5 rounded-full border border-teal-100">
                        {count} Items
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;

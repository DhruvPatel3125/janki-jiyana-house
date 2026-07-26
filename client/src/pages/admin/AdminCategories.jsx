import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderTree, Package, Check } from 'lucide-react';
import { api } from '../../services/api';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
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
    } catch (err) {
      setError(err.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const getProductCountForCategory = (catName) => {
    return products.filter((p) => p.category === catName).length;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Manage Product Categories</h1>
        <p className="text-xs text-slate-500 mt-1">
          Add new product categories dynamically. Newly added categories automatically appear in shop navigation and product dropdowns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Plus className="w-4 h-4 text-brand-600" /> Add New Category
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
                placeholder="e.g. Maternity Care, Adult Underpants"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Short Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief category description for customers..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Banner Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors text-xs flex items-center justify-center gap-2"
            >
              {submitting ? 'Creating Category...' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories List Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Current Store Categories ({categories.length})</h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const count = getProductCountForCategory(cat.name);
                return (
                  <div
                    key={cat._id || cat.name}
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-brand-600" />
                        <h4 className="font-extrabold text-slate-900 text-sm">{cat.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{cat.description || 'No description provided.'}</p>
                      <span className="inline-block mt-2 bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        {count} Active Products
                      </span>
                    </div>

                    {cat._id && (
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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

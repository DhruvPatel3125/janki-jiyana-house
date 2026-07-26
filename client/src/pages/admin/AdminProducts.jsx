import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Package, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sanitary Pads',
    price: '',
    mrp: '',
    stock: '',
    images: '',
    description: '',
    features: '',
    isFeatured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([api.getProducts(), api.getCategories()]);
      setProducts(prodsData);
      setCategories(catsData);
      if (catsData.length > 0) {
        setFormData((prev) => ({ ...prev, category: catsData[0].name }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Sanitary Pads',
      price: '',
      mrp: '',
      stock: '',
      images: '',
      description: '',
      features: '',
      isFeatured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      mrp: product.mrp || '',
      stock: product.stock,
      images: Array.isArray(product.images) ? product.images.join('\n') : product.images || '',
      description: product.description,
      features: Array.isArray(product.features) ? product.features.join('\n') : product.features || '',
      isFeatured: product.isFeatured || false,
    });
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imagesArr = formData.images
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const featuresArr = formData.features
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        mrp: Number(formData.mrp) || Number(formData.price),
        stock: Number(formData.stock),
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'],
        description: formData.description,
        features: featuresArr,
        isFeatured: Boolean(formData.isFeatured),
      };

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct._id, payload);
        setProducts(products.map((p) => (p._id === editingProduct._id ? updated : p)));
      } else {
        const created = await api.createProduct(payload);
        setProducts([created, ...products]);
      }

      setModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Products</h1>
          <p className="text-xs text-slate-500 mt-1">Add, edit, or remove hygiene & baby care items from your catalog.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-accent-orange hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter products by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400">Loading catalog...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <span className="font-bold text-slate-800 line-clamp-1 max-w-xs">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{product.category}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{product.mrp}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            product.stock <= 5
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {product.stock} left
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {product.isFeatured ? (
                          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            ★ Yes
                          </span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-6 p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Soft Care Ultra-Thin Sanitary Pads XL+"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500 font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="299"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="399"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URLs (One per line)</label>
                <textarea
                  rows={2}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Features (One feature per line)</label>
                <textarea
                  rows={2}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="100% Organic Cotton&#10;Dermatologically Tested"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <label htmlFor="isFeatured" className="font-bold text-slate-800 cursor-pointer">
                  Highlight as Featured Product on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

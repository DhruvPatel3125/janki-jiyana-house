import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Package, Sparkles, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useConfirm } from '../../context/ConfirmContext';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { confirm } = useConfirm();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const LIMIT = 20;

  // Debounced search query (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sanitary Pads',
    price: '',
    mrp: '',
    stock: '',
    images: [''],
    description: '',
    features: '',
    isFeatured: false,
    variants: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [debouncedSearch]);

  const fetchCategories = async () => {
    try {
      const catsData = await api.getCategories();
      setCategories(catsData);
      if (catsData.length > 0) {
        setFormData((prev) => ({ ...prev, category: catsData[0].name }));
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await api.getProducts(params);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
      setCurrentPage(page);
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
      images: [''],
      description: '',
      features: '',
      isFeatured: false,
      variants: [],
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
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [''],
      description: product.description,
      features: Array.isArray(product.features) ? product.features.join('\n') : product.features || '',
      isFeatured: product.isFeatured || false,
      variants: Array.isArray(product.variants) ? product.variants : [],
    });
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete Product',
      isDanger: true
    });
    if (!isConfirmed) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      setTotalProducts(prev => prev - 1);
      showSuccessToast('Product deleted successfully');
    } catch (err) {
      showErrorToast(err.message || 'Failed to delete product');
    }
  };

  const handleImportProducts = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const res = await api.importProducts(file);
      showSuccessToast(res.message || 'Products imported successfully');
      fetchProducts(1); // Refresh the list
    } catch (err) {
      showErrorToast(err.message || 'Failed to import products');
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imagesArr = formData.images
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const featuresArr = formData.features
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const variantsArr = formData.variants.filter(v => v.name.trim() && v.value.trim()).map(v => ({
        name: v.name,
        value: v.value,
        price: v.price ? Number(v.price) : undefined,
        mrp: v.mrp ? Number(v.mrp) : undefined,
        stock: v.stock !== '' ? Number(v.stock) : undefined,
        sku: v.sku || '',
        image: v.image || '',
      }));

      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        mrp: Number(formData.mrp) || Number(formData.price),
        stock: Number(formData.stock),
        images: imagesArr.length > 0 ? imagesArr : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'],
        description: formData.description,
        features: featuresArr,
        isFeatured: formData.isFeatured,
        variants: variantsArr,
      };

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct._id, payload);
        setProducts(products.map((p) => (p._id === editingProduct._id ? updated : p)));
        showSuccessToast('Product updated successfully!');
      } else {
        const created = await api.createProduct(payload);
        setProducts([created, ...products]);
        setTotalProducts(prev => prev + 1);
        showSuccessToast('Product created successfully!');
      }

      setModalOpen(false);
    } catch (err) {
      showErrorToast(err.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadImageHandler = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = await api.uploadFile(file);
      const newImages = [...formData.images];
      newImages[index] = data.imageUrl;
      setFormData({ ...formData, images: newImages });
      showSuccessToast('Image uploaded successfully');
    } catch (err) {
      showErrorToast(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const uploadVariantImageHandler = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = await api.uploadFile(file);
      const newVariants = [...formData.variants];
      newVariants[index] = { ...newVariants[index], image: data.imageUrl };
      setFormData({ ...formData, variants: newVariants });
      showSuccessToast('Variant image uploaded successfully');
    } catch (err) {
      showErrorToast(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };
  const addImageInput = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };
  const removeImageInput = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length === 0) newImages.push(''); // keep at least one
    setFormData({ ...formData, images: newImages });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };
  const addVariantInput = () => {
    setFormData({ ...formData, variants: [...formData.variants, { name: '', value: '', price: '', mrp: '', stock: '', sku: '', image: '' }] });
  };
  const removeVariantInput = (index) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  // Server-side search — no client-side filter needed
  const displayedProducts = products;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Products</h1>
          <p className="text-xs text-slate-500 mt-1">Add, edit, or remove hygiene & baby care items from your catalog.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
            {isImporting ? <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-4 h-4" />}
            {isImporting ? 'Importing...' : 'Import Excel/CSV'}
            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleImportProducts} disabled={isImporting} />
          </label>
          <button
            onClick={handleOpenAddModal}
            className="bg-accent-orange hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Filter / Server Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); }}
          placeholder="Search products by name..."
          className="w-full text-xs font-semibold text-slate-800 focus:outline-none"
        />
        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{totalProducts} total</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400">Loading products...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / MRP</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'}
                          alt={product.name}
                          loading="lazy"
                          className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px] sm:max-w-[300px]">{product.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-brand-600">{product.category}</td>
                    <td className="p-4 font-bold text-slate-900">
                      ₹{product.price}{' '}
                      {product.mrp > product.price && <span className="line-through text-slate-400 text-[10px] ml-1">₹{product.mrp}</span>}
                    </td>
                    <td>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      {product.isFeatured ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" /> Featured
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {displayedProducts.map((product) => (
              <div key={product._id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-start gap-3 border-b border-slate-200/60 pb-3">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200'}
                    alt={product.name}
                    loading="lazy"
                    className="w-12 h-12 object-cover rounded-xl bg-white border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 line-clamp-2 text-xs leading-snug">{product.name}</p>
                    <p className="font-bold text-brand-600 text-[10px] mt-0.5">{product.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Price</p>
                    <p className="font-bold text-slate-900">
                      ₹{product.price}
                      {product.mrp > product.price && <span className="line-through text-slate-400 text-[10px] ml-1">₹{product.mrp}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-semibold text-[10px] uppercase">Stock</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {product.stock} units
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {product.isFeatured ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Featured
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-semibold">Standard</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors bg-white border border-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors bg-white border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {displayedProducts.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                No products found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchProducts(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => fetchProducts(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900">
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Anion Sanitary Napkins (Large)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold focus:outline-none focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
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
                    placeholder="e.g. 50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 299"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="e.g. 399"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-700">Product Images</label>
                  <button
                    type="button"
                    onClick={addImageInput}
                    className="text-brand-600 hover:text-brand-700 font-bold text-[11px] flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Image Box
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <div className="flex-1 w-full flex items-center gap-2">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder="Image URL"
                          className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <label className="flex-1 sm:flex-none cursor-pointer text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3 py-2.5 rounded-lg text-[11px] font-bold text-center flex items-center justify-center gap-1 transition-colors">
                          <Upload className="w-3 h-3" />
                          <input type="file" onChange={(e) => uploadImageHandler(e, index)} className="hidden" accept="image/jpeg, image/png, image/webp" />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeImageInput(index)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-700">Product Variants (Optional)</label>
                  <button
                    type="button"
                    onClick={addVariantInput}
                    className="text-brand-600 hover:text-brand-700 font-bold text-[11px] flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
                
                {formData.variants.length > 0 ? (
                  <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => removeVariantInput(index)}
                          className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Variant Name *</label>
                            <input
                              type="text"
                              value={variant.name}
                              onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                              placeholder="e.g. Size, Color"
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-brand-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Variant Value *</label>
                            <input
                              type="text"
                              value={variant.value}
                              onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                              placeholder="e.g. XL, Blue"
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-brand-500 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Price</label>
                            <input
                              type="number"
                              value={variant.price || ''}
                              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              placeholder="Override Price"
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-brand-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">MRP</label>
                            <input
                              type="number"
                              value={variant.mrp || ''}
                              onChange={(e) => handleVariantChange(index, 'mrp', e.target.value)}
                              placeholder="Override MRP"
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-brand-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Stock</label>
                            <input
                              type="number"
                              value={variant.stock || ''}
                              onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                              placeholder="Specific Stock"
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-brand-500 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">SKU</label>
                            <input
                              type="text"
                              value={variant.sku || ''}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              placeholder="Variant SKU"
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-brand-500 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Image URL</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                value={variant.image || ''}
                                onChange={(e) => handleVariantChange(index, 'image', e.target.value)}
                                placeholder="Variant Image URL"
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-semibold focus:outline-none focus:border-brand-500 text-xs flex-1"
                              />
                              <label className="cursor-pointer text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center transition-colors">
                                <Upload className="w-4 h-4" />
                                <input type="file" onChange={(e) => uploadVariantImageHandler(e, index)} className="hidden" accept="image/jpeg, image/png, image/webp" />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">No variants added. Click 'Add Variant' to add colors, sizes, etc.</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description and usage guide..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Key Features (One per line)</label>
                <textarea
                  rows={2}
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Super Absorbent Core&#10;Zero Leakage Wings&#10;100% Organic Cotton"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded accent-brand-600"
                />
                <label htmlFor="isFeatured" className="font-bold text-slate-800">
                  Highlight on Home Page as Featured Product
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

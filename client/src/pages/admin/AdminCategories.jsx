import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderTree, Package, Search, Sparkles, Image as ImageIcon, Upload, Edit2, X } from 'lucide-react';
import { api } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useConfirm } from '../../context/ConfirmContext';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [parentCategory, setParentCategory] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, prodsData] = await Promise.all([
        api.getCategories(),
        api.getProducts({ limit: 1000 }),
      ]);
      setCategories(cats || []);
      setProducts(prodsData.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      let finalImage = image.trim();
      if (!finalImage) {
        const PLACEHOLDERS = [
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
          'https://images.unsplash.com/photo-1518444065439-e91be1e541ce?w=600',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',
          'https://images.unsplash.com/photo-1572227494541-61cfcb7f10b7?w=600'
        ];
        finalImage = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: finalImage,
        parentCategory: parentCategory || null,
      };

      if (editingCategory) {
        const updated = await api.updateCategory(editingCategory._id, payload);
        // Refresh categories fully to get updated populated parent info
        const freshCats = await api.getCategories();
        setCategories(freshCats);
        showSuccessToast(`Category "${updated.name}" updated successfully!`);
        setEditingCategory(null);
      } else {
        const created = await api.createCategory(payload);
        const freshCats = await api.getCategories();
        setCategories(freshCats);
        showSuccessToast(`Category "${created.name}" created successfully!`);
      }
      
      setName('');
      setDescription('');
      setImage('');
      setParentCategory('');
    } catch (err) {
      const msg = err.message || 'Failed to save category';
      setError(msg);
      showErrorToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setParentCategory(cat.parentCategory?._id || '');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('');
    setParentCategory('');
    setError('');
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const data = await api.uploadFile(file);
      setImage(data.imageUrl);
      showSuccessToast('Image uploaded successfully');
    } catch (err) {
      showErrorToast(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteCategory = async (id, catName) => {
    const isConfirmed = await confirm({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${catName}"?`,
      confirmText: 'Delete Category',
      isDanger: true
    });
    if (!isConfirmed) return;
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
      showSuccessToast(`Category "${catName}" deleted successfully`);
    } catch (err) {
      showErrorToast(err.message || 'Failed to delete category');
    }
  };

  const getProductCountForCategory = (categoryObj) => {
    if (!categoryObj) return 0;
    const catNameLower = (typeof categoryObj === 'string' ? categoryObj : categoryObj.name || '').trim().toLowerCase();

    // Find all subcategories belonging to this category
    const subCatNames = categories
      .filter((c) => {
        if (!c.parentCategory) return false;
        const parentId = typeof c.parentCategory === 'object' ? c.parentCategory._id : c.parentCategory;
        const parentName = typeof c.parentCategory === 'object' ? c.parentCategory.name : '';
        const curId = typeof categoryObj === 'object' ? categoryObj._id : '';
        return (curId && parentId === curId) || (parentName && parentName.trim().toLowerCase() === catNameLower);
      })
      .map((c) => c.name.trim().toLowerCase());

    return products.filter((p) => {
      if (!p.category) return false;
      const pCat = p.category.trim().toLowerCase();
      return pCat === catNameLower || subCatNames.includes(pCat);
    }).length;
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                {editingCategory ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            {editingCategory && (
              <button onClick={handleCancelEdit} type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              <label className="block font-bold text-slate-700 mb-1">Parent Category (Optional)</label>
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="">None (Top Level Category)</option>
                {categories
                  .filter((c) => !editingCategory || c._id !== editingCategory._id) // prevent selecting self as parent
                  .map((c) => (
                    <option key={c._id || c.name} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Image URL</label>
                <label className="cursor-pointer text-teal-600 hover:text-teal-700 font-bold text-[11px] flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
                  {uploadingImage ? (
                    <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input type="file" onChange={uploadFileHandler} className="hidden" accept="image/jpeg, image/png, image/webp" />
                </label>
              </div>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/... or click Upload"
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
              {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
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
                const count = getProductCountForCategory(cat);
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
                          <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                            {cat.name}
                            {cat.parentCategory && (
                              <span className="ml-2 inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-bold border border-slate-200 uppercase tracking-wider">
                                Subcategory of {cat.parentCategory.name}
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{cat.description || 'General category'}</p>
                        </div>
                      </div>

                      {cat._id && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="text-slate-400 hover:text-teal-600 p-1.5 rounded-xl hover:bg-teal-50 transition-colors shrink-0"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

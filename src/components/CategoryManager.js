'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Tag } from 'lucide-react';
import { getAllCategoriesList, createCategory, deleteCategory } from '@/lib/actions/blogActions';

export default function CategoryManager({ isOpen, onClose, onCategoryAdded }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAllCategoriesList();
      if (result.success) {
        setCategories(result.categories);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await createCategory(newCategoryName.trim());
      if (result.success) {
        setSuccess('Category created successfully!');
        setNewCategoryName('');
        fetchCategories();
        if (onCategoryAdded) {
          onCategoryAdded(result.category);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        setCategories(categories.filter(cat => cat._id !== categoryId));
        setSuccess('Category deleted successfully!');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            Manage Categories
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side - Add Category */}
            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Category
              </h3>
              <form onSubmit={handleAddCategory}>
                <div className="mb-4">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Enter category name"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Category
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Side - Categories List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                All Categories ({categories.length})
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No categories yet</p>
                  <p className="text-sm">Add your first category from the left</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <span className="font-medium text-slate-800">{category.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


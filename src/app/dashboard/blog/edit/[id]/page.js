'use client';

import { useState, useEffect, use, useRef } from 'react';
import { getBlogById, updateBlog, getAllCategoriesList } from '@/lib/actions/blogActions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, X, Calendar, Loader2, ArrowLeft, Tag, Plus } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import CategoryManager from '@/components/CategoryManager';

export default function EditBlogPage(props) {
  const params = use(props.params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subHeading: '',
    category: '',
    content: '',
    featuredImage: '',
    status: 'draft',
    scheduledAt: '',
  });

  useEffect(() => {
    if (params?.id) {
      fetchBlog(params.id);
      fetchCategories();
    }
  }, [params?.id]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const result = await getAllCategoriesList();
      if (result.success && result.categories.length > 0) {
        setCategories(result.categories);
        if (!formData.category) {
          setFormData((prev) => ({ ...prev, category: result.categories[0].name }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryAdded = () => {
    fetchCategories();
  };

  const fetchBlog = async (id) => {
    try {
      setFetching(true);
      const result = await getBlogById(id);
      if (result.success) {
        const blog = result.blog;
        setFormData({
          title: blog.title || '',
          subHeading: blog.subHeading || '',
          category: blog.category || '',
          content: blog.content || '',
          featuredImage: blog.featuredImage || '',
          status: blog.status || 'draft',
          scheduledAt: blog.scheduledAt ? new Date(blog.scheduledAt).toISOString().slice(0, 16) : '',
        });
        setImagePreview(blog.featuredImage || null);
        setTags(blog.tags || []);
      } else {
        alert('Error: ' + result.message);
        router.push('/dashboard/blog/view');
      }
    } catch (err) {
      alert('Failed to fetch blog');
      router.push('/dashboard/blog/view');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, featuredImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, featuredImage: '' }));
  };

  // Tag handling
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        ...formData,
        tags: tags,
        content: editorRef.current?.getContent() || formData.content,
      };

      const result = await updateBlog(params.id, blogData);

      if (result.success) {
        alert('🎉 ' + result.message);
        router.push('/dashboard/blog/view');
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (error) {
      alert('❌ Error: Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard/blog/view"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Blogs
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Blog</h1>
        <p className="text-slate-500 mt-2">Update your blog post</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
            Blog Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="Enter blog title"
            required
          />
        </div>

        {/* Sub-Heading */}
        <div>
          <label htmlFor="subHeading" className="block text-sm font-semibold text-slate-700 mb-2">
            Sub-Title
          </label>
          <input
            type="text"
            id="subHeading"
            name="subHeading"
            value={formData.subHeading}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="Enter sub-heading"
          />
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700">
              Category *
            </label>
            <button
              type="button"
              onClick={() => setCategoryManagerOpen(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Manage Categories
            </button>
          </div>
          {loadingCategories ? (
            <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 flex items-center">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
              <span className="text-slate-400">Loading categories...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500">
              No categories available. Click "Manage Categories" to add one.
            </div>
          ) : (
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
              required
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Blog Content - Rich Text Editor */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Blog Content *
          </label>
          <RichTextEditor
            ref={editorRef}
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Write your blog content here..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Featured Image
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600 font-medium">Click to upload image</p>
                <p className="text-slate-400 text-sm">PNG, JPG, GIF up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-slate-700 mb-2">
            Tags (SEO) - Press Enter to add
          </label>
          <div className="border-2 border-slate-200 rounded-xl focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all p-2">
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {/* Tag Input */}
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="w-full px-2 py-1 focus:outline-none"
              placeholder={tags.length === 0 ? "Type tag and press Enter..." : ""}
            />
          </div>
        </div>

        {/* Status & Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
            >
              <option value="draft">Save</option>
              <option value="published">Publish</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {formData.status === 'scheduled' && (
            <div>
              <label htmlFor="scheduledAt" className="block text-sm font-semibold text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </span>
            ) : (
              'Update Blog'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/blog/view')}
            className="py-3 px-6 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Category Manager Modal */}
      <CategoryManager 
        isOpen={categoryManagerOpen} 
        onClose={() => setCategoryManagerOpen(false)}
        onCategoryAdded={handleCategoryAdded}
      />
    </div>
  );
}


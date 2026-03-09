'use client';

import { useState, useRef, useEffect } from 'react';
import { createBlog, getAllCategoriesList } from '@/lib/actions/blogActions';
import { useRouter } from 'next/navigation';
import { Upload, X, Calendar, Loader2, Tag, Plus, Image as ImageIcon } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import CategoryManager from '@/components/CategoryManager';
import MediaGalleryModal from '@/components/MediaGalleryModal';

export default function AddBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subHeading: '',
    category: '',
    content: '',
    featuredImage: '',
    featuredImageAlt: '',
    featuredImageCaption: '',
    status: 'draft',
    scheduledAt: '',
  });

  // Fetch categories from database
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const result = await getAllCategoriesList();
      if (result.success && result.categories.length > 0) {
        setCategories(result.categories);
        setFormData((prev) => ({ ...prev, category: result.categories[0].name }));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategoryAdded = () => {
    fetchCategories();
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

  const handleSelectFromGallery = (mediaItem) => {
    setImagePreview(mediaItem.url);
    setFormData((prev) => ({ 
      ...prev, 
      featuredImage: mediaItem.url,
      featuredImageAlt: mediaItem.altText || '',
      featuredImageCaption: mediaItem.caption || ''
    }));
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

      const result = await createBlog(blogData);

      if (result.success) {
        alert(`🎉 ${result.message}`);
        router.push('/dashboard/blog/view');
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: Something went wrong. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Add New Blog</h1>
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
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Manage Categories
            </button>
          </div>
          {categoryLoading ? (
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-slate-700">
              Featured Image
            </label>
            <button
              type="button"
              onClick={() => setMediaGalleryOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              Select from Gallery
            </button>
          </div>
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
              <div className="flex flex-col items-center">
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
              </div>
            )}
          </div>
        </div>

        {/* Featured Image Caption */}
        <div>
          <label htmlFor="featuredImageCaption" className="block text-sm font-semibold text-slate-700 mb-2">
            Featured Image Caption
          </label>
          <input
            type="text"
            id="featuredImageCaption"
            name="featuredImageCaption"
            value={formData.featuredImageCaption}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="Add a caption to display below the image"
          />
          <p className="text-xs text-slate-500 mt-1">Optional - displayed below the featured image on the blog</p>
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
                Creating...
              </span>
            ) : (
              'Create Blog'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
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

      {/* Media Gallery Modal */}
      <MediaGalleryModal
        isOpen={mediaGalleryOpen}
        onClose={() => setMediaGalleryOpen(false)}
        onSelect={handleSelectFromGallery}
      />
    </div>
  );
}


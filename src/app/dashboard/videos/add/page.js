'use client';

import { useState } from 'react';
import { createVideo } from '@/lib/actions/videoActions';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, Play, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export default function AddVideoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    titleUrdu: '',
    videoUrl: '',
    thumbnail: '',
    thumbnailAlt: '',
    duration: '',
    description: '',
    status: 'draft',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
        setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setFormData((prev) => ({ ...prev, thumbnail: '' }));
  };

  const handleThumbnailUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      thumbnail: url,
      thumbnailAlt: prev.thumbnailAlt || ''
    }));
    if (url) {
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createVideo(formData);

      if (result.success) {
        alert(`🎉 ${result.message}`);
        router.push('/dashboard/videos');
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: Something went wrong. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Extract video ID from URL for preview
  const getVideoPreview = () => {
    if (!formData.videoUrl) return null;
    
    // YouTube
    const ytMatch = formData.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return { type: 'youtube', id: ytMatch[1] };
    }
    
    // Vimeo
    const vimeoMatch = formData.videoUrl.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] };
    }
    
    return null;
  };

  const videoPreview = getVideoPreview();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Add New Video</h1>
        <p className="text-slate-500 mt-2">Add YouTube or Vimeo videos to your collection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title (English) */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
            Video Title (English) *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="Enter video title in English"
            required
          />
        </div>

        {/* Title (Urdu) */}
        <div>
          <label htmlFor="titleUrdu" className="block text-sm font-semibold text-slate-700 mb-2">
            Video Title (Urdu / ردیباب)
          </label>
          <input
            type="text"
            id="titleUrdu"
            name="titleUrdu"
            value={formData.titleUrdu}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-urdu"
            placeholder="اردو میں عنوان درج کریں"
            dir="rtl"
          />
        </div>

        {/* Video URL */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-semibold text-slate-700 mb-2">
            YouTube/Vimeo Link *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LinkIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="url"
              id="videoUrl"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Paste a YouTube or Vimeo video URL</p>
        </div>

        {/* Video Preview */}
        {videoPreview && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Video Preview
            </label>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {videoPreview.type === 'youtube' && (
                <iframe
                  src={`https://www.youtube.com/embed/${videoPreview.id}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {videoPreview.type === 'vimeo' && (
                <iframe
                  src={`https://player.vimeo.com/video/${videoPreview.id}`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}

        {/* Thumbnail URL */}
        <div>
          <label htmlFor="thumbnailUrl" className="block text-sm font-semibold text-slate-700 mb-2">
            Thumbnail URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="url"
              id="thumbnailUrl"
              value={formData.thumbnail}
              onChange={handleThumbnailUrlChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>
        </div>

        {/* Or Upload Thumbnail */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Or Upload Thumbnail Image
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors">
            {thumbnailPreview ? (
              <div className="relative inline-block">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="max-h-48 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                  <p className="text-slate-600 font-medium">Click to upload thumbnail</p>
                  <p className="text-slate-400 text-sm">PNG, JPG, GIF up to 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Alt Text */}
        <div>
          <label htmlFor="thumbnailAlt" className="block text-sm font-semibold text-slate-700 mb-2">
            Thumbnail Alt Text (SEO)
          </label>
          <input
            type="text"
            id="thumbnailAlt"
            name="thumbnailAlt"
            value={formData.thumbnailAlt}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="Describe the thumbnail image for accessibility and SEO"
          />
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-semibold text-slate-700 mb-2">
            Duration
          </label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="e.g., 5:30 or 10:15"
          />
          <p className="text-xs text-slate-500 mt-1">Format: minutes:seconds (e.g., 5:30)</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
            placeholder="Enter video description"
          />
        </div>

        {/* Status */}
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
            <option value="draft">Save as Draft</option>
            <option value="published">Publish Now</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Create Video
              </>
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
    </div>
  );
}


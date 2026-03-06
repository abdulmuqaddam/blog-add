'use client';

import { useState, useEffect } from 'react';
import { getMediaLibrary, uploadToLibrary, deleteMedia, updateMediaAltText } from '@/lib/actions/mediaActions';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Check,
  Trash2,
  Plus,
  Search,
  Grid,
  List,
  Edit3,
  Save,
  Info
} from 'lucide-react';

export default function MediaGalleryModal({ isOpen, onClose, onSelect }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload states
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  // Edit details states
  const [editingImage, setEditingImage] = useState(null);
  const [editAltText, setEditAltText] = useState('');
  const [updatingAlt, setUpdatingAlt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const result = await getMediaLibrary();
      if (result.success) {
        setMedia(result.media);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    // Validate alt text
    if (!uploadAltText || uploadAltText.trim().length < 3) {
      setUploadError('Alt text is required (minimum 3 characters) for SEO and accessibility');
      return;
    }

    setUploading(true);
    setUploadError('');
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      
      try {
        const result = await uploadToLibrary({
          imageBase64: base64Image,
          imageAlt: uploadAltText.trim(),
        });

        if (result.success) {
          setMedia([result.media, ...media]);
          setSelectedImage(result.media);
          setUploadAltText('');
        } else {
          setUploadError(result.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadError(error.message || 'Failed to upload image. Please check console for details.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (e, mediaItem) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const result = await deleteMedia(mediaItem._id);
      if (result.success) {
        setMedia(media.filter(m => m._id !== mediaItem._id));
        if (selectedImage?._id === mediaItem._id) {
          setSelectedImage(null);
        }
        if (editingImage?._id === mediaItem._id) {
          setEditingImage(null);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete image');
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      // Pass both url and altText to the parent component
      onSelect({
        url: selectedImage.url,
        altText: selectedImage.imageAlt || ''
      });
      onClose();
    }
  };

  // Open edit panel for an image
  const handleOpenEditPanel = (e, mediaItem) => {
    e.stopPropagation();
    setEditingImage(mediaItem);
    setEditAltText(mediaItem.imageAlt || '');
  };

  // Save alt text update
  const handleSaveAltText = async () => {
    if (!editAltText || editAltText.trim().length < 3) {
      alert('Alt text must be at least 3 characters');
      return;
    }

    setUpdatingAlt(true);
    try {
      const result = await updateMediaAltText(editingImage._id, editAltText.trim());
      
      if (result.success) {
        // Update the media list with the new alt text
        const updatedMedia = media.map(m => 
          m._id === editingImage._id ? result.media : m
        );
        setMedia(updatedMedia);
        
        // Update selected and editing states
        if (selectedImage?._id === editingImage._id) {
          setSelectedImage(result.media);
        }
        setEditingImage(result.media);
        alert('Alt text updated successfully!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update alt text');
    } finally {
      setUpdatingAlt(false);
    }
  };

  const filteredMedia = media.filter(item => 
    item.imageAlt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item._id.toString().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
              <p className="text-sm text-gray-500">{media.length} images</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by alt text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
              />
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium">No images found</p>
                <p className="text-sm">Upload your first image to get started</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedImage(item)}
                    className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      selectedImage?._id === item._id
                        ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                        : 'border-transparent hover:border-gray-300'
                    } ${editingImage?._id === item._id ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                  >
                    <img
                      src={item.url}
                      alt={item.imageAlt || 'Media image'}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      selectedImage?._id === item._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {selectedImage?._id === item._id && (
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEditPanel(e, item)}
                        className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                        title="Edit details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item)}
                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Alt Text Badge */}
                    {item.imageAlt && (
                      <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)]">
                        <span className="inline-block px-2 py-1 bg-black/60 text-white text-xs rounded truncate">
                          {item.imageAlt}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedia.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedImage(item)}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                      selectedImage?._id === item._id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-transparent hover:bg-gray-50'
                    } ${editingImage?._id === item._id ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    <img
                      src={item.url}
                      alt={item.imageAlt || 'Media image'}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.imageAlt || 'No alt text'}</p>
                      <p className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenEditPanel(e, item)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Edit details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedImage?._id === item._id && (
                      <Check className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Sidebar */}
          <div className="w-72 border-l border-gray-200 p-4 bg-gray-50 flex flex-col overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Upload New</h3>
            
            {/* Alt Text Input for Upload */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Alt Text (SEO) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uploadAltText}
                onChange={(e) => {
                  setUploadAltText(e.target.value);
                  setUploadError('');
                }}
                placeholder="Describe image for accessibility"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">Required for SEO and accessibility</p>
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{uploadError}</p>
              </div>
            )}
            
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'bg-gray-100' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'}`}>
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Click to upload</p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Selected Preview */}
            {selectedImage && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Image</h3>
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.imageAlt || 'Selected'}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-3 bg-white">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedImage.imageAlt || 'No alt text'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Details Panel */}
          {editingImage && (
            <div className="w-72 border-l border-amber-200 bg-amber-50 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Image Details</h3>
                </div>
                <button
                  onClick={() => setEditingImage(null)}
                  className="p-1 hover:bg-amber-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-4">
                <img
                  src={editingImage.url}
                  alt={editingImage.imageAlt || 'Preview'}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>

              {/* Alt Text Edit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text (SEO) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe this image for accessibility and SEO..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  disabled={updatingAlt}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editAltText.length}/200 characters
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveAltText}
                disabled={updatingAlt || !editAltText || editAltText.trim().length < 3}
                className={`w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  updatingAlt || !editAltText || editAltText.trim().length < 3
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {updatingAlt ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>

              {/* Image Info */}
              <div className="mt-4 pt-4 border-t border-amber-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Uploaded:</span> {new Date(editingImage.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  <span className="font-medium">URL:</span> {editingImage.url.substring(0, 50)}...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSelect}
            disabled={!selectedImage}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              selectedImage
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedImage ? 'Select Image' : 'Select an image'}
          </button>
        </div>
      </div>
    </div>
  );
}


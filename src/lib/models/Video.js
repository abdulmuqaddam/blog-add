// Video Mongoose Schema for Video Management System
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  titleUrdu: {
    type: String,
    trim: true,
    default: '',
    maxlength: [200, 'Urdu title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    index: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true,
  },
  videoType: {
    type: String,
    enum: ['youtube', 'vimeo', 'direct'],
    default: 'youtube',
  },
  embedId: {
    type: String,
    trim: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  thumbnailAlt: {
    type: String,
    trim: true,
    default: '',
    maxlength: [200, 'Alt text cannot exceed 200 characters'],
  },
  duration: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  publishedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Helper function to extract YouTube/Vimeo embed ID
function extractEmbedId(url) {
  if (!url) return '';
  
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  // Vimeo patterns
  const vimeoPattern = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoPattern);
  if (vimeoMatch) return vimeoMatch[1];
  
  return '';
}

// Helper function to detect video type
function detectVideoType(url) {
  if (!url) return 'direct';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  return 'direct';
}

// Generate slug from title before saving
videoSchema.pre('save', async function () {
  // Generate clean slug only when creating new video without slug
  if (!this.slug && this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // Include Urdu characters
      .replace(/(^-|-$)/g, '');
    
    // Check if slug exists and add suffix only if needed
    const VideoModel = this.constructor;
    const existing = await VideoModel.findOne({ slug: baseSlug });
    
    if (existing) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      this.slug = `${baseSlug}-${randomSuffix}`;
    } else {
      this.slug = baseSlug;
    }
  }
  
  // Extract embed ID from video URL
  if (this.videoUrl) {
    this.embedId = extractEmbedId(this.videoUrl);
    this.videoType = detectVideoType(this.videoUrl);
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Index for better query performance
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ status: 1, isActive: 1, createdAt: -1 });

const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

export default Video;


// Blog Mongoose Schema
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  subHeading: {
    type: String,
    trim: true,
    maxlength: [300, 'Sub-heading cannot exceed 300 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    index: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  featuredImage: {
    type: String,
    default: '',
  },
  featuredImageAlt: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, 'Alt text cannot exceed 200 characters'],
  },
  featuredImageCaption: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, 'Caption cannot exceed 200 characters'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    default: 'General',
  },
  
  // SEO Fields - Yoast-style
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
    default: '',
    trim: true,
  },
  focusKeyword: {
    type: String,
    default: '',
    trim: true,
  },
  focusKeywords: [{
    type: String,
    trim: true,
  }],
  schemaType: {
    type: String,
    enum: ['Article', 'NewsArticle', 'VideoObject'],
    default: 'Article',
  },
  // Video-specific fields for VideoObject schema
  videoEmbedUrl: {
    type: String,
    default: '',
    trim: true,
  },
  videoDuration: {
    type: String,
    default: '',
    trim: true,
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'scheduled'],
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
  scheduledAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Create slug from title before saving
blogSchema.pre('save', async function () {
  // Generate clean slug only when creating new blog without slug
  if (!this.slug && this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug exists and add suffix only if needed
    const BlogModel = this.constructor;
    const existing = await BlogModel.findOne({ slug: baseSlug });
    
    if (existing) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      this.slug = `${baseSlug}-${randomSuffix}`;
    } else {
      this.slug = baseSlug;
    }
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Index for searching
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;

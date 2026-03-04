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
  tags: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    default: 'General',
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
blogSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// Index for searching
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;

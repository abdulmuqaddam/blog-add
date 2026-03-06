// Media Mongoose Schema for Media Library
import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
  },
  imageAlt: {
    type: String,
    required: [true, 'Alt text is required for accessibility and SEO'],
    trim: true,
    minlength: [3, 'Alt text must be at least 3 characters'],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for better query performance
mediaSchema.index({ createdAt: -1 });

const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);

export default Media;


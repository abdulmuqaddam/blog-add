'use server';

// Server Actions for Media Library Management
import dbConnect from '../db';
import Media from '../models/Media';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(), // Trim any extra spaces
});

/**
 * Get all media items from the library
 */
export async function getMediaLibrary() {
  try {
    await dbConnect();
    const media = await Media.find().sort({ createdAt: -1 });
    return { success: true, media: JSON.parse(JSON.stringify(media)) };
  } catch (error) {
    console.error('Get media library error:', error);
    return { success: false, message: 'Failed to fetch media', media: [] };
  }
}

/**
 * Upload image to cloud storage and save to database
 */
export async function uploadToLibrary(data) {
  try {
    await dbConnect();

    const { imageBase64, imageAlt, uploadedBy } = data;

    if (!imageBase64) {
      return { success: false, message: 'Image is required' };
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      return { success: false, message: 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME to your environment variables.' };
    }

    // Check if API credentials are configured
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return { success: false, message: 'Cloudinary API credentials are missing. Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your environment variables.' };
    }

    // Log Cloudinary config for debugging (without sensitive data)
    console.log('Cloudinary config check:', {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'missing',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing',
    });

    // Extract base64 data
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const uploadBuffer = Buffer.from(base64Data, 'base64');

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'blog-media',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          }
          else resolve(result);
        }
      ).end(uploadBuffer);
    });

    console.log('Cloudinary upload successful:', uploadResult.public_id);

    // Save to database
    const mediaItem = await Media.create({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      imageAlt: imageAlt || '',
      uploadedBy: uploadedBy || null,
    });

    return {
      success: true,
      message: 'Image uploaded successfully',
      media: JSON.parse(JSON.stringify(mediaItem)),
    };
  } catch (error) {
    console.error('Upload to library error:', error);
    return { success: false, message: error.message || 'Failed to upload image. Please try again.' };
  }
}

/**
 * Delete media item from cloud and database
 */
export async function deleteMedia(id) {
  try {
    await dbConnect();

    const media = await Media.findById(id);

    if (!media) {
      return { success: false, message: 'Media not found' };
    }

    // Delete from Cloudinary (only if configured)
    if (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      try {
        await cloudinary.uploader.destroy(media.publicId);
      } catch (e) {
        console.warn('Failed to delete from Cloudinary:', e);
      }
    }

    // Delete from database
    await Media.findByIdAndDelete(id);

    return { success: true, message: 'Media deleted successfully' };
  } catch (error) {
    console.error('Delete media error:', error);
    return { success: false, message: 'Failed to delete media. Please try again.' };
  }
}

/**
 * Update alt text for a media item
 */
export async function updateMediaAltText(id, altText) {
  try {
    await dbConnect();

    if (!altText || altText.trim().length < 3) {
      return { success: false, message: 'Alt text must be at least 3 characters' };
    }

    const media = await Media.findById(id);

    if (!media) {
      return { success: false, message: 'Media not found' };
    }

    media.imageAlt = altText.trim();
    await media.save();

    return {
      success: true,
      message: 'Alt text updated successfully',
      media: JSON.parse(JSON.stringify(media)),
    };
  } catch (error) {
    console.error('Update alt text error:', error);
    return { success: false, message: 'Failed to update alt text. Please try again.' };
  }
}


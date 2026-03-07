'use server';

// Server Actions for Media Library Management
import dbConnect from '../db';
import Media from '../models/Media';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

/**
 * Cloudinary Diagnostic Server Action
 * Checks environment variables, connectivity, and account usage
 */
export async function diagnoseCloudinary() {
  const diagnostics = {
    environmentVariables: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
      publicApiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
    },
    connectivity: 'UNKNOWN',
    accountUsage: null,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Check if credentials are missing
  if (!cloudName) {
    diagnostics.errors.push('CLOUDINARY_CLOUD_NAME is not set');
  }
  if (!apiKey) {
    diagnostics.errors.push('CLOUDINARY_API_KEY is not set');
  }
  if (!apiSecret) {
    diagnostics.errors.push('CLOUDINARY_API_SECRET is not set');
  }

  if (diagnostics.errors.length > 0) {
    diagnostics.connectivity = 'CREDENTIALS_MISSING';
    return { success: false, diagnostics };
  }

  // Test Cloudinary connectivity by trying to ping the API
  try {
    // Try to get account details to check connectivity
    const accountResult = await new Promise((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    diagnostics.connectivity = 'CONNECTED';
    diagnostics.cloudinaryResponse = accountResult;
  } catch (error) {
    diagnostics.connectivity = 'ERROR';
    diagnostics.errors.push(`Connection error: ${error.message}`);
    
    // Categorize specific errors
    if (error.message.includes('Signature')) {
      diagnostics.errors.push('ERROR_TYPE: Signature Mismatch - Check API_SECRET');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      diagnostics.errors.push('ERROR_TYPE: Network Timeout - Check internet connection');
    } else if (error.message.includes('rate limit') || error.message.includes('over limit')) {
      diagnostics.errors.push('ERROR_TYPE: Account Over Limit - Check Cloudinary usage');
    }
  }

  // Get account usage if connected
  if (diagnostics.connectivity === 'CONNECTED') {
    try {
      // Use resource type to get usage stats
      const usageResult = await new Promise((resolve, reject) => {
        cloudinary.api.usage((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      diagnostics.accountUsage = {
        plan: usageResult.plan,
        credits: {
          used: usageResult.credits?.used || 0,
          limit: usageResult.credits?.limit || 0,
          remaining: usageResult.credits?.remaining || 0,
        },
        bandwidth: {
          used: usageResult.bandwidth?.used || 0,
          limit: usageResult.bandwidth?.limit || 0,
          remaining: usageResult.bandwidth?.remaining || 0,
        },
        storage: {
          used: usageResult.storage?.used || 0,
          limit: usageResult.storage?.limit || 0,
          remaining: usageResult.storage?.remaining || 0,
        },
      };

      // Check if approaching limits
      if (usageResult.credits?.limit && usageResult.credits.used >= usageResult.credits.limit * 0.9) {
        diagnostics.errors.push('WARNING: Approaching credit limit (90% used)');
      }
    } catch (usageError) {
      diagnostics.errors.push(`Could not fetch usage: ${usageError.message}`);
    }
  }

  return {
    success: diagnostics.connectivity === 'CONNECTED',
    diagnostics,
  };
}

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
  console.log('=== UPLOAD DEBUG START ===');
  
  try {
    console.log('Step 1: Starting upload process');
    
    await dbConnect();
    console.log('Step 2: Database connected');

    const { imageBase64, imageAlt, imageCaption, uploadedBy } = data;
    console.log('Step 3: Received data:', { 
      hasImageBase64: !!imageBase64, 
      imageBase64Length: imageBase64?.length,
      imageAlt: imageAlt,
      uploadedBy: uploadedBy
    });

    if (!imageBase64) {
      console.error('ERROR: No image base64 provided');
      return { success: false, message: 'Image is required' };
    }

    if (!imageAlt || imageAlt.trim().length < 3) {
      console.error('ERROR: Alt text too short');
      return { success: false, message: 'Alt text is required (minimum 3 characters) for SEO and accessibility' };
    }

    // Check if Cloudinary is configured - check ALL required env vars
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    // Also check NEXT_PUBLIC_ versions
    const publicCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const publicApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    console.log('Step 4: Environment variables check:');
    console.log('  - CLOUDINARY_CLOUD_NAME:', cloudName ? 'SET (' + cloudName + ')' : 'MISSING');
    console.log('  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:', publicCloudName ? 'SET (' + publicCloudName + ')' : 'MISSING');
    console.log('  - CLOUDINARY_API_KEY:', apiKey ? 'SET' : 'MISSING');
    console.log('  - NEXT_PUBLIC_CLOUDINARY_API_KEY:', publicApiKey ? 'SET' : 'MISSING');
    console.log('  - CLOUDINARY_API_SECRET:', apiSecret ? 'SET (length: ' + apiSecret.length + ')' : 'MISSING');

    // Use whichever is available
    const finalCloudName = cloudName || publicCloudName;
    const finalApiKey = apiKey || publicApiKey;

    // If Cloudinary is not fully configured, save directly to database as base64
    if (!finalCloudName || !finalApiKey || !apiSecret) {
      console.log('Step 5: Cloudinary NOT fully configured, saving locally');
      console.log('  - finalCloudName:', finalCloudName);
      console.log('  - finalApiKey:', finalApiKey);
      console.log('  - apiSecret:', apiSecret ? 'SET' : 'MISSING');
      
      // Save directly to database with base64 URL
      const mediaItem = await Media.create({
        url: imageBase64, // Store base64 directly
        publicId: `local-${Date.now()}`,
        imageAlt: imageAlt.trim(),
        caption: imageCaption ? imageCaption.trim() : '',
        uploadedBy: uploadedBy || null,
      });

      console.log('Step 6: Saved to database locally, mediaItem:', mediaItem._id);
      console.log('=== UPLOAD DEBUG END (LOCAL) ===');

      return {
        success: true,
        message: 'Image uploaded successfully (saved locally)',
        media: JSON.parse(JSON.stringify(mediaItem)),
      };
    }

    console.log('Step 5: Cloudinary IS configured, attempting upload...');
    console.log('  - Using cloud name:', finalCloudName);

    // Upload to Cloudinary using direct upload method (more reliable for base64)
    console.log('Step 6: Calling cloudinary.uploader.upload()...');
    
    try {
      const uploadResult = await cloudinary.uploader.upload(imageBase64, {
        folder: 'blog-media',
        resource_type: 'image',
      });

      console.log('Step 7: Cloudinary upload SUCCESS!');
      console.log('  - public_id:', uploadResult.public_id);
      console.log('  - secure_url:', uploadResult.secure_url);
      console.log('  - format:', uploadResult.format);
      console.log('  - width:', uploadResult.width);
      console.log('  - height:', uploadResult.height);

      // Save to database
      console.log('Step 8: Saving to database...');
      const mediaItem = await Media.create({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        imageAlt: imageAlt || '',
        caption: imageCaption ? imageCaption.trim() : '',
        uploadedBy: uploadedBy || null,
      });

      console.log('Step 9: Database save SUCCESS, mediaItem._id:', mediaItem._id);
      console.log('=== UPLOAD DEBUG END (CLOUDINARY) ===');

      return {
        success: true,
        message: 'Image uploaded successfully',
        media: JSON.parse(JSON.stringify(mediaItem)),
      };
    } catch (cloudinaryError) {
      console.error('!!! CLOUDINARY UPLOAD ERROR !!!');
      console.error('  Error name:', cloudinaryError.name);
      console.error('  Error message:', cloudinaryError.message);
      console.error('  Error code:', cloudinaryError.code);
      console.error('  Error stack:', cloudinaryError.stack);
      
      // Return detailed error
      return { 
        success: false, 
        message: 'Cloudinary upload failed: ' + cloudinaryError.message 
      };
    }

  } catch (error) {
    console.error('!!! GENERAL UPLOAD ERROR !!!');
    console.error('  Error name:', error.name);
    console.error('  Error message:', error.message);
    console.error('  Error stack:', error.stack);
    console.error('  Error:', JSON.stringify(error, null, 2));
    console.log('=== UPLOAD DEBUG END (ERROR) ===');
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


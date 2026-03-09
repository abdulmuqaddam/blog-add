'use server';

// Server Actions for Video Management
import dbConnect from '../db';
import Video from '../models/Video';
import { cookies } from 'next/headers';
import { verifyToken } from '../auth';

/**
 * Generate a unique slug from title
 * @param {string} title - Video title
 * @param {Object} Video - Video model
 * @returns {string} Unique slug
 */
async function generateUniqueSlug(title, Video) {
  // Create base slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Check if base slug exists
  const existingVideo = await Video.findOne({ slug: baseSlug });
  
  if (!existingVideo) {
    return baseSlug;
  }
  
  // If exists, add a random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Extract embed ID from video URL
 * @param {string} url - Video URL
 * @returns {string} Embed ID
 */
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

/**
 * Detect video type from URL
 * @param {string} url - Video URL
 * @returns {string} Video type
 */
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

/**
 * Get all videos (for admin dashboard)
 * @returns {Array} Array of all videos
 */
export async function getAllVideos() {
  try {
    await dbConnect();
    const videos = await Video.find().sort({ createdAt: -1 });
    return { success: true, videos: JSON.parse(JSON.stringify(videos)) };
  } catch (error) {
    console.error('Get all videos error:', error);
    return { success: false, message: 'Failed to fetch videos', videos: [] };
  }
}

/**
 * Get all published videos (for public website)
 * @param {number} limit - Number of videos to fetch
 * @returns {Array} Array of published videos
 */
export async function getPublishedVideos(limit = 10) {
  try {
    await dbConnect();
    const videos = await Video.find({ status: 'published', isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    return { success: true, videos: JSON.parse(JSON.stringify(videos)) };
  } catch (error) {
    console.error('Get published videos error:', error);
    return { success: false, message: 'Failed to fetch videos', videos: [] };
  }
}

/**
 * Get latest videos for sidebar
 * @param {number} limit - Number of videos to fetch
 * @returns {Array} Array of latest videos
 */
export async function getLatestVideos(limit = 5) {
  try {
    await dbConnect();
    const videos = await Video.find({ status: 'published', isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    return { success: true, videos: JSON.parse(JSON.stringify(videos)) };
  } catch (error) {
    console.error('Get latest videos error:', error);
    return { success: false, message: 'Failed to fetch videos', videos: [] };
  }
}

/**
 * Get video by ID
 * @param {string} videoId - Video ID or Slug
 * @returns {Object} Video object
 */
export async function getVideoById(videoId) {
  try {
    await dbConnect();
    
    // Check if it's a valid ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(videoId);
    
    let video;
    if (isValidObjectId) {
      // It's a valid ObjectId, try to find by ID
      video = await Video.findById(videoId);
    } else {
      // It's likely a slug, try to find by slug
      video = await Video.findOne({ slug: videoId });
    }
    
    if (!video) {
      return { success: false, message: 'Video not found' };
    }
    
    return { success: true, video: JSON.parse(JSON.stringify(video)) };
  } catch (error) {
    console.error('Get video by ID error:', error);
    return { success: false, message: 'Failed to fetch video' };
  }
}

/**
 * Get video by slug
 * @param {string} slug - Video slug
 * @returns {Object} Video object
 */
export async function getVideoBySlug(slug) {
  try {
    await dbConnect();
    const video = await Video.findOne({ slug });
    
    if (!video) {
      return { success: false, message: 'Video not found' };
    }
    
    return { success: true, video: JSON.parse(JSON.stringify(video)) };
  } catch (error) {
    console.error('Get video by slug error:', error);
    return { success: false, message: 'Failed to fetch video' };
  }
}

/**
 * Create new video
 * @param {Object} videoData - Video data
 * @returns {Object} Result object
 */
export async function createVideo(videoData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to create a video' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    // Generate unique slug from title
    const slug = await generateUniqueSlug(videoData.title, Video);
    
    // Extract embed ID and detect video type
    const embedId = extractEmbedId(videoData.videoUrl);
    const videoType = detectVideoType(videoData.videoUrl);
    
    const video = await Video.create({
      ...videoData,
      slug,
      embedId,
      videoType,
    });
    
    return { success: true, message: 'Video created successfully', video: JSON.parse(JSON.stringify(video)) };
  } catch (error) {
    console.error('Create video error:', error);
    return { success: false, message: 'Failed to create video' };
  }
}

/**
 * Update video
 * @param {string} videoId - Video ID
 * @param {Object} videoData - Updated video data
 * @returns {Object} Result object
 */
export async function updateVideo(videoId, videoData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to update a video' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    const video = await Video.findById(videoId);
    
    if (!video) {
      return { success: false, message: 'Video not found' };
    }
    
    // Update embed ID and video type if URL changed
    if (videoData.videoUrl && videoData.videoUrl !== video.videoUrl) {
      videoData.embedId = extractEmbedId(videoData.videoUrl);
      videoData.videoType = detectVideoType(videoData.videoUrl);
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(videoId, videoData, { returnDocument: 'after' });
    
    return { success: true, message: 'Video updated successfully', video: JSON.parse(JSON.stringify(updatedVideo)) };
  } catch (error) {
    console.error('Update video error:', error);
    return { success: false, message: 'Failed to update video' };
  }
}

/**
 * Delete video
 * @param {string} videoId - Video ID
 * @returns {Object} Result object
 */
export async function deleteVideo(videoId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to delete a video' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    const video = await Video.findById(videoId);
    
    if (!video) {
      return { success: false, message: 'Video not found' };
    }
    
    await Video.findByIdAndDelete(videoId);
    
    return { success: true, message: 'Video deleted successfully' };
  } catch (error) {
    console.error('Delete video error:', error);
    return { success: false, message: 'Failed to delete video' };
  }
}

/**
 * Toggle video active status
 * @param {string} videoId - Video ID
 * @returns {Object} Result object
 */
export async function toggleVideoStatus(videoId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to toggle video status' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    const video = await Video.findById(videoId);
    
    if (!video) {
      return { success: false, message: 'Video not found' };
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { isActive: !video.isActive },
      { returnDocument: 'after' }
    );
    
    return { 
      success: true, 
      message: updatedVideo.isActive ? 'Video activated successfully' : 'Video deactivated successfully',
      video: JSON.parse(JSON.stringify(updatedVideo))
    };
  } catch (error) {
    console.error('Toggle video status error:', error);
    return { success: false, message: 'Failed to toggle video status' };
  }
}

/**
 * Increment view count for a video
 * @param {string} videoId - Video ID
 * @returns {Object} Result object
 */
export async function incrementVideoViews(videoId) {
  try {
    await dbConnect();
    
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );
    
    if (!updatedVideo) {
      return { success: false, message: 'Video not found' };
    }
    
    return { success: true, views: updatedVideo.views };
  } catch (error) {
    console.error('Increment video views error:', error);
    return { success: false, message: 'Failed to increment views' };
  }
}

/**
 * Get video statistics for dashboard
 * @returns {Object} Statistics object
 */
export async function getVideoStats() {
  try {
    await dbConnect();
    
    // Get total videos count
    const totalVideos = await Video.countDocuments();
    
    // Get published videos count
    const publishedVideos = await Video.countDocuments({ status: 'published', isActive: true });
    
    // Get draft videos count
    const draftVideos = await Video.countDocuments({ status: 'draft' });
    
    // Get total views
    const videos = await Video.find();
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
    
    return {
      success: true,
      stats: {
        totalVideos,
        publishedVideos,
        draftVideos,
        activeVideos: publishedVideos,
        totalViews,
      },
    };
  } catch (error) {
    console.error('Get video stats error:', error);
    return { success: false, message: 'Failed to fetch video stats' };
  }
}


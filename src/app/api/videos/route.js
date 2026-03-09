// API Routes for Video Management
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Video from '@/lib/models/Video';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper function to extract embed ID
function extractEmbedId(url) {
  if (!url) return '';
  
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
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

// Helper function to generate unique slug
async function generateUniqueSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const existingVideo = await Video.findOne({ slug: baseSlug });
  
  if (!existingVideo) {
    return baseSlug;
  }
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

// GET - Fetch all videos (for admin) or published videos (for public)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // If status is specified, filter by it
    if (status) {
      query.status = status;
    }
    
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Video.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      videos: JSON.parse(JSON.stringify(videos)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get videos error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST - Create new video (admin only)
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Please login to create a video' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const body = await request.json();
    const { title, titleUrdu, videoUrl, thumbnail, thumbnailAlt, duration, description, status } = body;
    
    // Validate required fields
    if (!title || !videoUrl) {
      return NextResponse.json(
        { success: false, message: 'Title and video URL are required' },
        { status: 400 }
      );
    }
    
    // Generate unique slug
    const slug = await generateUniqueSlug(title);
    
    // Extract embed ID and detect video type
    const embedId = extractEmbedId(videoUrl);
    const videoType = detectVideoType(videoUrl);
    
    const video = await Video.create({
      title,
      titleUrdu: titleUrdu || '',
      slug,
      videoUrl,
      embedId,
      videoType,
      thumbnail: thumbnail || '',
      thumbnailAlt: thumbnailAlt || '',
      duration: duration || '',
      description: description || '',
      status: status || 'draft',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
      video: JSON.parse(JSON.stringify(video)),
    });
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create video' },
      { status: 500 }
    );
  }
}

// DELETE - Delete video (admin only)
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Please login to delete a video' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');
    
    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    const video = await Video.findById(videoId);
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    await Video.findByIdAndDelete(videoId);
    
    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete video' },
      { status: 500 }
    );
  }
}


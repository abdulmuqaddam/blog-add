'use server';

// Server Actions for Blog Management
import dbConnect from '../db';
import Blog from '../models/Blog';
import User from '../models/User';
import Category from '../models/Category';
import { cookies } from 'next/headers';
import { verifyToken } from '../auth';

/**
 * Get all blog posts (for admin dashboard)
 * @returns {Array} Array of all blog posts
 */
export async function getAllBlogsForAdmin() {
  try {
    await dbConnect();
    const blogs = await Blog.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
  } catch (error) {
    console.error('Get all blogs error:', error);
    return { success: false, message: 'Failed to fetch blogs' };
  }
}

/**
 * Get blog by ID
 * @param {string} blogId - Blog ID or Slug
 * @returns {Object} Blog post
 */
export async function getBlogById(blogId) {
  try {
    await dbConnect();
    
    // Check if it's a valid ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(blogId);
    
    let blog;
    if (isValidObjectId) {
      // It's a valid ObjectId, try to find by ID
      blog = await Blog.findById(blogId).populate('author', 'name email');
    } else {
      // It's likely a slug, try to find by slug
      blog = await Blog.findOne({ slug: blogId }).populate('author', 'name email');
    }
    
    if (!blog) {
      return { success: false, message: 'Blog not found' };
    }
    
    return { success: true, blog: JSON.parse(JSON.stringify(blog)) };
  } catch (error) {
    console.error('Get blog by ID error:', error);
    return { success: false, message: 'Failed to fetch blog' };
  }
}

/**
 * Get blog by slug
 * @param {string} slug - Blog slug
 * @returns {Object} Blog post
 */
export async function getBlogBySlug(slug) {
  try {
    await dbConnect();
    const blog = await Blog.findOne({ slug }).populate('author', 'name email');
    
    if (!blog) {
      return { success: false, message: 'Blog not found' };
    }
    
    // Note: Views are incremented on the client side via ViewCounter component
    
    return { success: true, blog: JSON.parse(JSON.stringify(blog)) };
  } catch (error) {
    console.error('Get blog by slug error:', error);
    return { success: false, message: 'Failed to fetch blog' };
  }
}

/**
 * Generate a unique slug from title
 * @param {string} title - Blog title
 * @param {Object} Blog - Blog model
 * @returns {string} Unique slug
 */
async function generateUniqueSlug(title, Blog) {
  // Create base slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Check if base slug exists
  const existingBlog = await Blog.findOne({ slug: baseSlug });
  
  if (!existingBlog) {
    return baseSlug;
  }
  
  // If exists, add a random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Create new blog post
 * @param {Object} blogData - Blog data
 * @returns {Object} Result object
 */
export async function createBlog(blogData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to create a blog' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    // Generate unique slug from title
    const slug = await generateUniqueSlug(blogData.title, Blog);
    
    const blog = await Blog.create({
      ...blogData,
      slug,
      author: decoded.userId,
    });
    
    return { success: true, message: 'Blog created successfully', blog: JSON.parse(JSON.stringify(blog)) };
  } catch (error) {
    console.error('Create blog error:', error);
    return { success: false, message: 'Failed to create blog' };
  }
}

/**
 * Update blog post
 * @param {string} blogId - Blog ID
 * @param {Object} blogData - Updated blog data
 * @returns {Object} Result object
 */
export async function updateBlog(blogId, blogData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to update a blog' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return { success: false, message: 'Blog not found' };
    }
    
    // Check if user is the author or admin
    if (blog.author.toString() !== decoded.userId && decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return { success: false, message: 'Not authorized to update this blog' };
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, blogData, { returnDocument: 'after' });
    
    return { success: true, message: 'Blog updated successfully', blog: JSON.parse(JSON.stringify(updatedBlog)) };
  } catch (error) {
    console.error('Update blog error:', error);
    return { success: false, message: 'Failed to update blog' };
  }
}

/**
 * Delete blog post
 * @param {string} blogId - Blog ID
 * @returns {Object} Result object
 */
export async function deleteBlog(blogId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to delete a blog' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return { success: false, message: 'Blog not found' };
    }
    
    // Check if user is the author or admin
    if (blog.author.toString() !== decoded.userId && decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return { success: false, message: 'Not authorized to delete this blog' };
    }
    
    await Blog.findByIdAndDelete(blogId);
    
    return { success: true, message: 'Blog deleted successfully' };
  } catch (error) {
    console.error('Delete blog error:', error);
    return { success: false, message: 'Failed to delete blog' };
  }
}

/**
 * Toggle blog active status
 * @param {string} blogId - Blog ID
 * @returns {Object} Result object
 */
export async function toggleBlogStatus(blogId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to toggle blog status' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    await dbConnect();
    
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      return { success: false, message: 'Blog not found' };
    }
    
    // Check if user is the author or admin
    if (blog.author.toString() !== decoded.userId && decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return { success: false, message: 'Not authorized to update this blog' };
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { isActive: !blog.isActive },
      { returnDocument: 'after' }
    );
    
    return { 
      success: true, 
      message: updatedBlog.isActive ? 'Blog activated successfully' : 'Blog deactivated successfully',
      blog: JSON.parse(JSON.stringify(updatedBlog))
    };
  } catch (error) {
    console.error('Toggle blog status error:', error);
    return { success: false, message: 'Failed to toggle blog status' };
  }
}

/**
 * Get all published blogs (for public homepage)
 * @param {number} limit - Number of blogs to fetch
 * @returns {Array} Array of published blogs
 */
export async function getPublishedBlogs(limit = 10) {
  try {
    await dbConnect();
    
    // Process any scheduled blogs that have passed their scheduled time
    await processScheduledBlogs();
    
    const blogs = await Blog.find({ status: 'published', isActive: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
  } catch (error) {
    console.error('Get published blogs error:', error);
    return { success: false, message: 'Failed to fetch blogs' };
  }
}

/**
 * Get latest blogs for homepage
 * @returns {Object} Object with featured blog and recent blogs
 */
export async function getLatestBlogs() {
  try {
    await dbConnect();
    
    // Process any scheduled blogs that have passed their scheduled time
    await processScheduledBlogs();
    
    // Get the latest published blog (featured)
    const featuredBlog = await Blog.find({ status: 'published', isActive: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(1);
    
    // Get next 4 recent blogs for sidebar
    const recentBlogs = await Blog.find({ 
      status: 'published', 
      isActive: true,
      _id: { $ne: featuredBlog[0]?._id }
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(4);
    
    // Get remaining recent blogs for grid
    const remainingBlogs = await Blog.find({ 
      status: 'published', 
      isActive: true,
      _id: { $nin: [featuredBlog[0]?._id, ...recentBlogs.map(b => b._id)] }
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);
    
    return { 
      success: true, 
      featuredBlog: featuredBlog[0] ? JSON.parse(JSON.stringify(featuredBlog[0])) : null,
      recentBlogs: JSON.parse(JSON.stringify(recentBlogs)),
      remainingBlogs: JSON.parse(JSON.stringify(remainingBlogs))
    };
  } catch (error) {
    console.error('Get latest blogs error:', error);
    return { success: false, message: 'Failed to fetch blogs' };
  }
}

/**
 * Get related blogs by category
 * @param {string} category - Blog category
 * @param {string} currentBlogId - Current blog ID to exclude
 * @param {number} limit - Number of blogs to fetch
 * @returns {Array} Array of related blogs
 */
export async function getRelatedBlogs(category, currentBlogId, limit = 3) {
  try {
    await dbConnect();
    const blogs = await Blog.find({ 
      status: 'published', 
      isActive: true,
      category: category,
      _id: { $ne: currentBlogId }
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
  } catch (error) {
    console.error('Get related blogs error:', error);
    return { success: false, message: 'Failed to fetch related blogs' };
  }
}

/**
 * Get all categories
 * @returns {Array} Array of unique categories
 */
export async function getAllCategories() {
  try {
    await dbConnect();
    const categories = await Blog.distinct('category', { status: 'published', isActive: true });
    return { success: true, categories };
  } catch (error) {
    console.error('Get categories error:', error);
    return { success: false, message: 'Failed to fetch categories' };
  }
}

/**
 * Get related posts based on category and tags
 * @param {string} currentPostId - Current blog ID to exclude
 * @param {string} category - Current blog category
 * @param {Array} tags - Current blog tags
 * @returns {Array} Array of related blogs
 */
export async function getRelatedPosts(currentPostId, category, tags = []) {
  try {
    await dbConnect();
    
    // Find blogs where category matches OR any tags match, excluding current post
    const relatedBlogs = await Blog.find({
      _id: { $ne: currentPostId },
      status: 'published',
      isActive: true,
      $or: [
        { category: category },
        { tags: { $in: tags } }
      ]
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(4);
    
    return { success: true, blogs: JSON.parse(JSON.stringify(relatedBlogs)) };
  } catch (error) {
    console.error('Get related posts error:', error);
    return { success: false, message: 'Failed to fetch related posts', blogs: [] };
  }
}

/**
 * Get blog statistics for dashboard
 * @returns {Object} Statistics object
 */
export async function getBlogStats() {
  try {
    await dbConnect();
    
    // Get total blogs count
    const totalBlogs = await Blog.countDocuments();
    
    // Get published blogs count
    const publishedBlogs = await Blog.countDocuments({ status: 'published', isActive: true });
    
    // Get draft blogs count
    const draftBlogs = await Blog.countDocuments({ status: 'draft' });
    
    // Get pending/scheduled blogs count
    const scheduledBlogs = await Blog.countDocuments({ status: 'scheduled' });
    
    // Get blogs by category
    const blogsByCategory = await Blog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    return {
      success: true,
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        scheduledBlogs,
        activeBlogs: publishedBlogs,
      },
      categoryStats: blogsByCategory.map(cat => ({
        category: cat._id || 'Uncategorized',
        count: cat.count
      }))
    };
  } catch (error) {
    console.error('Get blog stats error:', error);
    return { success: false, message: 'Failed to fetch blog stats' };
  }
}

// ============ VIEW MANAGEMENT FUNCTIONS ============

/**
 * Increment view count for a blog post
 * @param {string} blogId - Blog ID
 * @returns {Object} Result object
 */
export async function incrementViews(blogId) {
  try {
    await dbConnect();
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );
    
    if (!updatedBlog) {
      return { success: false, message: 'Blog not found' };
    }
    
    return { success: true, views: updatedBlog.views };
  } catch (error) {
    console.error('Increment views error:', error);
    return { success: false, message: 'Failed to increment views' };
  }
}

// ============ CATEGORY MANAGEMENT FUNCTIONS ============

/**
 * Process scheduled blogs - publish blogs whose scheduled time has passed
 */
async function processScheduledBlogs() {
  try {
    await dbConnect();
    const now = new Date();
    
    // Find and update scheduled blogs that have passed their scheduled time
    await Blog.updateMany(
      { 
        status: 'scheduled', 
        scheduledAt: { $lte: now }
      },
      { 
        status: 'published',
        publishedAt: now
      },
      { returnDocument: 'after' }
    );
  } catch (error) {
    console.error('Process scheduled blogs error:', error);
  }
}

/**
 * Get all categories from Category collection
 * @returns {Array} Array of categories
 */
export async function getAllCategoriesList() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return { success: true, categories: JSON.parse(JSON.stringify(categories)) };
  } catch (error) {
    console.error('Get all categories error:', error);
    return { success: false, message: 'Failed to fetch categories', categories: [] };
  }
}

/**
 * Create a new category
 * @param {string} name - Category name
 * @param {string} description - Category description (optional)
 * @returns {Object} Result object
 */
export async function createCategory(name, description = '') {
  try {
    await dbConnect();
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return { success: false, message: 'Category already exists' };
    }
    
    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const category = await Category.create({
      name,
      slug,
      description,
    });
    
    return { success: true, message: 'Category created successfully', category: JSON.parse(JSON.stringify(category)) };
  } catch (error) {
    console.error('Create category error:', error);
    return { success: false, message: 'Failed to create category' };
  }
}

/**
 * Delete a category
 * @param {string} categoryId - Category ID
 * @returns {Object} Result object
 */
export async function deleteCategory(categoryId) {
  try {
    await dbConnect();
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return { success: false, message: 'Category not found' };
    }
    
    await Category.findByIdAndDelete(categoryId);
    
    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    console.error('Delete category error:', error);
    return { success: false, message: 'Failed to delete category' };
  }
}

/**
 * Get blogs by tag
 * @param {string} tag - Tag name
 * @returns {Array} Array of blogs with the specified tag
 */
export async function getBlogsByTag(tag) {
  try {
    await dbConnect();
    
    const blogs = await Blog.find({ 
      status: 'published', 
      isActive: true,
      tags: { $in: [tag] }
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
  } catch (error) {
    console.error('Get blogs by tag error:', error);
    return { success: false, message: 'Failed to fetch blogs by tag', blogs: [] };
  }
}

/**
 * Get adjacent posts (next and previous)
 * @param {string} currentBlogId - Current blog ID
 * @param {string} category - Current blog category
 * @returns {Object} Object with next and previous posts
 */
export async function getAdjacentPosts(currentBlogId, category) {
  try {
    await dbConnect();
    
    // Get all published blogs in the same category, sorted by date
    const blogs = await Blog.find({ 
      status: 'published', 
      isActive: true,
      _id: { $ne: currentBlogId },
      category: category
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const blogsArray = JSON.parse(JSON.stringify(blogs));
    
    // Find current blog position
    const allBlogsInCategory = await Blog.find({ 
      status: 'published', 
      isActive: true,
      category: category
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    const allBlogsArray = JSON.parse(JSON.stringify(allBlogsInCategory));
    const currentIndex = allBlogsArray.findIndex(b => b._id === currentBlogId);
    
    const previousPost = currentIndex > 0 ? allBlogsArray[currentIndex - 1] : null;
    const nextPost = currentIndex < allBlogsArray.length - 1 ? allBlogsArray[currentIndex + 1] : null;
    
    // If no adjacent posts in same category, get from all posts
    if (!previousPost || !nextPost) {
      const allPosts = await Blog.find({ 
        status: 'published', 
        isActive: true,
        _id: { $ne: currentBlogId }
      })
        .populate('author', 'name email')
        .sort({ createdAt: -1 });
      
      const allPostsArray = JSON.parse(JSON.stringify(allPosts));
      const currentPostIndex = allPostsArray.findIndex(b => b._id === currentBlogId);
      
      return {
        success: true,
        previous: previousPost || (currentPostIndex > 0 ? allPostsArray[currentPostIndex - 1] : null),
        next: nextPost || (currentPostIndex < allPostsArray.length - 1 ? allPostsArray[currentPostIndex + 1] : null)
      };
    }
    
    return {
      success: true,
      previous: previousPost,
      next: nextPost
    };
  } catch (error) {
    console.error('Get adjacent posts error:', error);
    return { success: false, message: 'Failed to fetch adjacent posts', previous: null, next: null };
  }
}

/**
 * Get travel blogs for BBC Travel style section
 * @param {number} limit - Number of blogs to fetch (default 9)
 * @returns {Object} Object with travel blogs array
 */
export async function getTravelBlogs(limit = 9) {
  try {
    await dbConnect();
    
    // Process any scheduled blogs that have passed their scheduled time
    await processScheduledBlogs();
    
    const blogs = await Blog.find({ 
      status: 'published', 
      isActive: true,
      category: 'Travel'
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
  } catch (error) {
    console.error('Get travel blogs error:', error);
    return { success: false, message: 'Failed to fetch travel blogs', blogs: [] };
  }
}

/**
 * Get blogs by category
 * @param {string} category - Category name to filter by
 * @param {number} limit - Number of blogs to fetch (default 6)
 * @returns {Object} Object with blogs array
 */
export async function getBlogsByCategory(category, limit = 6) {
  try {
    await dbConnect();
    
    // Process any scheduled blogs that have passed their scheduled time
    await processScheduledBlogs();
    
    const blogs = await Blog.find({ 
      status: 'published', 
      isActive: true,
      category: category
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return { success: true, blogs: JSON.parse(JSON.stringify(blogs)) };
  } catch (error) {
    console.error('Get blogs by category error:', error);
    return { success: false, message: `Failed to fetch ${category} blogs`, blogs: [] };
  }
}

/**
 * Search blogs by query
 * @param {string} query - Search query string
 * @param {number} limit - Number of blogs to fetch (default 20)
 * @returns {Object} Object with blogs array
 */
export async function searchBlogs(query, limit = 20) {
  try {
    await dbConnect();
    
    if (!query || query.trim().length === 0) {
      return { success: true, blogs: [], message: 'No search query provided' };
    }
    
    // Split query into words and create regex for each
    const searchWords = query.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (searchWords.length === 0) {
      return { success: true, blogs: [], message: 'No search query provided' };
    }
    
    // Create OR conditions for each word - partial match enabled
    const orConditions = searchWords.map(word => {
      const wordRegex = new RegExp(word, 'i'); // Case insensitive partial match
      return {
        $or: [
          { title: wordRegex },
          { content: wordRegex },
          { tags: wordRegex },
          { category: wordRegex },
          { subHeading: wordRegex }
        ]
      };
    });
    
    const blogs = await Blog.find({
      status: 'published',
      isActive: true,
      $or: orConditions.flatMap(condition => condition.$or)
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return { 
      success: true, 
      blogs: JSON.parse(JSON.stringify(blogs)),
      query: query
    };
  } catch (error) {
    console.error('Search blogs error:', error);
    return { success: false, message: 'Failed to search blogs', blogs: [] };
  }
}


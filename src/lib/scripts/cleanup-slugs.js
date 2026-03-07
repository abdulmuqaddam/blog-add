// Migration script to clean up blog slugs
// Run this once to remove timestamp suffixes from existing blog slugs

import mongoose from 'mongoose';
import Blog from '../models/Blog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/IT-Verse-Blog';

async function cleanupSlugs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all blogs
    const blogs = await Blog.find({});
    console.log(`Found ${blogs.length} blogs`);

    let updatedCount = 0;

    for (const blog of blogs) {
      // Check if slug has a timestamp suffix (13+ digits at the end after a dash)
      const slugPattern = /^(.+)-(\d{13,})$/;
      const match = blog.slug.match(slugPattern);

      if (match) {
        const cleanSlug = match[1]; // The part before the timestamp
        console.log(`Updating: "${blog.slug}" -> "${cleanSlug}"`);

        // Check if the clean slug already exists
        const existingBlog = await Blog.findOne({ slug: cleanSlug, _id: { $ne: blog._id } });
        
        if (existingBlog) {
          // If clean slug exists, add a short random suffix
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          blog.slug = `${cleanSlug}-${randomSuffix}`;
        } else {
          blog.slug = cleanSlug;
        }

        await blog.save();
        updatedCount++;
      }
    }

    console.log(`\nUpdated ${updatedCount} blog slugs`);
    console.log('Migration complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
cleanupSlugs();


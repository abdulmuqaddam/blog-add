// Migration script to clean up blog slugs
// Run this once to remove timestamp suffixes from existing blog slugs

import mongoose from 'mongoose';
import Blog from '../models/Blog.js';

// ============================================================
// CONFIGURATION: Choose either LOCAL or ATLAS MongoDB
// ============================================================

// --------------- OPTION 1: MongoDB ATLAS (Uncomment this to use Atlas) ---------------
// To use MongoDB Atlas:
// 1. Make sure your .env.local has: MONGODB_URI=your_atlas_connection_string
// 2. Format: mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
// 3. Uncomment the line below:
// const MONGODB_URI = process.env.MONGODB_URI;

// --------------- OPTION 2: LOCAL MONGODB (Default - Uncomment this to use local) ---------------
// To use local MongoDB:
// 1. Make sure MongoDB is running locally
// 2. Uncomment the line below:
// const MONGODB_URI = 'mongodb://localhost:27017/IT-Verse-Blog';

// >>>>> CURRENTLY USING: MongoDB ATLAS <<<<<
// To use Local MongoDB instead: Comment out the line below and uncomment the Local option above
const MONGODB_URI = process.env.MONGODB_URI;

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


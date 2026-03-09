// MongoDB Connection
import mongoose from 'mongoose';

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

// ============================================================
// CURRENT ACTIVE CONFIGURATION
// ============================================================

// >>>>> CURRENTLY USING: MongoDB ATLAS <<<<<
// To use Local MongoDB instead: Comment out the line below and uncomment the Local option above
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;


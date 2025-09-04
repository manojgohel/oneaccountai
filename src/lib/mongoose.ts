/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/mongoose.js
import mongoose from "mongoose";

const MONGODB_URI: any = process.env.MONGODB_URI; // Set this in your .env file

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Import models to register them with Mongoose
import "../models/Conversation";
import "../models/User";

// Define the type for our cached mongo connection
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// Extend the NodeJS global interface
declare global {
  var mongo: MongooseCache | undefined;
}

/**
 * Global variable to maintain a cache of the connection
 */
let cached: any | undefined = global.mongo;

// If the cache doesn't exist, create it
if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

/**
 * Connect to the database
 * @returns {Promise<mongoose.Connection>}
 */
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
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

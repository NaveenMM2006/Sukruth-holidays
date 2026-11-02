import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// Reuse one connection across hot reloads and serverless invocations.
const globalWithMongoose = globalThis as unknown as { _mongoose?: Cache };
const cache: Cache = globalWithMongoose._mongoose ?? { conn: null, promise: null };
globalWithMongoose._mongoose = cache;

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/muhasib";

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const g = global as unknown as { _mongoose?: Cached };
const cached: Cached = g._mongoose || (g._mongoose = { conn: null, promise: null });

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

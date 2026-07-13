import mongoose from "mongoose";

function resolveMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (uri) return uri;
  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI is not set. Add it to your production environment variables.");
  }
  return "mongodb://localhost:27017/muhasib";
}
const MONGODB_URI = resolveMongoUri();

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

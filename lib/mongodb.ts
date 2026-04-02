import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educore';

if (!MONGODB_URI) {
  throw new Error(
    'Tolong definisikan variabel MONGODB_URI di dalam file .env.local'
  );
}

/** * Global digunakan untuk menjaga koneksi tetap aktif selama hot reloading 
 * di lingkungan development agar tidak memicu memory threshold.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    // console.log("=> Menggunakan koneksi MongoDB yang sudah ada (Cached)");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Opsi tambahan untuk performa di Next.js
      maxPoolSize: 10,
    };

    console.log("=> Membuat koneksi MongoDB baru...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
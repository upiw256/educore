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
    
    // Seed default user if no users exist
    try {
      const User = mongoose.models.User || (await import('../models/User')).default;
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log("Tidak ada user ditemukan. Membuat user default (suadmin)...");
        
        const Teacher = mongoose.models.Teacher || (await import('../models/Teacher')).default;
        let dummyTeacher = await Teacher.findOne({ ptk_id: 'default-admin-ptk' });
        
        if (!dummyTeacher) {
          dummyTeacher = await Teacher.create({
            ptk_id: 'default-admin-ptk',
            nama: 'Super Admin',
          });
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('5414450', salt);
        
        await User.create({
          username: 'suadmin',
          password: hashedPassword,
          role: 'admin',
          teacherId: dummyTeacher._id,
        });
        console.log("User default (suadmin) berhasil dibuat.");
      }
    } catch (seedErr) {
      console.error("Gagal melakukan seed default user:", seedErr);
    }

  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
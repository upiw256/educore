import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher"; // Wajib di-import agar model terdaftar di Mongoose

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

export async function GET() {
  try {
    await dbConnect();

    // 1. Ambil token dari cookie (Wajib await di Next.js 15)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    // 2. Dekripsi token menggunakan Jose (sama seperti di proxy.ts)
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    // Ambil 'id' (ini adalah user._id dari database)
    const userId = payload.id as string; 

    if (!userId) {
      return NextResponse.json({ error: "ID User tidak valid dalam token" }, { status: 400 });
    }

    // 3. Cari User dan ambil detail Teacher-nya
    const userData = await User.findById(userId)
      .populate({
        path: 'teacherId',
        model: Teacher // Memastikan Mongoose merujuk ke model Teacher
      })
      .lean();

    if (!userData) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
    }

    if (!userData.teacherId) {
      return NextResponse.json({ error: "Profil Guru belum tertaut pada akun ini" }, { status: 404 });
    }

    // 4. Kirim data detail guru ke frontend profile page
    return NextResponse.json(userData.teacherId);

  } catch (error: any) {
    console.error("DEBUG PROFILE ERROR:", error.message);
    
    // Jika token expired
    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json({ error: "Sesi telah berakhir" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Gagal memuat profil", message: error.message }, 
      { status: 500 }
    );
  }
}
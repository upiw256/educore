import { NextResponse } from "next/server";
import { extractTokenFromServerContext, verifyToken } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Ekstrak token dari Bearer header (Android) ATAU cookie (Web)
    const token = await extractTokenFromServerContext(request);

    if (!token) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    // Verifikasi token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (err: any) {
      if (err.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json({ error: "Sesi telah berakhir" }, { status: 401 });
      }
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    const userId = payload.id as string;
    if (!userId) {
      return NextResponse.json({ error: "ID User tidak valid dalam token" }, { status: 400 });
    }

    // Cari User dan ambil detail Teacher-nya
    const userData = await User.findById(userId)
      .populate({ path: 'teacherId', model: Teacher })
      .lean();

    if (!userData) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
    }

    if (!userData.teacherId) {
      return NextResponse.json({ error: "Profil Guru belum tertaut pada akun ini" }, { status: 404 });
    }

    return NextResponse.json(userData.teacherId);

  } catch (error: any) {
    console.error("DEBUG PROFILE ERROR:", error.message);
    return NextResponse.json(
      { error: "Gagal memuat profil", message: error.message },
      { status: 500 }
    );
  }
}
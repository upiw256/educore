import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { oldPassword, newPassword } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: "Sesi habis" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.id as string;

    // 1. Cari user
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    // 2. Cek Password Lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Password lama salah!" }, { status: 400 });
    }

    // 3. Hash Password Baru & Simpan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "Password berhasil diperbarui" });

  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui password" }, { status: 500 });
  }
}
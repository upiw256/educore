import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    // 1. Cari user di database EduCore
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 401 });
    }

    // 2. Verifikasi Password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Password salah' }, { status: 401 });
    }

    // 3. Buat JWT Token (menggunakan helper lib/auth.ts)
    const token = await createToken({
      id: user._id.toString(),
      role: user.role,
      username: user.username,
    });

    // 4. Simpan ke Cookie agar bisa dibaca oleh proxy.ts (untuk Web / Browser)
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 hari
    });

    // 5. Kembalikan token di JSON body JUGA (untuk Android / mobile client)
    //    Android menyimpan token ini di SharedPreferences dan mengirimnya via
    //    header: Authorization: Bearer <token>
    return NextResponse.json({
      success: true,
      role: user.role,
      token,                  // ← BARU: untuk Android
      username: user.username, // ← BARU: info tambahan untuk Android
    });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
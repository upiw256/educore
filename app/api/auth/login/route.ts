import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

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

    // 3. Buat JWT Token yang kompatibel dengan Edge Runtime/Proxy
    const token = await new SignJWT({ 
      id: user._id, 
      role: user.role,
      username: user.username 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(SECRET_KEY);

    // 4. Simpan ke Cookie agar bisa dibaca oleh proxy.ts
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 hari
    });

    return NextResponse.json({ 
      success: true, 
      role: user.role // Dikirim balik untuk kebutuhan redirect di Proxy
    });

  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
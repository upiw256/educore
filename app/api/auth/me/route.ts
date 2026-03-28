import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return NextResponse.json({ role: 'guest' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return NextResponse.json({ role: payload.role });
  } catch (error) {
    return NextResponse.json({ role: 'guest' }, { status: 401 });
  }
}
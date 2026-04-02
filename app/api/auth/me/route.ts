import { NextResponse } from 'next/server';
import { extractTokenFromServerContext, verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  // Cek token dari Bearer header (Android) ATAU cookie (Web)
  const token = await extractTokenFromServerContext(request);

  if (!token) {
    return NextResponse.json({ role: 'guest', name: '-' }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    return NextResponse.json(
      { role: payload.role, name: payload.username },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ role: 'guest', name: '-' }, { status: 401 });
  }
}
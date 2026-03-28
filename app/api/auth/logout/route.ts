import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('token'); // Menghapus token agar ditolak oleh Proxy
  return NextResponse.json({ success: true });
}
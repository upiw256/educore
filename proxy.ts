import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Nama fungsi utama sekarang harus 'proxy' 
export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Bypass rute publik dan aset statis
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') || 
    pathname === '/' || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Proteksi rute SMAN 1 Margaasih
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher tetap diperlukan untuk menentukan rute yang diproteksi
export const config = {
  matcher: [
    '/admin/:path*',
    '/piket/:path*',
    '/kesiswaan/:path*',
    '/dashboard/:path*',
  ],
};
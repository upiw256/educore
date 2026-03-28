import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Biarkan rute publik lewat
  if (pathname === '/' || pathname.startsWith('/api/auth') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. Jika tidak ada token, tendang ke Login
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // 3. Dekripsi Token untuk ambil Role
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userRole = payload.role as string;

    // 4. PROTEKSI URL MANUAL (Role-Based Access Control)
    
    // Hanya Admin yang boleh masuk ke settings atau manajemen user
    if (pathname.startsWith('/admin/settings') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Hanya Admin atau Piket yang boleh masuk ke rute piket
    if (pathname.startsWith('/admin/piket') && userRole !== 'admin' && userRole !== 'piket') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Hanya Admin atau Kesiswaan yang boleh masuk ke rute kesiswaan
    if (pathname.startsWith('/admin/kesiswaan') && userRole !== 'admin' && userRole !== 'kesiswaan') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Jika semua pengecekan lewat, izinkan akses
    return NextResponse.next();

  } catch (error) {
    // Jika token error/expired, hapus cookie dan balik ke login
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'], // Jaga semua rute di bawah /admin
};
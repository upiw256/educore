import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

/**
 * Ekstrak token dari NextRequest:
 * 1. Bearer token via Authorization header (untuk Android / REST client)
 * 2. HttpOnly cookie 'token' (untuk Web / browser)
 */
function getToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return request.cookies.get('token')?.value ?? null;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rute publik: login page, auth API, dan aset statis
  if (
    pathname === '/' ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = getToken(request);

  // 2. Jika tidak ada token sama sekali
  if (!token) {
    // Jika request dari API (Android), kembalikan 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Jika dari browser, redirect ke halaman login
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // 3. Dekripsi token untuk ambil Role
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userRole = payload.role as string;

    // 4. PROTEKSI RBAC (Role-Based Access Control)
    // Hanya Admin yang boleh masuk ke settings atau manajemen user
    if (
      (pathname.startsWith('/admin/settings/users') || pathname.startsWith('/api/users')) &&
      userRole !== 'admin'
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Hanya Admin atau Piket yang boleh masuk ke rute piket
    if (
      (pathname.startsWith('/admin/piket') || pathname.startsWith('/api/piket')) &&
      userRole !== 'admin' && userRole !== 'piket'
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Hanya Admin atau Kesiswaan yang boleh masuk ke rute kesiswaan
    if (
      (pathname.startsWith('/admin/kesiswaan') || pathname.startsWith('/api/kesiswaan')) &&
      userRole !== 'admin' && userRole !== 'kesiswaan'
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Semua pengecekan lewat → izinkan akses
    return NextResponse.next();

  } catch {
    // Token expired / invalid
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token expired atau tidak valid' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'], // Lindungi semua API dan halaman admin
};
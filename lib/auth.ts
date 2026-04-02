/**
 * lib/auth.ts
 * Helper utilitas untuk mengekstrak & memverifikasi JWT token.
 * Mendukung dual-auth: Cookie (web) DAN Bearer Token (Android/mobile).
 */
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

export { SECRET_KEY };

export interface JWTPayload {
  id: string;
  role: string;
  username: string;
  [key: string]: unknown;
}

/**
 * Mengekstrak token dari Request:
 * 1. Coba dari header Authorization: Bearer <token>  → untuk Android
 * 2. Coba dari httpOnly cookie 'token'               → untuk Web (browser)
 */
export function extractTokenFromRequest(request: Request | NextRequest): string | null {
  // Prioritas 1: Authorization header (untuk Android)
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Prioritas 2: Cookie (untuk Web - dikelola oleh NextRequest di middleware)
  if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
    const token = (request as NextRequest).cookies.get('token')?.value;
    if (token) return token;
  }

  return null;
}

/**
 * Mengekstrak token dari SERVER COMPONENT / Route Handler (menggunakan `cookies()` dari next/headers)
 * Mendukung:
 * - Authorization Bearer header
 * - Cookie httpOnly 'token'
 */
export async function extractTokenFromServerContext(request: Request): Promise<string | null> {
  // Prioritas 1: Authorization header (Android)
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Prioritas 2: Cookie (Web)
  try {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Verifikasi token dan kembalikan payload.
 * Throw error jika token tidak valid / expired.
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload as unknown as JWTPayload;
}

/**
 * Buat JWT token baru dari data user.
 */
export async function createToken(data: { id: string; role: string; username: string }): Promise<string> {
  return new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(SECRET_KEY);
}

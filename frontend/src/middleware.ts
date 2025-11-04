import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to the root path
  if (pathname === '/') {
    // Check if user has authentication data (wallet_address in cookie or header)
    const cookies = request.cookies;
    const hasAuthCookie = cookies.get('connect.sid'); // Session cookie from express-session

    // If user is authenticated, redirect to dashboard
    if (hasAuthCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If not authenticated, redirect to siwe
    return NextResponse.redirect(new URL('/siwe', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};

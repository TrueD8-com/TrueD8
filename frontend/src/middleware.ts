import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    // Express session cookie name is `sessionId` (see backend session config).
    const hasAuthCookie = request.cookies.get("sessionId");

    if (hasAuthCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/siwe") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/siwe"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    // The API owns an HttpOnly cookie on its own host, so middleware running
    // on the frontend cannot reliably inspect it. Login performs the session
    // check client-side and forwards authenticated users to the dashboard.
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

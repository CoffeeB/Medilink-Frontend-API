// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Explicit public routes
const publicPaths = ["/", "/doctor/login", "/marketer/login", "/marketer/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow exact matches only for public routes
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow Next.js internals, images, favicon, and open API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname === "/favicon.ico" || pathname.startsWith("/api/public")) {
    return NextResponse.next();
  }

  // Check auth token from cookies
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Force redirect unauthenticated users
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/public).*)"],
};

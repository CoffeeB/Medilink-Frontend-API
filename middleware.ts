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

  // Check token from cookies
  const token = req.cookies.get("token")?.value;
  const userCookie = req.cookies.get("user")?.value;

  if (!token || !userCookie) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  let user: any;
  try {
    user = JSON.parse(userCookie);
  } catch (e) {
    console.error("Invalid user cookie", e);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Only allow doctors or marketers
  if (user?.role !== "doctor" && user?.role !== "marketer") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/public).*)"],
};

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

  // Restrict doctors from accessing marketer pages
  if (user.role === "doctor" && pathname.startsWith("/marketer")) {
    return NextResponse.redirect(new URL("/doctor/client", req.url));
  }

  // Restrict marketers from accessing doctor pages
  if (user.role === "marketer" && pathname.startsWith("/doctor")) {
    return NextResponse.redirect(new URL("/marketer/client", req.url));
  }

  // If doctor but not yet accepted → force pending-approval page
  // if (user.role === "doctor" && user.status !== "accepted") {
  //   if (pathname !== "/pending-approval") {
  //     return NextResponse.redirect(new URL("/pending-approval", req.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/public).*)"],
};

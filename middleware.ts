import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes require authentication
const protectedRoutes = ["/dashboard", "/messages", "/appointments", "/client", "/profile", "/register-a-doc"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const user = req.cookies.get("user")?.value;

  // If the request path is protected but no token/user found → redirect to login
  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token || !user) {
      const loginUrl = new URL("/", req.url);
      loginUrl.searchParams.set("from", req.nextUrl.pathname); // so you can redirect back after login
      return NextResponse.redirect(loginUrl);
    }
  }

  // Otherwise, continue as normal
  return NextResponse.next();
}

// Configure paths the middleware applies to
export const config = {
  matcher: ["/dashboard/:path*", "/messages/:path*", "/appointments/:path*", "/client/:path*"],
};

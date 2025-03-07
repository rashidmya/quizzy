// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Check if the requested path starts with "/dashboard"
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    // Attempt to retrieve the token. Ensure you have NEXTAUTH_SECRET set in your env.
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      // If no token, redirect to the login page.
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

// Specify the matcher for routes to protect
export const config = {
  matcher: ["/dashboard/:path*"],
};

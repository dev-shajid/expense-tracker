import { NextRequest, NextResponse } from "next/server";
import { authRoutes, DEFAULT_AUTH_REDIRECT, DEFAULT_UNAUTH_REDIRECT } from "./routes";

/**
 * Authentication middleware for Next.js 15+
 * Handles route protection and redirects based on authentication status
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  const isAuthRoute = authRoutes.includes(pathname);

  const isAuthenticated = !!session;

  if (isAuthRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(DEFAULT_AUTH_REDIRECT, request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const url = new URL(DEFAULT_UNAUTH_REDIRECT, request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
import { NextRequest, NextResponse } from "next/server";
import {
  authRoutes,
  DEFAULT_AUTH_REDIRECT,
  DEFAULT_UNAUTH_REDIRECT,
} from "./routes";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔥 1) Skip Next.js prefetch / RSC / internal requests
  const isPrefetch =
    request.headers.get("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-middleware-prefetch") ||
    request.headers.get("RSC");

  if (isPrefetch) return NextResponse.next();

  // 🔥 2) Skip static files & PWA assets
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/workbox") ||
    pathname.includes(".");

  if (isStatic) return NextResponse.next();

  const session = request.cookies.get("session")?.value;
  const isAuthenticated = !!session;

  // 🔥 3) Auth pages (login etc.)
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(DEFAULT_AUTH_REDIRECT, request.url)
      );
    }
    return NextResponse.next();
  }

  // 🔒 4) Protect everything else
  if (!isAuthenticated) {
    const url = new URL(DEFAULT_UNAUTH_REDIRECT, request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/(?!auth)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
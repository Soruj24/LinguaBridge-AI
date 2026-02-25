import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const locales = ["en", "bn", "es", "fr", "ar", "zh", "hi"];
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
});

type SessionUser = {
  preferredLanguage?: string;
  role?: "user" | "admin";
};

type AuthedRequest = NextRequest & {
  auth?: { user?: SessionUser };
};

export default auth(async function middleware(request: AuthedRequest) {
  // Step 1: Run next-intl middleware first to handle basic locale routing
  const response = intlMiddleware(request);

  // Step 2: Auth check
  const session = request.auth;
  const isLoggedIn = !!session?.user;
  const userLocale = session?.user?.preferredLanguage;

  const { pathname } = request.nextUrl;

  // Check if current path starts with a supported locale
  const pathSegments = pathname.split("/");
  const firstSegment = pathSegments[1];
  const isLocaleInPath = locales.includes(firstSegment);

  // Language Enforcement Logic: Redirect to user's preferred language if logged in
  if (isLoggedIn && userLocale && isLocaleInPath) {
    if (firstSegment !== userLocale) {
      // Replace the locale segment with the user's preferred locale
      const newPathname = pathname.replace(
        `/${firstSegment}`,
        `/${userLocale}`,
      );
      const newUrl = new URL(newPathname, request.url);
      // Preserve search params
      newUrl.search = request.nextUrl.search;
      return NextResponse.redirect(newUrl);
    }
  }

  // Auth Guards
  // We normalize the path to check for protected routes regardless of locale
  const pathWithoutLocale = isLocaleInPath
    ? "/" + pathSegments.slice(2).join("/")
    : pathname;

  // Handle root path normalization (e.g. /en -> /)
  const normalizedPath = pathWithoutLocale === "" ? "/" : pathWithoutLocale;

  const isProtectedRoute =
    normalizedPath.startsWith("/dashboard") ||
    normalizedPath.startsWith("/chat") ||
    normalizedPath.startsWith("/admin");

  const isAuthPage =
    normalizedPath === "/login" || normalizedPath === "/register";

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const locale = isLocaleInPath ? firstSegment : "en";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin-only guard
  if (normalizedPath.startsWith("/admin")) {
    const isAdmin = session?.user?.role === "admin";
    if (!isAdmin) {
      const locale = userLocale || (isLocaleInPath ? firstSegment : "en");
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  if (isAuthPage && isLoggedIn) {
    const locale = userLocale || (isLocaleInPath ? firstSegment : "en");
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

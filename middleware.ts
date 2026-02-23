import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'bn', 'es', 'fr', 'ar', 'zh', 'hi'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});

export default auth(async function middleware(request: any) {
  // Step 1: Run next-intl middleware (handles locale detection and redirection)
  const response = intlMiddleware(request);

  // Step 2: Run auth middleware
  // We need to extract the locale from the pathname to pass to auth logic if needed,
  // or just run auth check.
  
  const session = request.auth;
  const isLoggedIn = !!session?.user;
  
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected (dashboard, chat)
  // We need to account for the locale prefix: /en/dashboard, /bn/chat, etc.
  const isProtectedRoute = 
    pathname.match(/^\/(en|bn|es|fr|ar|zh|hi)\/(dashboard|chat)/) || 
    pathname.match(/^\/(dashboard|chat)/); // Fallback for no locale if configured (but we are using prefixes)

  const isAuthPage = 
    pathname.match(/^\/(en|bn|es|fr|ar|zh|hi)\/(login|register)/) ||
    pathname.match(/^\/(login|register)/);

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      // Redirect to login (preserving locale)
      const locale = pathname.split('/')[1] || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return Response.redirect(loginUrl);
    }
  }

  if (isAuthPage && isLoggedIn) {
      // Redirect to dashboard (preserving locale)
      const locale = pathname.split('/')[1] || 'en';
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return Response.redirect(dashboardUrl);
  }

  return response;
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(bn|en|es|fr|ar|zh|hi)/:path*']
};
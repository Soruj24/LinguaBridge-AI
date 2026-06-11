import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }: {
      auth?: { user?: unknown } | null;
      request: { nextUrl: URL };
    }) {
      const isLoggedIn = !!(auth && (auth as { user?: unknown }).user);
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnChat = nextUrl.pathname.startsWith("/chat");
      
      if (isOnDashboard || isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Redirect logged-in users away from auth pages
        const path = nextUrl.pathname;
        const isLoginOrRegister = path.endsWith("/login") || path.endsWith("/register");
        if (isLoginOrRegister) {
            // Extract locale from path (e.g. /en/login -> en)
            const segments = path.split("/");
            const locale = segments.length > 2 ? segments[1] : "en";
            return Response.redirect(new URL(`/${locale}/dashboard`, nextUrl.origin));
        }
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
};

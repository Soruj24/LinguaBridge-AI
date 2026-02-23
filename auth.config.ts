export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnChat = nextUrl.pathname.startsWith("/chat");
      
      if (isOnDashboard || isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Redirect logged-in users away from auth pages
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register") {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} as any;


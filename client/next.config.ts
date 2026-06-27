import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Trim NEXTAUTH_URL to remove invisible characters that may cause "Invalid URL" errors
if (process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.trim();
}
if (process.env.AUTH_URL) {
  process.env.AUTH_URL = process.env.AUTH_URL.trim();
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/friends/sync-user",
          destination: "http://localhost:4000/api/friends/sync-user",
        },
        {
          source: "/api/friends/auth-sync",
          destination: "http://localhost:4000/api/friends/auth-sync",
        },
        {
          source: "/api/friends/refresh-token",
          destination: "http://localhost:4000/api/friends/refresh-token",
        },
      ],
      afterFiles: [],
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://localhost:4000/api/:path*",
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);

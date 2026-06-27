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
    return [
      {
        source: "/api/friends/sync-user",
        destination: "http://localhost:5000/api/friends/sync-user",
      },
      {
        source: "/api/friends/auth-sync",
        destination: "http://localhost:5000/api/friends/auth-sync",
      },
      {
        source: "/api/friends/refresh-token",
        destination: "http://localhost:5000/api/friends/refresh-token",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);

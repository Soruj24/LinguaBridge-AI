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
  /* config options here */
};

export default withNextIntl(nextConfig);

export const env = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
  TENOR_API_KEY: process.env.NEXT_PUBLIC_TENOR_API_KEY || "",
} as const;

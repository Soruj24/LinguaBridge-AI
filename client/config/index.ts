export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.SERVER_URL || "http://localhost:4000",
  socketURL: process.env.NEXT_PUBLIC_SOCKET_URL || `http://localhost:${process.env.NEXT_PUBLIC_SOCKET_PORT || "4000"}`,
};

export const appConfig = {
  name: "LinguaBridge AI",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  port: parseInt(process.env.PORT || "3000", 10),
  socketPort: parseInt(process.env.SOCKET_PORT || "3001", 10),
};

export const emailConfig = {
  mock: process.env.EMAIL_MOCK === "true",
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  user: process.env.EMAIL_SERVER_USER || "",
  password: process.env.EMAIL_SERVER_PASSWORD || "",
  from: process.env.EMAIL_FROM || '"LinguaBridge AI" <noreply@linguabridge.ai>',
};

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "",
};

export const featureFlags = {
  tenorApiKey: process.env.TENOR_API_KEY || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
};

"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  // Logic handled by RootLayout based on locale
  return <>{children}</>;
}

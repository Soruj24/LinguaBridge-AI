"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SocketProvider } from "./socket-provider";
import { DirectionProvider } from "./direction-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DirectionProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SocketProvider>{children}</SocketProvider>
        </NextThemesProvider>
      </DirectionProvider>
    </SessionProvider>
  );
}

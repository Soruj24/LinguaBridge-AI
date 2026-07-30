"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SocketProvider } from "./socket-provider";
import { DirectionProvider } from "./direction-provider";
import { CallProvider } from "./call-provider";
import { ServerUserProvider } from "./server-user-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ServerUserProvider>
        <DirectionProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SocketProvider>
              <CallProvider>{children}</CallProvider>
            </SocketProvider>
          </NextThemesProvider>
        </DirectionProvider>
      </ServerUserProvider>
    </SessionProvider>
  );
}

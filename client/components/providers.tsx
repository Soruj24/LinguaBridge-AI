"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SocketProvider } from "./providers/socket-provider";
import { DirectionProvider } from "./providers/direction-provider";
import { CallProvider } from "./providers/call-provider";
import { ServerUserProvider } from "@/contexts/server-user-context";

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

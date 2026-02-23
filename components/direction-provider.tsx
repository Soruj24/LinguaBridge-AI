"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.preferredLanguage) {
      const lang = session.user.preferredLanguage;
      const isRtl = RTL_LANGUAGES.includes(lang);
      
      document.documentElement.lang = lang;
      document.documentElement.dir = isRtl ? "rtl" : "ltr";
    }
  }, [session?.user?.preferredLanguage]);

  return <>{children}</>;
}

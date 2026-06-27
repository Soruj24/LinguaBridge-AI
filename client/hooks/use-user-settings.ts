"use client";

import { useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

export function useUserSettings() {
  const updateLanguage = useCallback(async (preferredLanguage: string) => {
    try {
      await axios.put("/api/user/update", { preferredLanguage });
      toast.success("Language changed");
      return true;
    } catch {
      toast.error("Failed to change language");
      return false;
    }
  }, []);

  const updateTheme = useCallback(async (theme: string) => {
    try {
      await axios.put("/api/user/update", { theme });
      toast.success("Theme updated");
      return true;
    } catch {
      toast.error("Failed to update theme");
      return false;
    }
  }, []);

  return {
    updateLanguage,
    updateTheme,
  };
}

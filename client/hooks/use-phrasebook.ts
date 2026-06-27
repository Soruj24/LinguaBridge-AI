"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import type { PhrasebookEntry } from "@/types/phrasebook";

export function usePhrasebook() {
  const [entries, setEntries] = useState<PhrasebookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");

  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (language) params.set("language", language);
      const res = await api.get(`/api/phrasebook?${params.toString()}`);
      setEntries(res.data.entries);
    } catch {
      toast.error("Failed to load phrasebook");
    } finally {
      setIsLoading(false);
    }
  }, [search, language]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const saveEntry = useCallback(async (data: {
    originalText: string;
    translatedText: string;
    languageFrom: string;
    languageTo: string;
    sourceMessageId?: string;
    sourceChatId?: string;
  }) => {
    try {
      await api.post("/api/phrasebook", data);
      toast.success("Saved to phrasebook");
      fetchEntries();
    } catch {
      toast.error("Failed to save to phrasebook");
    }
  }, [fetchEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/phrasebook/${id}`);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      toast.success("Removed from phrasebook");
    } catch {
      toast.error("Failed to delete entry");
    }
  }, []);

  const updateEntry = useCallback(async (id: string, data: { notes?: string; tags?: string[] }) => {
    try {
      await api.patch(`/api/phrasebook/${id}`, data);
      fetchEntries();
      toast.success("Entry updated");
    } catch {
      toast.error("Failed to update entry");
    }
  }, [fetchEntries]);

  return {
    entries,
    isLoading,
    search,
    setSearch,
    language,
    setLanguage,
    saveEntry,
    deleteEntry,
    updateEntry,
    fetchEntries,
  };
}

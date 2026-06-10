"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import type { Folder } from "@/types/folders";

export function useFolders() {
  const { data: session } = useSession();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      setIsLoading(true);
      const res = await axios.get("/api/folders");
      setFolders(res.data.folders ?? []);
    } catch {
      console.error("Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = useCallback(async (name: string, color?: string) => {
    try {
      const res = await axios.post("/api/folders", { name, color });
      const folder = res.data.folder;
      setFolders((prev) => [...prev, folder]);
      toast.success(`Folder "${name}" created`);
      return folder;
    } catch {
      toast.error("Failed to create folder");
      return null;
    }
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      await axios.delete(`/api/folders/${folderId}`);
      setFolders((prev) => prev.filter((f) => f._id !== folderId));
      toast.success("Folder deleted");
    } catch {
      toast.error("Failed to delete folder");
    }
  }, []);

  const updateFolder = useCallback(async (folderId: string, data: { name?: string; color?: string }) => {
    try {
      const res = await axios.patch(`/api/folders/${folderId}`, data);
      const updated = res.data.folder;
      setFolders((prev) => prev.map((f) => (f._id === folderId ? updated : f)));
      return updated;
    } catch {
      toast.error("Failed to update folder");
      return null;
    }
  }, []);

  const assignChatToFolder = useCallback(async (chatId: string, folderId: string | null) => {
    try {
      if (folderId) {
        await axios.post(`/api/folders/${folderId}/chats`, { chatId });
      } else {
        const currentFolder = folders.find((f) => f.chatIds.includes(chatId));
        if (currentFolder) {
          await axios.delete(`/api/folders/${currentFolder._id}/chats`, { data: { chatId } });
        }
      }
      await fetchFolders();
    } catch {
      toast.error("Failed to assign folder");
    }
  }, [fetchFolders, folders]);

  const getFolderForChat = useCallback((chatId: string): Folder | undefined => {
    return folders.find((f) => f.chatIds.includes(chatId));
  }, [folders]);

  return {
    folders,
    isLoading,
    fetchFolders,
    createFolder,
    deleteFolder,
    updateFolder,
    assignChatToFolder,
    getFolderForChat,
  };
}

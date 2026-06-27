"use client";

import { useState, useRef, useCallback } from "react";
import api from "@/lib/api";

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const stopTTS = useCallback(() => {
    cleanup();
    setIsPlaying(false);
  }, [cleanup]);

  const playTTS = useCallback(async (text: string, language?: string) => {
    try {
      setIsLoading(true);
      cleanup();

      const res = await api.post(
        "/api/chat/tts",
        { text, language },
        { responseType: "blob" },
      );

      const url = URL.createObjectURL(res.data);
      urlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("TTS playback error", error);
    } finally {
      setIsLoading(false);
    }
  }, [cleanup]);

  return { playTTS, stopTTS, isPlaying, isLoading };
}

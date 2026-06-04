"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export function useTTS() {
  const [isReading, setIsReading] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleTTS = async (text: string) => {
    if (isReading) {
      ttsAudioRef.current?.pause();
      setIsReading(false);
      return;
    }

    try {
      setIsLoadingTTS(true);
      const res = await axios.post(
        "/api/chat/tts",
        { text },
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(res.data);

      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
      }
      ttsAudioRef.current = new Audio(url);

      ttsAudioRef.current.onended = () => setIsReading(false);
      ttsAudioRef.current.play();
      setIsReading(true);
    } catch (error) {
      console.error("TTS error", error);
    } finally {
      setIsLoadingTTS(false);
    }
  };

  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) ttsAudioRef.current.pause();
    };
  }, []);

  return { isReading, isLoadingTTS, handleTTS };
}

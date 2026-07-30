"use client";

import { useState, useRef } from "react";

export function useVoiceRecorder(onSend: (blob: Blob) => Promise<void> | void) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const autoStopRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_SECONDS = 120;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.start();
      setIsRecording(true);
      setDuration(0);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
      autoStopRef.current = setTimeout(() => {
        stopRecording(true);
      }, MAX_SECONDS * 1000);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = (shouldSend: boolean) => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      const recorder = mediaRecorderRef.current;
      const stream = recorder.stream;
      recorder.onstop = async () => {
        if (shouldSend) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          if (audioBlob.size > 0 && duration > 0) {
            try {
              setIsSending(true);
              const result = onSend(audioBlob);
              if (
                result &&
                typeof (result as Promise<void>).then === "function"
              ) {
                await result;
              }
            } finally {
              setIsSending(false);
            }
          }
        }
      };
      recorder.stop();
      stream.getTracks().forEach((track) => track.stop());
    }

    if (timerRef.current) clearInterval(timerRef.current);
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    setIsRecording(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isRecording,
    duration,
    isSending,
    startRecording,
    stopRecording,
    formatDuration,
  };
}

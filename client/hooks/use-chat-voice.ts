"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Message, Chat } from "@/types/chat";
import { sendVoiceMessageApi } from "@/lib/repositories/chat.repository";

interface UseChatVoiceParams {
  getReceiverId: () => string | undefined;
  chatId: string;
  socket: ReturnType<typeof import("@/components/socket-provider").useSocket>;
  onMessageSent: (message: Message) => void;
  scrollToBottom: () => void;
}

export function useChatVoice({ getReceiverId, chatId, socket, onMessageSent, scrollToBottom }: UseChatVoiceParams) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const sendVoiceMessage = useCallback(async (audioBlob: Blob) => {
    const receiverId = getReceiverId();
    if (!receiverId) return;

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice.webm");
      formData.append("chatId", chatId);
      formData.append("receiverId", receiverId);

      const data = await sendVoiceMessageApi(formData);
      socket?.emit("send_message", data);
      onMessageSent(data);
      scrollToBottom();
    } catch {
      // toast.error("Failed to send voice message");
    }
  }, [getReceiverId, chatId, socket, onMessageSent, scrollToBottom]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        sendVoiceMessage(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      // toast.error("Microphone access denied");
    }
  }, [sendVoiceMessage]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    mediaRecorderRef,
    startRecording,
    stopRecording,
  };
}

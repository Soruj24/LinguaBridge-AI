"use client";

import { useVoiceRecorder } from "./voice-recorder/use-voice-recorder";
import { VoiceRecorderUI } from "./voice-recorder/voice-recorder-ui";

interface VoiceRecorderProps {
  onSend: (blob: Blob) => Promise<void> | void;
  maxDurationSeconds?: number;
}

export function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const {
    isRecording,
    duration,
    isSending,
    startRecording,
    stopRecording,
    formatDuration,
  } = useVoiceRecorder(onSend);

  return (
    <VoiceRecorderUI
      isRecording={isRecording}
      isSending={isSending}
      duration={duration}
      formatDuration={formatDuration}
      onStart={startRecording}
      onStop={stopRecording}
    />
  );
}

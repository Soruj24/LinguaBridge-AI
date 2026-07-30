"use client";

import { ArrowLeft, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface VoiceRecorderUIProps {
  isRecording: boolean;
  isSending: boolean;
  duration: number;
  formatDuration: (seconds: number) => string;
  onStart: () => void;
  onStop: (shouldSend: boolean) => void;
}

export function VoiceRecorderUI({
  isRecording,
  isSending,
  duration,
  formatDuration,
  onStart,
  onStop,
}: VoiceRecorderUIProps) {
  return (
    <div className="relative flex items-center justify-end min-w-[50px]">
      {isRecording && (
        <div className="absolute right-0 flex items-center bg-background/80 border shadow-lg rounded-full pr-14 pl-4 py-1 h-12 w-[300px] z-10 overflow-hidden">
          <div className="flex items-center gap-2 text-red-500 mr-4 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono font-medium">
              {formatDuration(duration)}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Cancel
          </div>
        </div>
      )}

      <div className="z-20 touch-none cursor-pointer">
        <Button
          size="icon"
          className={cn(
            "rounded-full h-14 w-14 transition-all duration-200 shadow-xl border-0",
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground",
          )}
          onClick={() => {
            if (isRecording) {
              onStop(true);
            } else {
              if (!isSending) onStart();
            }
          }}
          disabled={isSending}
          aria-label={isRecording ? "Stop & send voice" : "Start recording"}
        >
          <Mic
            className={cn(
              "h-6 w-6 transition-transform",
              isRecording
                ? "scale-110 text-white"
                : "text-primary-foreground",
            )}
          />
        </Button>
        {isSending && (
          <div className="absolute -right-2 -top-2 text-[10px] px-2 py-1 rounded-full bg-background border shadow-sm">
            Sending...
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Mic, MicOff, Volume2, VolumeX, PhoneOff } from "lucide-react";

interface ActiveCallUIProps {
  userName: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  duration: number;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ActiveCallUI({
  userName,
  isMuted,
  isSpeakerOn,
  duration,
  onEnd,
  onToggleMute,
  onToggleSpeaker,
}: ActiveCallUIProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-background border-t shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatDuration(duration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
              isMuted
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={onToggleSpeaker}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerOn
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
            title={isSpeakerOn ? "Speakerphone" : "Headphones"}
          >
            {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button
            onClick={onEnd}
            className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            title="End call"
          >
            <PhoneOff className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

"use client";

import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "./use-audio-player";

interface AudioPlayerProps {
  src: string;
  variant?: "sender" | "receiver";
}

const bars = [20, 40, 60, 30, 50, 70, 40, 60, 80, 50, 30, 60, 40, 70, 50, 30, 40, 60, 20, 40];

export function AudioPlayer({ src, variant = "receiver" }: AudioPlayerProps) {
  const { audioRef, isPlaying, currentTime, duration, isLoading, randomHeights, togglePlay, handleSeek, formatTime } = useAudioPlayer(src);

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl min-w-[240px] select-none shadow-sm",
      variant === "sender" ? "bg-white/5" : "bg-muted/30"
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-10 w-10 rounded-xl shrink-0 transition-transform active:scale-95 shadow-md",
          variant === "sender" ? "bg-white/20 text-white hover:bg-white/30" : "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        )}
        onClick={togglePlay}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 flex flex-col justify-center gap-2 overflow-hidden">
        <div className="h-8 flex items-center justify-between gap-0.5 opacity-80 w-full overflow-hidden px-1">
          {bars.map((height, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all duration-100 ease-in-out",
                variant === "sender" ? "bg-white/80" : "bg-primary/80",
              )}
              style={{
                height: `${isPlaying ? (randomHeights[i] || height) : height}%`,
                opacity: isPlaying ? 1 : 0.6,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium opacity-90 w-full">
          <span className={cn(variant === "sender" ? "text-white" : "text-foreground")}>{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1 h-1.5 rounded-full"
          />
          <span className={cn(variant === "sender" ? "text-white/70" : "text-muted-foreground")}>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

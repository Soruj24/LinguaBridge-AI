"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  variant?: "sender" | "receiver";
}

const bars = [20, 40, 60, 30, 50, 70, 40, 60, 80, 50, 30, 60, 40, 70, 50, 30, 40, 60, 20, 40];

export function AudioPlayer({ src, variant = "receiver" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [randomHeights, setRandomHeights] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setRandomHeights(Array.from({ length: 20 }, () => Math.max(20, Math.random() * 100)));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    }

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    // Some browsers need explicit load to get duration if preload is metadata
    // But metadata is usually enough.
    
    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl min-w-[240px] select-none",
      variant === "sender" ? "bg-white/10" : "bg-black/5"
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
            "h-10 w-10 rounded-full shrink-0 transition-transform active:scale-95", 
            variant === "sender" ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
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
        {/* Waveform Visualization */}
        <div className="h-8 flex items-center justify-between gap-0.5 opacity-80 w-full overflow-hidden px-1">
            {bars.map((height, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "w-1.5 rounded-full transition-all duration-100 ease-in-out",
                        variant === "sender" ? "bg-white" : "bg-primary",
                    )}
                    style={{
                        height: `${isPlaying ? (randomHeights[i] || height) : height}%`,
                        opacity: isPlaying ? 1 : 0.6
                    }}
                />
            ))}
        </div>
        
        {/* Progress Bar & Time */}
        <div className="flex items-center gap-2 text-[10px] font-medium opacity-90 w-full">
            <span className={cn(variant === "sender" ? "text-white" : "text-foreground")}>{formatTime(currentTime)}</span>
            <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1 h-1.5"
            />
            <span className={cn(variant === "sender" ? "text-white/70" : "text-muted-foreground")}>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

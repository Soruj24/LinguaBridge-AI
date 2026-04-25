"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface VoiceWaveformProps {
  isRecording?: boolean;
  isPlaying?: boolean;
  audioLevel?: number;
  className?: string;
}

function getInitialBars(): number[] {
  return Array(20).fill(0.2);
}

export function VoiceWaveform({
  isRecording = false,
  isPlaying = false,
  audioLevel = 0,
  className,
}: VoiceWaveformProps) {
  const [bars, setBars] = useState<number[]>(getInitialBars);
  const animationRef = useRef<number | undefined>(undefined);
  const prevRecordingRef = useRef(isRecording);
  const prevPlayingRef = useRef(isPlaying);

  const resetBars = useCallback(() => {
    setBars(getInitialBars());
  }, []);

  useEffect(() => {
    const hasChanged = prevRecordingRef.current !== isRecording || prevPlayingRef.current !== isPlaying;
    prevRecordingRef.current = isRecording;
    prevPlayingRef.current = isPlaying;

    if (!isRecording && !isPlaying) {
      if (hasChanged) {
        requestAnimationFrame(resetBars);
      }
      return;
    }

    const animate = () => {
      setBars((prev) =>
        prev.map(() => {
          if (isRecording) {
            return Math.random() * 0.8 + 0.2;
          }
          return Math.max(0.2, audioLevel * (Math.random() * 0.5 + 0.5));
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, isPlaying, audioLevel, resetBars]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-[2px] h-8",
        className
      )}
    >
      {bars.map((height, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0.2 }}
          animate={{ scaleY: height }}
          transition={{
            duration: 0.15,
            repeat: isRecording || isPlaying ? Infinity : 0,
            repeatType: "reverse",
          }}
          className={cn(
            "w-1 rounded-full",
            isRecording
              ? "bg-rose-500"
              : isPlaying
                ? "bg-primary"
                : "bg-muted"
          )}
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}

interface RecordingPulseProps {
  isRecording: boolean;
  className?: string;
}

export function RecordingPulse({ isRecording, className }: RecordingPulseProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className
      )}
    >
      {isRecording && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full bg-rose-500/30"
          />
          <motion.div
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="absolute inset-0 rounded-full bg-rose-500/20"
          />
        </>
      )}
      <div className="w-3 h-3 rounded-full bg-rose-500" />
    </div>
  );
}
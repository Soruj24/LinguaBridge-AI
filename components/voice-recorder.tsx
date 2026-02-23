"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSend: (blob: Blob) => void;
}

export function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
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
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = (shouldSend: boolean) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        
        mediaRecorderRef.current.onstop = () => {
            if (shouldSend) {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                // Only send if duration > 0.5s to avoid accidental clicks
                if (audioBlob.size > 0 && duration > 0) {
                    onSend(audioBlob);
                }
            }
        };
    }
    
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  return (
    <div className="relative flex items-center justify-end min-w-[50px]">
        <AnimatePresence>
            {isRecording && (
                <motion.div
                    initial={{ opacity: 0, x: 20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: "auto" }}
                    exit={{ opacity: 0, x: 20, width: 0 }}
                    className="absolute right-0 flex items-center bg-background/80 backdrop-blur-md border shadow-lg rounded-full pr-14 pl-4 py-1 h-12 w-[300px] z-10 overflow-hidden"
                >
                    <div className="flex items-center gap-2 text-red-500 mr-4 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-mono font-medium">{formatDuration(duration)}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-wider animate-pulse whitespace-nowrap">
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Slide to cancel
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div
            drag="x"
            dragConstraints={{ left: -150, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(e, info) => {
                if (isRecording) {
                    if (info.offset.x < -80) {
                        stopRecording(false); // Cancelled
                    } else {
                        stopRecording(true); // Sent
                    }
                }
            }}
            onPointerDown={(e) => {
                startRecording();
            }}
            className="z-20 touch-none cursor-pointer"
            whileTap={{ scale: 1.1 }}
        >
            <Button
                size="icon"
                className={cn(
                    "rounded-full h-16 w-16 transition-all duration-200 shadow-lg border-0",
                    isRecording 
                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white" 
                        : "bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
                )}
            >
                <Mic className={cn("h-7 w-7 transition-transform", isRecording ? "scale-110 text-white" : "text-slate-900")} />
            </Button>
        </motion.div>
    </div>
  );
}

function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

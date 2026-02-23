"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AudioPlayer } from "@/components/audio-player";

interface MessageBubbleProps {
  message: {
    _id: string;
    originalText: string;
    translatedText?: string;
    voiceUrl?: string;
    translatedVoiceUrl?: string;
    createdAt: string;
    senderId: {
      name: string;
      avatar?: string;
    };
  };
  isMe: boolean;
  onDelete?: (id: string) => void;
}

export function MessageBubble({ message, isMe, onDelete }: MessageBubbleProps) {
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
      const res = await axios.post("/api/chat/tts", { text }, { responseType: 'blob' });
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

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (ttsAudioRef.current) ttsAudioRef.current.pause();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className={cn("flex w-full mt-2 space-x-3 max-w-md group", isMe ? "ml-auto justify-end" : "")}
    >
      {!isMe && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.senderId.avatar} />
          <AvatarFallback>{message.senderId.name[0]}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "flex flex-col p-3 rounded-2xl shadow-sm max-w-[85%]", 
        isMe ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-none shadow-md" : "bg-card dark:bg-zinc-800/80 border rounded-bl-none shadow-sm backdrop-blur-sm"
      )}>
        {/* Voice Message Players */}
        {(message.voiceUrl || message.translatedVoiceUrl) && (
            <div className="space-y-3 mb-2">
                {message.voiceUrl && (
                    <div className="space-y-1">
                        {message.translatedVoiceUrl && <div className="text-[10px] opacity-70 ml-1 font-medium">Original</div>}
                        <AudioPlayer src={message.voiceUrl} variant={isMe ? "sender" : "receiver"} />
                    </div>
                )}
                {message.translatedVoiceUrl && (
                    <div className="space-y-1">
                        <div className="text-[10px] opacity-70 ml-1 font-medium">Translated</div>
                        <AudioPlayer src={message.translatedVoiceUrl} variant={isMe ? "sender" : "receiver"} />
                    </div>
                )}
            </div>
        )}

        {/* Text Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {isMe ? message.originalText : (message.translatedText || message.originalText)}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-end mt-1 gap-2">
             {message.isOptimistic && (
               <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
             )}
             {!message.voiceUrl && !message.translatedVoiceUrl && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-70 hover:opacity-100"
                    onClick={() => handleTTS(isMe ? message.originalText : (message.translatedText || message.originalText))}
                    disabled={isLoadingTTS}
                    title="Read Aloud"
                >
                    {isLoadingTTS ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Volume2 className={cn("h-3 w-3", isReading && "text-primary animate-pulse")} />
                    )}
                </Button>
             )}
             {isMe && onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(message._id)}
                    title="Delete Message"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
             )}
             <span className="text-[10px] text-muted-foreground/80 font-medium">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
        </div>
      </div>

      {isMe && (
         <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={message.senderId.avatar} />
            <AvatarFallback>{message.senderId.name[0]}</AvatarFallback>
         </Avatar>
      )}
    </motion.div>
  );
}

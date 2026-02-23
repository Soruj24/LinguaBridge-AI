"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {  Volume2, Loader2, Trash2, SmilePlus, Languages, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioPlayer } from "@/components/audio-player";
import { usePreferences } from "@/hooks/use-preferences";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Reaction {
  emoji: string;
  userId: string;
}

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
    reactions?: Reaction[];
    languageFrom?: string;
    languageTo?: string;
    phoneticText?: string;
  };
  isMe: boolean;
  onDelete?: (id: string) => void;
  currentUserId?: string;
  isSameSender?: boolean;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export function MessageBubble({ message, isMe, onDelete, currentUserId, isSameSender }: MessageBubbleProps) {
  const t = useTranslations('Chat');
  const [isReading, setIsReading] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [showPhonetic, setShowPhonetic] = useState(false);
  const [localReactions, setLocalReactions] = useState<Reaction[]>(message.reactions || []);
  const [viewMode, setViewMode] = useState<"original" | "translated" | "both">(
    isMe ? "original" : message.translatedText ? "translated" : "original"
  );
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const { reduceMotion, lowBandwidth } = usePreferences();
  const { data: session } = useSession();

  useEffect(() => {
    if (message.reactions) {
      setLocalReactions(message.reactions);
    }
  }, [message.reactions]);

  // Update default view mode if translated text becomes available later (optimistic)
  useEffect(() => {
    if (!isMe && message.translatedText && viewMode === "original" && !message.originalText) {
        setViewMode("translated");
    }
  }, [message.translatedText, isMe]);

  const handleReaction = async (emoji: string) => {
    if (!currentUserId) return;

    // Optimistic update
    const existingIndex = localReactions.findIndex(
      (r) => r.emoji === emoji && r.userId === currentUserId
    );

    let newReactions = [...localReactions];
    if (existingIndex > -1) {
      newReactions.splice(existingIndex, 1);
    } else {
      newReactions.push({ emoji, userId: currentUserId });
    }
    setLocalReactions(newReactions);

    try {
      await axios.post(`/api/chat/message/${message._id}/react`, { emoji });
    } catch (error) {
      console.error("Failed to react", error);
      // Revert on error
      setLocalReactions(message.reactions || []);
    }
  };

  const groupedReactions = localReactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleTTS = async (text: string) => {
    if (isReading) {
      ttsAudioRef.current?.pause();
      setIsReading(false);
      return;
    }

    try {
      setIsLoadingTTS(true);
      const res = await axios.post(
        "/api/chat/tts",
        { text },
        { responseType: "blob" },
      );
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
      initial={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 20 }}
      className={cn(
        "flex w-full space-x-2 max-w-full group items-end",
        isSameSender ? "mt-0.5" : "mt-4",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {!isMe && !lowBandwidth && (
        <div className="w-8 shrink-0 flex flex-col justify-end">
          {!isSameSender && (
             <Avatar className="h-8 w-8 mb-0.5">
              <AvatarImage src={message.senderId.avatar} />
              <AvatarFallback className="bg-muted text-xs">{message.senderId.name[0]}</AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {/* Low Bandwidth Sender Name Fallback */}
      {!isMe && lowBandwidth && !isSameSender && (
         <div className="w-8 shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground w-8 h-8 flex items-center justify-center bg-muted rounded-full">
                {message.senderId.name[0]}
            </span>
         </div>
      )}

      <div className={cn("flex flex-col max-w-[70%] sm:max-w-[65%]", isMe && "items-end")}>
        <div
          className={cn(
            "relative px-4 py-2 shadow-sm text-sm break-words transition-all",
            isMe
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
              : "bg-muted/50 dark:bg-muted/30 text-foreground border rounded-2xl rounded-bl-sm",
             isSameSender && isMe && "rounded-tr-md",
             isSameSender && !isMe && "rounded-tl-md",
            (message.voiceUrl || message.translatedVoiceUrl) && "min-w-[200px]"
          )}
        >
          {/* Voice Message Players */}
          {((message.voiceUrl || message.translatedVoiceUrl) && !lowBandwidth) && (
            <div className="space-y-3 mb-2">
              {message.voiceUrl && (
                <div className="space-y-1">
                  {message.translatedVoiceUrl && (
                    <div className="text-[10px] opacity-70 ml-1 font-medium">
                      Original
                    </div>
                  )}
                  <AudioPlayer
                    src={message.voiceUrl}
                    variant={isMe ? "sender" : "receiver"}
                  />
                </div>
              )}
              {message.translatedVoiceUrl && (
                <div className="space-y-1">
                  <div className="text-[10px] opacity-70 ml-1 font-medium">
                    {t('translated')}
                  </div>
                  <AudioPlayer
                    src={message.translatedVoiceUrl}
                    variant={isMe ? "sender" : "receiver"}
                  />
                </div>
              )}
            </div>
          )}

          {/* Low Bandwidth Audio Placeholder */}
          {((message.voiceUrl || message.translatedVoiceUrl) && lowBandwidth) && (
             <div className="mb-2 p-2 bg-background/20 rounded border border-current/10 text-xs italic opacity-80 flex items-center gap-2">
                <Volume2 className="h-3 w-3" />
                <span>{t('audioHidden')}</span>
             </div>
          )}

          {/* Text Message Content */}
          <div className="leading-relaxed whitespace-pre-wrap">
             {viewMode === "both" && message.translatedText ? (
               <div className="space-y-1.5">
                  <div className="opacity-80 text-xs pb-1.5 border-b border-white/10 dark:border-black/10">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5 block">
                      {message.languageFrom || t('original')}
                    </span>
                    {message.originalText}
                  </div>
                  <div className="text-xs pt-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-0.5 block">
                      {message.languageTo || t('translated')}
                    </span>
                    {message.translatedText}
                  </div>
               </div>
             ) : viewMode === "original" ? (
                message.originalText || message.translatedText
             ) : (
                message.translatedText || message.originalText
             )}

             {/* Phonetic Pronunciation */}
             {showPhonetic && message.phoneticText && (
               <div className="mt-2 pt-2 border-t border-dashed border-current/20 text-xs italic opacity-80 font-mono">
                 <span className="text-[9px] font-bold uppercase not-italic opacity-60 mr-1">{t('ipa')}</span>
                 {message.phoneticText}
               </div>
             )}
          </div>
          
          {/* Translation Toggles & Language Badges */}
          {message.translatedText && (
            <div className={cn("flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t", isMe ? "border-primary-foreground/10" : "border-border/40")}>
               <div className="flex items-center gap-1.5 text-[9px] font-medium opacity-70 uppercase tracking-wider">
                  <Globe className="h-2.5 w-2.5" />
                  <span>{message.languageFrom?.substring(0, 2) || "AU"}</span>
                  <span className="opacity-40">→</span>
                  <Languages className="h-2.5 w-2.5" />
                  <span>{message.languageTo?.substring(0, 2) || "EN"}</span>
               </div>
               
               <div className="flex gap-0.5 bg-black/5 dark:bg-white/5 rounded-md p-0.5">
                 {(["original", "translated", "both"] as const).map((mode) => (
                   <button 
                     key={mode}
                     onClick={() => setViewMode(mode)}
                     className={cn(
                       "text-[9px] px-1.5 py-0.5 rounded-sm transition-all font-medium capitalize", 
                       viewMode === mode 
                         ? "bg-background text-foreground shadow-sm" 
                         : "opacity-50 hover:opacity-100 hover:bg-background/50"
                     )}
                   >
                     {mode === "original" ? t('originalShort') : mode === "translated" ? t('translatedShort') : t('bothShort')}
                   </button>
                 ))}
               </div>
            </div>
          )}

          {/* Meta Info (Timestamp + Status) */}
          <div className={cn("flex items-center justify-end gap-1 select-none absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity", isMe ? "text-primary-foreground/70" : "text-foreground/50")}>
             {message.isOptimistic && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
          </div>
        </div>
        
        {/* Timestamp outside - small and subtle */}
          <div className={cn("flex justify-end px-1 mt-1 opacity-70", isMe ? "text-primary/70 dark:text-primary-foreground/70" : "text-muted-foreground")}>
             <span className="text-[10px] font-medium">
                  {new Date(message.createdAt).toLocaleTimeString(session?.user?.preferredLanguage || [], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
             </span>
          </div>

        {/* Reactions Display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className={cn("flex flex-wrap gap-1 mt-1 z-10", isMe ? "justify-end mr-1" : "justify-start ml-1")}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <Button
                key={emoji}
                variant="secondary"
                size="sm"
                className="h-5 px-1.5 text-[10px] rounded-full bg-background border shadow-sm hover:bg-muted"
                onClick={() => handleReaction(emoji)}
              >
                {emoji} <span className="ml-1">{count}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction Trigger & Tools (Hover) */}
      <div className={cn(
        "opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center gap-1",
        isMe ? "order-first mr-2" : "ml-2"
      )}>
         {/* Phonetic Helper (Placeholder) */}
         {message.phoneticText && (
           <Button
              variant="ghost"
              size="icon"
              className={cn("h-6 w-6 rounded-full hover:bg-muted", showPhonetic ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary")}
              title="Show Phonetic Pronunciation"
              onClick={() => setShowPhonetic(!showPhonetic)}
           >
              <span className="text-[10px] font-bold">Aa</span>
           </Button>
         )}

         {/* TTS Button */}
        {!message.voiceUrl && !message.translatedVoiceUrl && (
             <Button
               variant="ghost"
               size="icon"
               className="h-6 w-6 text-muted-foreground hover:text-foreground"
               onClick={() =>
                 handleTTS(
                   isMe
                     ? message.originalText
                     : message.translatedText || message.originalText,
                 )
               }
               title="Read Aloud"
             >
               {isLoadingTTS ? (
                 <Loader2 className="h-3 w-3 animate-spin" />
               ) : isReading ? (
                 <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
               ) : (
                 <Volume2 className="h-3.5 w-3.5" />
               )}
             </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full">
              <SmilePlus className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-125 transition-transform p-1"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {isMe && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(message._id)}
            title="Delete Message"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {isMe && (
        <Avatar className="h-8 w-8 mb-0.5 shrink-0 opacity-0 w-0 hidden sm:block"> {/* Hide my avatar or keep it invisible for spacing if needed, usually apps don't show my avatar */}
          <AvatarImage src={message.senderId.avatar} />
          <AvatarFallback>{message.senderId.name[0]}</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

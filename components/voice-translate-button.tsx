"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2, Languages } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface VoiceTranslateButtonProps {
  messageId: string;
  originalText: string;
  translatedText?: string;
  currentVoiceUrl?: string;
  targetLanguage: string;
}

export function VoiceTranslateButton({
  messageId,
  originalText,
  translatedText,
  currentVoiceUrl,
  targetLanguage,
}: VoiceTranslateButtonProps) {
  const t = useTranslations("Chat");
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasTranslated, setHasTranslated] = useState(!!currentVoiceUrl);

  const handleTranslateVoice = async () => {
    setIsTranslating(true);
    try {
      const textToTranslate = translatedText || originalText;
      
      const res = await axios.post("/api/chat/voice-translate", {
        messageId,
        targetLanguage,
        voice: "alloy",
      });

      setHasTranslated(true);
      toast.success(t("voiceTranslated"));
      
      window.location.reload();
    } catch (error) {
      console.error("Voice translation error:", error);
      toast.error(t("voiceTranslationFailed"));
    } finally {
      setIsTranslating(false);
    }
  };

  if (hasTranslated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1 bg-primary/10 text-primary"
        disabled
      >
        <Volume2 className="h-3 w-3" />
        {t("translated")}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs gap-1"
      onClick={handleTranslateVoice}
      disabled={isTranslating}
    >
      {isTranslating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Languages className="h-3 w-3" />
      )}
      {t("translateVoice")}
    </Button>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatApi } from "@/hooks/use-chat-api";

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
  const { sendVoiceTranslate } = useChatApi();
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasTranslated, setHasTranslated] = useState(!!currentVoiceUrl);

  const handleTranslateVoice = async () => {
    setIsTranslating(true);
    try {
      const data = {
        messageId,
        targetLanguage,
        voice: "alloy",
      };

      const result = await sendVoiceTranslate(data as unknown as FormData);
      if (result) {
        setHasTranslated(true);
        window.location.reload();
      }
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
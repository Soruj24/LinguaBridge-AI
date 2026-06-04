"use client";

import { Button } from "@/components/ui/button";

interface LanguageFooterProps {
  selectedLanguage: string | null;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}

export function LanguageFooter({
  selectedLanguage,
  isSaving,
  onSave,
  onCancel,
  t,
  tCommon,
}: LanguageFooterProps) {
  return (
    <div className="p-6 pt-4 border-t bg-background/95 backdrop-blur z-10 flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel}>
        {tCommon("cancel")}
      </Button>
      <Button
        onClick={onSave}
        disabled={!selectedLanguage || isSaving}
        className="min-w-[120px]"
      >
        {isSaving ? t("saving") : t("confirm")}
      </Button>
    </div>
  );
}

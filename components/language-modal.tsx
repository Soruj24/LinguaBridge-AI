"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Globe, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useLanguageModal } from "./language-modal/use-language-modal";
import { LanguageList } from "./language-modal/language-list";
import { LanguageFooter } from "./language-modal/language-footer";

export function LanguageModal({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const t = useTranslations("LanguageModal");
  const tCommon = useTranslations("Common");
  const {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    isSaving,
    handleSave,
    filteredLanguages,
    LANGUAGES,
    SUPPORTED_LOCALES,
  } = useLanguageModal(open, onOpenChange);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden border-none bg-background">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t("description")}
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-muted-foreground/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <LanguageList
            languages={filteredLanguages}
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
            supportedLocales={SUPPORTED_LOCALES}
            searchQuery={searchQuery}
            t={t}
          />
        </div>

        <LanguageFooter
          selectedLanguage={selectedLanguage}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={() => setIsOpen?.(false)}
          t={t}
          tCommon={tCommon}
        />
      </DialogContent>
    </Dialog>
  );
}

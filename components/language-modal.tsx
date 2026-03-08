"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, Globe, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";

// Comprehensive list of languages with native names and flags
const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "zh", name: "Chinese (Simplified)", native: "简体中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵", dir: "ltr" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷", dir: "ltr" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹", dir: "ltr" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹", dir: "ltr" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩", dir: "ltr" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱", dir: "ltr" },
  { code: "pl", name: "Polish", native: "Polski", flag: "🇵🇱", dir: "ltr" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳", dir: "ltr" },
  { code: "th", name: "Thai", native: "ไทย", flag: "🇹🇭", dir: "ltr" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr" },
  { code: "he", name: "Hebrew", native: "עברית", flag: "🇮🇱", dir: "rtl" },
  { code: "sv", name: "Swedish", native: "Svenska", flag: "🇸🇪", dir: "ltr" },
  { code: "da", name: "Danish", native: "Dansk", flag: "🇩🇰", dir: "ltr" },
  { code: "fi", name: "Finnish", native: "Suomi", flag: "🇫🇮", dir: "ltr" },
  { code: "no", name: "Norwegian", native: "Norsk", flag: "🇳🇴", dir: "ltr" },
  { code: "cs", name: "Czech", native: "Čeština", flag: "🇨🇿", dir: "ltr" },
  { code: "el", name: "Greek", native: "Ελληνικά", flag: "🇬🇷", dir: "ltr" },
  { code: "hu", name: "Hungarian", native: "Magyar", flag: "🇭🇺", dir: "ltr" },
  { code: "ro", name: "Romanian", native: "Română", flag: "🇷🇴", dir: "ltr" },
  { code: "uk", name: "Ukrainian", native: "Українська", flag: "🇺🇦", dir: "ltr" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu", flag: "🇲🇾", dir: "ltr" },
  { code: "fa", name: "Persian", native: "فارسی", flag: "🇮🇷", dir: "rtl" },
  { code: "ur", name: "Urdu", native: "اردو", flag: "🇵🇰", dir: "rtl" },
  { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪", dir: "ltr" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳", dir: "ltr" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳", dir: "ltr" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳", dir: "ltr" },
  { code: "sk", name: "Slovak", native: "Slovenčina", flag: "🇸🇰", dir: "ltr" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių", flag: "🇱🇹", dir: "ltr" },
  { code: "lv", name: "Latvian", native: "Latviešu", flag: "🇱🇻", dir: "ltr" },
  { code: "et", name: "Estonian", native: "Eesti", flag: "🇪🇪", dir: "ltr" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳", dir: "ltr" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳", dir: "ltr" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳", dir: "ltr" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳", dir: "ltr" },
  { code: "si", name: "Sinhala", native: "සිංහල", flag: "🇱🇰", dir: "ltr" },
  { code: "my", name: "Burmese", native: "မြန်မာ", flag: "🇲🇲", dir: "ltr" },
  { code: "km", name: "Khmer", native: "ខ្មែរ", flag: "🇰🇭", dir: "ltr" },
  { code: "az", name: "Azerbaijani", native: "Azərbaycan dili", flag: "🇦🇿", dir: "ltr" },
  { code: "uz", name: "Uzbek", native: "Oʻzbek tili", flag: "🇺🇿", dir: "ltr" },
  { code: "kk", name: "Kazakh", native: "Қазақ тілі", flag: "🇰🇿", dir: "ltr" },
];

export function LanguageModal({ 
  open, 
  onOpenChange 
}: { 
  open?: boolean; 
  onOpenChange?: (open: boolean) => void; 
} = {}) {
  const t = useTranslations('LanguageModal');
  const tCommon = useTranslations('Common');
  const { data: session, update } = useSession();
  const locale = useLocale();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(locale);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const SUPPORTED_LOCALES = ['en', 'bn', 'es', 'fr', 'ar', 'zh', 'hi'];

  useEffect(() => {
    setSelectedLanguage(locale);
  }, [locale]);

  useEffect(() => {
    // Auto-open logic only if not controlled (or if we want to force it)
    // We only auto-open if it's NOT controlled externally to avoid conflicts
    if (!isControlled) {
      const hasSeenLanguageModal = localStorage.getItem("lingua_language_modal_seen");
      if (session?.user && !hasSeenLanguageModal) {
        setInternalOpen(true);
      }
    }
  }, [session, isControlled]);

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedLanguage) return;

    try {
      setIsSaving(true);
      
      // Update user preference in DB
      await axios.put("/api/user/update", {
        preferredLanguage: selectedLanguage,
      });

      // Update session
      await update({
        preferredLanguage: selectedLanguage
      });

      localStorage.setItem("lingua_language_modal_seen", "true");
      
      // Close modal
      if (setIsOpen) {
        setIsOpen(false);
      } else {
        setInternalOpen(false);
      }
      
      toast.success("Language preference updated");
      
      // Redirect to the new locale path if supported
      const supportedLocales = ['en', 'bn', 'es', 'fr', 'ar', 'zh', 'hi'];
      if (supportedLocales.includes(selectedLanguage)) {
        router.replace(pathname, {locale: selectedLanguage});
      } else {
         router.refresh();
      }

    } catch (error) {
      console.error("Failed to save language preference:", error);
      toast.error("Failed to save language preference");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden border-none bg-background">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-muted-foreground/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:border-primary/50 hover:bg-accent group relative",
                  selectedLanguage === lang.code
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card"
                )}
              >
                <span className="text-2xl shadow-sm rounded-full overflow-hidden">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate flex items-center gap-2">
                    {lang.native}
                    {SUPPORTED_LOCALES.includes(lang.code) && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">
                        UI
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{lang.name}</div>
                </div>
                {selectedLanguage === lang.code && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
            
            {filteredLanguages.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                <Languages className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>{t('noResults', { query: searchQuery })}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 border-t bg-background/95 backdrop-blur z-10 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen && setIsOpen(false)}>
            {tCommon('cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedLanguage || isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? t('saving') : t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

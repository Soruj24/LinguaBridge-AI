"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

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

const SUPPORTED_LOCALES = ["en", "bn", "es", "fr", "ar", "zh", "hi"];

export function useLanguageModal(
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
) {
  const { data: session, update } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    locale,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedLanguage(locale);
  }, [locale]);

  useEffect(() => {
    if (!isControlled) {
      const hasSeen = localStorage.getItem("lingua_language_modal_seen");
      if (session?.user && !hasSeen) {
        setInternalOpen(true);
      }
    }
  }, [session, isControlled]);

  const filteredLanguages = LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = async () => {
    if (!selectedLanguage) return;

    try {
      setIsSaving(true);

      await api.put("/api/user/update", {
        preferredLanguage: selectedLanguage,
      });

      await update({ preferredLanguage: selectedLanguage });

      localStorage.setItem("lingua_language_modal_seen", "true");

      if (setIsOpen) setIsOpen(false);

      toast.success("Language preference updated");

      if (SUPPORTED_LOCALES.includes(selectedLanguage)) {
        router.replace(pathname, { locale: selectedLanguage });
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

  return {
    isOpen,
    setIsOpen,
    LANGUAGES,
    SUPPORTED_LOCALES,
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    isSaving,
    handleSave,
    filteredLanguages,
  };
}

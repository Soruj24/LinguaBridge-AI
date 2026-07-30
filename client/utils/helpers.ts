const FLAG_MAP: Record<string, string> = {
  en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", zh: "🇨🇳",
  ja: "🇯🇵", ko: "🇰🇷", ru: "🇷🇺", pt: "🇧🇷", it: "🇮🇹",
  bn: "🇧🇩", hi: "🇮🇳", ar: "🇸🇦", tr: "🇹🇷", nl: "🇳🇱",
  pl: "🇵🇱", vi: "🇻🇳", th: "🇹🇭", id: "🇮🇩", sv: "🇸🇪",
  no: "🇳🇴", da: "🇩🇰", fi: "🇫🇮", el: "🇬🇷", he: "🇮🇱",
  cs: "🇨🇿", sk: "🇸🇰", uk: "🇺🇦", ro: "🇷🇴", hu: "🇭🇺",
  bg: "🇧🇬", sr: "🇷🇸", hr: "🇭🇷", sl: "🇸🇮", lt: "🇱🇹",
  lv: "🇱🇻", et: "🇪🇪", fa: "🇮🇷", ur: "🇵🇰", ms: "🇲🇾",
  ta: "🇮🇳", te: "🇮🇳", ml: "🇮🇳", kn: "🇮🇳", gu: "🇮🇳",
  mr: "🇮🇳", pa: "🇮🇳", si: "🇱🇰", my: "🇲🇲", km: "🇰🇭",
  sw: "🇹🇿", az: "🇦🇿", uz: "🇺🇿", kk: "🇰🇿",
};

export function getLanguageFlag(langCode: string): string {
  return FLAG_MAP[langCode] || "🌐";
}

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: "\uD83C\uDDEC\uD83C\uDDE7",
  es: "\uD83C\uDDEA\uD83C\uDDF8",
  fr: "\uD83C\uDDEB\uD83C\uDDF7",
  de: "\uD83C\uDDE9\uD83C\uDDEA",
  it: "\uD83C\uDDEE\uD83C\uDDF9",
  pt: "\uD83C\uDDF5\uD83C\uDDF9",
  ru: "\uD83C\uDDF7\uD83C\uDDFA",
  ja: "\uD83C\uDDEF\uD83C\uDDF5",
  ko: "\uD83C\uDDF0\uD83C\uDDF7",
  zh: "\uD83C\uDDE8\uD83C\uDDF3",
  ar: "\uD83C\uDDF8\uD83C\uDDE6",
  hi: "\uD83C\uDDEE\uD83C\uDDF3",
  bn: "\uD83C\uDDE7\uD83C\uDDEC",
  pa: "\uD83C\uDDEE\uD83C\uDDF3",
  ta: "\uD83C\uDDEE\uD83C\uDDF3",
  th: "\uD83C\uDDF9\uD83C\uDDED",
  vi: "\uD83C\uDDFB\uD83C\uDDF3",
  nl: "\uD83C\uDDF3\uD83C\uDDF1",
  pl: "\uD83C\uDDF5\uD83C\uDDF1",
  tr: "\uD83C\uDDF9\uD83C\uDDF7",
};

export const getLanguageFlag = (lang: string): string =>
  LANGUAGE_FLAGS[lang] ?? "\uD83C\uDF10";

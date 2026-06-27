import { languageMap, languages } from "../constants/languages";
import { LANGUAGE_FLAGS, getLanguageFlag } from "../constants/language-flags";

export function getLanguageName(code: string): string {
  return languageMap[code] ?? code;
}

export function getLanguageCode(name: string): string | undefined {
  const entry = Object.entries(languageMap).find(
    ([, v]) => v.toLowerCase() === name.toLowerCase()
  );
  return entry?.[0];
}

export { languageMap, languages, LANGUAGE_FLAGS, getLanguageFlag };

export function needsDateSeparator(
  current: { createdAt: string },
  previous?: { createdAt: string }
): boolean {
  if (!previous) return true;
  const d1 = new Date(current.createdAt);
  const d2 = new Date(previous.createdAt);
  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
}

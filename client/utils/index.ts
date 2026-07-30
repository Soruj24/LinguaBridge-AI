import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { languageMap, languages } from "@/utils/languages";
export { formatLastSeen, formatTimestamp } from "@/utils/formatting";
export { getLanguageFlag } from "@/utils/helpers";

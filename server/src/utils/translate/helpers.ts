import { SUPPORTED_LANGUAGES_PART1 } from './languagesAH';
import { SUPPORTED_LANGUAGES_PART2 } from './languagesIZ';
import { POPULAR_LANGUAGES } from './popularLanguages';

export const SUPPORTED_LANGUAGES = { ...SUPPORTED_LANGUAGES_PART1, ...SUPPORTED_LANGUAGES_PART2 };

export const getLanguageName = (code: string): string => {
    return SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES] || code;
};

export const getAllLanguageCodes = (): string[] => {
    return Object.keys(SUPPORTED_LANGUAGES);
};

export const searchLanguages = (query: string): { [key: string]: string } => {
    const filtered: { [key: string]: string } = {};
    const lowerQuery = query.toLowerCase();

    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, name]) => {
        if (name.toLowerCase().includes(lowerQuery) || code.toLowerCase().includes(lowerQuery)) {
            filtered[code] = name;
        }
    });

    return filtered;
};

export const isLanguageSupported = (code: string): boolean => {
    return code in SUPPORTED_LANGUAGES || code === 'auto';
};

export const getLanguageCode = (name: string): string | null => {
    const entry = Object.entries(SUPPORTED_LANGUAGES).find(([code, langName]) =>
        langName.toLowerCase() === name.toLowerCase()
    );
    return entry ? entry[0] : null;
};

export const getPopularLanguages = (): Array<{ code: string; name: string }> => {
    return Object.entries(POPULAR_LANGUAGES).map(([code, name]) => ({
        code,
        name
    }));
};

export const getAllLanguages = (): Array<{ code: string; name: string }> => {
    return Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => ({
        code,
        name
    }));
};

export const needsTranslation = (text: string, targetLang: string): boolean => {
    if (!text || text.trim().length === 0) return false;

    if (targetLang === 'en') {
        const hasNonAscii = /[^\x00-\x7F]/.test(text);
        return hasNonAscii;
    }

    return true;
};

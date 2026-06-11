import axios from "axios";
import { isLanguageSupported } from './helpers';

export const translateText = async (text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> => {
    try {
        if (!text || text.trim().length === 0) {
            return text;
        }

        if (sourceLang === targetLang) {
            return text;
        }

        if (!isLanguageSupported(targetLang) || (sourceLang !== 'auto' && !isLanguageSupported(sourceLang))) {
            console.warn(`Unsupported language: source=${sourceLang}, target=${targetLang}`);
            return text;
        }

        const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
            params: {
                client: 'gtx',
                sl: sourceLang,
                tl: targetLang,
                dt: 't',
                q: text,
            },
            timeout: 15000,
        });

        const responseData = response.data;

        if (!responseData) {
            console.warn("Empty response from translation API");
            return text;
        }

        if (Array.isArray(responseData) && responseData[0] && Array.isArray(responseData[0])) {
            let translatedText = '';

            for (const segment of responseData[0]) {
                if (Array.isArray(segment) && segment[0] && typeof segment[0] === 'string') {
                    translatedText += segment[0];
                }
            }

            if (translatedText) {
                return translatedText;
            }
        }

        console.warn("Unexpected response structure from translation API:", responseData);
        return text;

    } catch (error: any) {
        console.error("Translation error:", error.message);

        if (error.code === 'ECONNABORTED') {
            console.warn("Translation request timeout");
        } else if (error.response) {
            console.warn(`Translation API error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            console.warn("No response received from translation API");
        }

        return text;
    }
};

export const translateTextRobust = async (text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> => {
    try {
        if (!text || text.trim().length === 0) return text;
        if (sourceLang === targetLang) return text;

        const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
            params: {
                client: 'gtx',
                sl: sourceLang,
                tl: targetLang,
                dt: 't',
                q: text,
            },
            timeout: 10000,
        });

        const data = response.data;

        const findTranslation = (obj: any): string => {
            if (typeof obj === 'string') {
                return obj;
            }

            if (Array.isArray(obj)) {
                if (obj.length >= 1 && typeof obj[0] === 'string') {
                    return obj[0];
                }

                for (const item of obj) {
                    const result = findTranslation(item);
                    if (result && result !== text) {
                        return result;
                    }
                }
            }

            return '';
        };

        const translation = findTranslation(data);
        return translation || text;

    } catch (error: any) {
        console.error("Robust translation error:", error.message);
        return text;
    }
};

import { translateText } from './translation';

export const translateMultiple = async (texts: string[], targetLang: string, sourceLang: string = 'auto'): Promise<string[]> => {
    try {
        if (!texts || texts.length === 0) return texts;

        const translations = await Promise.all(
            texts.map(text => translateText(text, targetLang, sourceLang))
        );

        return translations;
    } catch (error: any) {
        console.error("Batch translation error:", error.message);
        return texts;
    }
};

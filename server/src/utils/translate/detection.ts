import axios from "axios";

export const detectLanguage = async (text: string): Promise<string> => {
    try {
        if (!text || text.trim().length === 0) {
            return 'auto';
        }

        const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
            params: {
                client: 'gtx',
                sl: 'auto',
                tl: 'en',
                dt: 't',
                q: text.substring(0, 500),
            },
            timeout: 10000,
        });

        const detectedLang = response.data[2];
        return detectedLang || 'auto';
    } catch (error: any) {
        console.error("Language detection error:", error.message);
        return 'auto';
    }
};

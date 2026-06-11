import { getOpenAI } from "./client";
import { languageMap } from "@/lib/languages";

export async function translateText(
  text: string,
  targetLanguageCode: string,
): Promise<string> {
  try {
    const targetLanguage = languageMap[targetLanguageCode] || targetLanguageCode;

    const systemPrompt = `You are a professional translator. Translate the following text into ${targetLanguage}. 
    Do not add any explanations or extra text. Just provide the translation.
    If the text is already in the target language, return it as is.`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const systemPrompt = `You are a language detector. Detect the language of the following text. 
    Return only the ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'zh').`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    const result = response.choices[0]?.message?.content;
    return result?.trim().toLowerCase() || "en";
  } catch (error) {
    console.error("Language detection error:", error);
    return "en";
  }
}

export async function processTranslationPipeline(
  text: string,
  targetLanguageCode: string,
): Promise<{
  original: string;
  detectedLanguage: string;
  translated: string;
  phonetic: string;
}> {
  try {
    const targetLanguage = languageMap[targetLanguageCode] || targetLanguageCode;

    const systemPrompt = `You are a sophisticated translation engine.
Analyze the input text, detect its language, and translate it into ${targetLanguage}.
Also provide the phonetic pronunciation (IPA or standard transliteration) of the ORIGINAL text.
If the text is already in ${targetLanguage}, the translated text should be the same as the original.
Return your response as a JSON object with the following structure:
{
  "original": "the original input text",
  "detectedLanguage": "ISO 639-1 language code of the original text",
  "translated": "the translated text in ${targetLanguage}",
  "phonetic": "IPA pronunciation or standard transliteration of the ORIGINAL text"
}`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Translate this text: ${text}` },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const result = JSON.parse(content);
      return {
        original: result.original || text,
        detectedLanguage: result.detectedLanguage || "unknown",
        translated: result.translated || text,
        phonetic: result.phonetic || "",
      };
    }
  } catch (error) {
    console.error("Pipeline structured output error:", error);
  }

  const fallbackTranslation = await translateText(text, targetLanguageCode);
  return {
    original: text,
    detectedLanguage: "unknown",
    translated: fallbackTranslation,
    phonetic: "",
  };
}

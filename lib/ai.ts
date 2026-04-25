import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { languageMap } from "./languages";

let openai: OpenAI | null = null;

function getOpenAI() {
  if (openai) return openai;

  const openaiKey = process.env.OPENAI_API_KEY;
  const routerKey = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;

  if (openaiKey) {
    openai = new OpenAI({
      baseURL: "https://api.openai.com/v1",
      apiKey: openaiKey,
    });
  } else {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: routerKey || "sk-placeholder",
    });
  }
  return openai;
}

export async function translateText(
  text: string,
  targetLanguageCode: string,
): Promise<string> {
  try {
    const targetLanguage =
      languageMap[targetLanguageCode] || targetLanguageCode;

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

export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    const response = await getOpenAI().audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    return response.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
}

export async function textToSpeech(text: string): Promise<Buffer> {
  try {
    const response = await getOpenAI().audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
}

export async function translateVoice(
  text: string,
  targetLanguageCode: string,
  targetVoice: string = "alloy",
): Promise<Buffer> {
  try {
    const response = await getOpenAI().audio.speech.create({
      model: "tts-1",
      voice: targetVoice,
      input: text,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error("Voice translation error:", error);
    throw error;
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
    const targetLanguage =
      languageMap[targetLanguageCode] || targetLanguageCode;

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

export async function generateSmartReplies(
  messages: { text: string; sender: "me" | "other" }[],
  userLanguageCode: string,
): Promise<string[]> {
  try {
    const userLanguage = languageMap[userLanguageCode] || userLanguageCode;

    const context = messages
      .slice(-5)
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    const systemPrompt = `You are a helpful AI assistant for a chat application.
Based on the conversation history below, generate exactly 3 short, natural, and relevant reply suggestions for the user ("me").
The replies MUST be in the user's language: ${userLanguage}.
Keep replies concise (1-5 words).
Do not generate questions unless appropriate.
Do not repeat suggestions.
Return your response as a JSON array of strings: ["reply1", "reply2", "reply3"]

Conversation History:
${context}`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate reply suggestions" },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const result = JSON.parse(content);
      if (Array.isArray(result.replies)) {
        return result.replies.slice(0, 3);
      }
      if (Array.isArray(result)) {
        return result.slice(0, 3);
      }
    }
  } catch (error) {
    console.error("Smart reply error:", error);
  }
  return [];
}

export async function summarizeChat(
  messages: { text: string; sender: string }[],
  userLanguageCode: string,
): Promise<string> {
  try {
    const userLanguage = languageMap[userLanguageCode] || userLanguageCode;

    const context = messages
      .slice(-50)
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    const systemPrompt = `You are a helpful AI assistant.
Summarize the following chat conversation in 3-5 bullet points.
The summary MUST be in the user's language: ${userLanguage}.
Focus on the main topics and decisions.

Conversation:
${context}`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
      ],
      temperature: 0,
    });

    return response.choices[0]?.message?.content || "Unable to generate summary.";
  } catch (error) {
    console.error("Summary error:", error);
    return "Failed to generate summary.";
  }
}

export async function rewriteText(
  text: string,
  tone: string,
  targetLanguageCode: string,
): Promise<string> {
  try {
    const targetLanguage =
      languageMap[targetLanguageCode] || targetLanguageCode;
    const systemPrompt = `You are a helpful writing assistant. Rewrite the following text to be more ${tone}.
    The rewritten text MUST be in ${targetLanguage}.
    Do not add any explanations or extra text. Just provide the rewritten text.`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error("Rewrite error:", error);
    return text;
  }
}
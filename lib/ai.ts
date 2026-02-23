import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import OpenAI from "openai";
import fs from "fs";


const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;

let chatModel: ChatOpenAI | null = null;
let openai: OpenAI | null = null;

function getChatModel() {
  if (chatModel) return chatModel;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: OPENROUTER_API_KEY is not set.");
  }

  chatModel = new ChatOpenAI({
    modelName: "openai/gpt-4o-mini", // OpenRouter model ID
    temperature: 0,
    apiKey: apiKey || "sk-placeholder", 
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
  return chatModel;
}

function getOpenAI() {
  if (openai) return openai;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY;
  
  openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey || "sk-placeholder",
  });
  return openai;
}

export async function translateText(
  text: string,
  targetLanguageCode: string
): Promise<string> {
  try {
    const targetLanguage = languageMap[targetLanguageCode] || targetLanguageCode;
    
    const systemPrompt = `You are a professional translator. Translate the following text into ${targetLanguage}. 
    Do not add any explanations or extra text. Just provide the translation.
    If the text is already in the target language, return it as is.`;
    
    const response = await getChatModel().invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text),
    ]);

    return typeof response.content === 'string' ? response.content : "";
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Fallback to original text
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const systemPrompt = `You are a language detector. Detect the language of the following text. 
    Return only the ISO 639-1 language code (e.g., 'en', 'es', 'fr', 'zh').`;

    const response = await getChatModel().invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text),
    ]);

    return typeof response.content === 'string' ? response.content.trim().toLowerCase() : "en";
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

const languageMap: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ru: "Russian",
  pt: "Portuguese",
  it: "Italian",
  bn: "Bengali",
  hi: "Hindi",
  ar: "Arabic",
  tr: "Turkish",
  nl: "Dutch",
  pl: "Polish",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
};

export async function processTranslationPipeline(
  text: string,
  targetLanguageCode: string
): Promise<{ original: string; detectedLanguage: string; translated: string; phonetic: string }> {
  try {
    const targetLanguage = languageMap[targetLanguageCode] || targetLanguageCode;

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        original: z.string().describe("The original input text"),
        detectedLanguage: z.string().describe("ISO 639-1 language code of the original text"),
        translated: z.string().describe(`The translated text in ${targetLanguage}`),
        phonetic: z.string().describe("IPA pronunciation or standard transliteration (e.g. Pinyin) of the ORIGINAL text. Empty if not applicable/needed."),
      })
    );

    const formatInstructions = parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are a sophisticated translation engine.
Analyze the input text, detect its language, and translate it into {targetLanguage}.
Also provide the phonetic pronunciation (IPA or standard transliteration) of the ORIGINAL text to help the receiver pronounce it.
If the text is already in {targetLanguage}, the translated text should be the same as the original.

{format_instructions}

Input Text:
{text}`,
      inputVariables: ["targetLanguage", "text"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const chain = prompt.pipe(getChatModel()).pipe(parser);

    const result = await chain.invoke({
      targetLanguage,
      text,
    });

    return result;
  } catch (error) {
    console.error("Pipeline structured output error:", error);
    
    // Fallback: Try simple translation if structured output fails
    try {
        console.log("Attempting fallback translation...");
        const fallbackTranslation = await translateText(text, targetLanguageCode);
        return {
            original: text,
            detectedLanguage: "unknown",
            translated: fallbackTranslation,
            phonetic: ""
        };
    } catch (fallbackError) {
        console.error("Fallback translation also failed:", fallbackError);
        return {
            original: text,
            detectedLanguage: "unknown",
            translated: text,
            phonetic: ""
        };
    }
  }
}

export async function generateSmartReplies(
  messages: { text: string; sender: "me" | "other" }[],
  userLanguageCode: string
): Promise<string[]> {
  try {
    const userLanguage = languageMap[userLanguageCode] || userLanguageCode;
    
    // Format the last few messages for context (max 5)
    const context = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join("\n");

    const parser = StructuredOutputParser.fromZodSchema(
      z.array(z.string()).describe("Array of 3 short, relevant reply suggestions")
    );
    
    const formatInstructions = parser.getFormatInstructions();

    const systemPrompt = `You are a helpful AI assistant for a chat application.
Based on the conversation history below, generate 3 short, natural, and relevant reply suggestions for the user ("me").
The replies MUST be in the user's language: ${userLanguage}.
Keep replies concise (1-5 words).
Do not generate questions unless appropriate.
Do not repeat suggestions.

{format_instructions}

Conversation History:
${context}`;

    const prompt = new PromptTemplate({
      template: systemPrompt,
      inputVariables: [],
      partialVariables: { format_instructions: formatInstructions },
    });

    const chain = prompt.pipe(getChatModel()).pipe(parser);
    const result = await chain.invoke({});
    return result;
  } catch (error) {
    console.error("Smart reply error:", error);
    return [];
  }
}

export async function summarizeChat(
  messages: { text: string; sender: string }[],
  userLanguageCode: string
): Promise<string> {
  try {
    const userLanguage = languageMap[userLanguageCode] || userLanguageCode;
    
    // Format messages (max last 50 for summary)
    const context = messages.slice(-50).map(m => `${m.sender}: ${m.text}`).join("\n");

    const systemPrompt = `You are a helpful AI assistant.
Summarize the following chat conversation in 3-5 bullet points.
The summary MUST be in the user's language: ${userLanguage}.
Focus on the main topics and decisions.

Conversation:
${context}`;

    const response = await getChatModel().invoke([
      new SystemMessage(systemPrompt)
    ]);

    return typeof response.content === 'string' ? response.content : "Unable to generate summary.";
  } catch (error) {
    console.error("Summary error:", error);
    return "Failed to generate summary.";
  }
}

export async function rewriteText(
  text: string,
  tone: string,
  targetLanguageCode: string
): Promise<string> {
  try {
    const targetLanguage = languageMap[targetLanguageCode] || targetLanguageCode;
    const systemPrompt = `You are a helpful writing assistant. Rewrite the following text to be more ${tone}.
    The rewritten text MUST be in ${targetLanguage}.
    Do not add any explanations or extra text. Just provide the rewritten text.`;
    
    const response = await getChatModel().invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text),
    ]);

    return typeof response.content === 'string' ? response.content : text;
  } catch (error) {
    console.error("Rewrite error:", error);
    return text;
  }
}

import { getOpenAI } from "./client";
import { languageMap } from "../../utils/languages";

export async function rewriteText(
  text: string,
  tone: string,
  targetLanguageCode: string,
): Promise<string> {
  try {
    const targetLanguage = languageMap[targetLanguageCode] || targetLanguageCode;
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

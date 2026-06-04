import { getOpenAI } from "./client";
import { languageMap } from "@/lib/languages";

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

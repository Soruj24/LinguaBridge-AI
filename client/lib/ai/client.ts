import OpenAI from "openai";

let openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
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

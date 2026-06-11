import { ChatOllama } from "@langchain/ollama";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { getTools } from "./aiTools";

export class AiService {
  private model: ChatOllama;
  private chatHistory: Map<string, BaseMessage[]>;

  constructor() {
    this.model = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: "llama3.2",
      temperature: 0.7,
    });
    this.chatHistory = new Map<string, BaseMessage[]>();
  }

  async chat(userId: string, message: string) {
    try {
      const tools = getTools(userId);

      const prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          "You are a helpful AI assistant for a User Management System. You can help users manage their accounts, understand system features, and check their support tickets. Use the provided tools to get specific information about the user if needed.",
        ],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
      ]);

      if (!this.chatHistory.has(userId)) {
        this.chatHistory.set(userId, []);
      }
      const userHistory = this.chatHistory.get(userId)!;

      let context = "";
      console.log(`AI Chat: Processing message from user ${userId}: "${message}"`);

      if (
        message.toLowerCase().includes("profile") ||
        message.toLowerCase().includes("who am i")
      ) {
        console.log("Tool: get_my_profile");
        context = await tools[0].call({});
      } else if (message.toLowerCase().includes("ticket")) {
        console.log("Tool: get_my_tickets");
        context = await tools[1].call({});
      } else if (
        message.toLowerCase().includes("document") ||
        message.toLowerCase().includes("file") ||
        message.toLowerCase().includes("pdf")
      ) {
        console.log("Tool: get_user_documents");
        context = await tools[3].call({});

        if (message.toLowerCase().includes("read") || message.toLowerCase().includes("content") || message.toLowerCase().includes("what is in")) {
           console.log("Tool: read_document_content");
           const words = message.split(" ");
           const fileName = words[words.length - 1];
           const docContent = await tools[4].call(fileName);
           context += `\n\nContent of document: ${docContent}`;
        }
      }

      const formattedPrompt = await prompt.formatMessages({
        chat_history: userHistory,
        input: message,
      });

      if (context) {
        console.log("Context added to prompt");
        formattedPrompt.unshift(
          new HumanMessage({
            content: `System Context Information: ${context}`,
          })
        );
      }

      console.log("Calling Ollama...");
      const response = await this.model.invoke(formattedPrompt);
      console.log("AI Response received");

      userHistory.push(new HumanMessage(message));
      userHistory.push(new AIMessage(response.content as string));

      if (userHistory.length > 10) {
        userHistory.splice(0, userHistory.length - 10);
      }

      return response.content;
    } catch (error: any) {
      console.error("AI Service Error:", error);
      return "I'm sorry, I'm having trouble connecting to my brain right now. Please make sure Ollama is running with llama3.2.";
    }
  }
}

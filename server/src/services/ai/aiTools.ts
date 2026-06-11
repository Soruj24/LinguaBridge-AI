import { DynamicTool } from "@langchain/core/tools";
import User from "../../models/schemas/User";
import { SupportTicket } from "../../models/SupportTicket";
import { UserDocument } from "../../models/UserDocument";

export function getTools(userId: string) {
  return [
    new DynamicTool({
      name: "get_my_profile",
      description: "Get the current logged-in user's profile information",
      func: async () => {
        const user = await User.findById(userId).select("-password");
        return JSON.stringify(user || { error: "User not found" });
      },
    }),
    new DynamicTool({
      name: "get_my_tickets",
      description: "Get all support tickets for the current logged-in user",
      func: async () => {
        const tickets = await SupportTicket.find({ userId });
        return JSON.stringify(tickets);
      },
    }),
    new DynamicTool({
      name: "get_system_info",
      description: "Get general information about the User Management System",
      func: async () => {
        return "This is a MERN-stack User Management System with features like social login (Google, GitHub, Facebook), 2FA, support tickets, and AI assistance.";
      },
    }),
    new DynamicTool({
      name: "get_user_documents",
      description: "Search or list documents uploaded by the user",
      func: async () => {
        const docs = await UserDocument.find({ userId }).select("fileName fileSize createdAt");
        return JSON.stringify(docs);
      },
    }),
    new DynamicTool({
      name: "read_document_content",
      description: "Read the full text content of a specific document by its name or ID",
      func: async (input: string) => {
        const doc = await UserDocument.findOne({
          userId,
          $or: [{ fileName: new RegExp(input, "i") }, { _id: input.match(/^[0-9a-fA-F]{24}$/) ? input : null }]
        });
        return doc ? doc.textContent : "Document not found.";
      },
    }),
  ];
}

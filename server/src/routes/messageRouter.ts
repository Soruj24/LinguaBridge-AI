import { Router } from "express";
import asyncHandler from "express-async-handler";
import * as messageController from "../controllers/messageController";

const messageRouter = Router();

messageRouter.get("/chats/:userId", asyncHandler(messageController.getChats));
messageRouter.get("/:chatId/messages", asyncHandler(messageController.getMessages));
messageRouter.post("/", asyncHandler(messageController.createChat));
messageRouter.post("/:chatId/messages", asyncHandler(messageController.sendMessage));
messageRouter.put("/:chatId/messages/:messageId", asyncHandler(messageController.editMessage));
messageRouter.delete("/:chatId/messages/:messageId", asyncHandler(messageController.deleteMessage));
messageRouter.post("/:chatId/read", asyncHandler(messageController.markAsRead));
messageRouter.get("/search/:userId", asyncHandler(messageController.searchMessages));
messageRouter.post("/forward", asyncHandler(messageController.forwardMessage));
messageRouter.post("/:chatId/messages/:messageId/pin", asyncHandler(messageController.togglePinMessage));
messageRouter.post("/:chatId/messages/:messageId/reactions", asyncHandler(messageController.toggleReaction));
messageRouter.get("/:chatId/pinned", asyncHandler(messageController.getPinnedMessages));
messageRouter.post("/:chatId/messages/schedule", asyncHandler(messageController.scheduleMessage));

export default messageRouter;

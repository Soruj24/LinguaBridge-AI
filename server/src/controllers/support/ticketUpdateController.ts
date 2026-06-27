import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { SupportTicket } from "../../models/SupportTicket";
import { successResponse } from "../responseControllers";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { AuthRequest } from "../../types";
import Notification from "../../models/Notification";

export const handleUpdateTicketStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    if (!status) {
      throw createError(400, "Status is required");
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!ticket) {
      throw createError(404, "Support ticket not found");
    }

    await Notification.create({
      userId: ticket.userId,
      title: "Ticket Status Updated",
      message: `Your ticket #${ticket.ticketNumber} status has been changed to ${status}.`,
      type: "info",
      category: "support",
      actionUrl: `/help?tab=tickets&ticketId=${ticket._id}`,
    });

    successResponse(res, {
      statusCode: 200,
      message: "Support ticket status updated successfully",
      payload: { ticket },
    });
  }
);

export const handleAddTicketComment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { message } = req.body;

    if (!message) {
      throw createError(400, "Message is required");
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      throw createError(404, "Support ticket not found");
    }

    if (
      req.user?.role !== "admin" &&
      ticket.userId.toString() !== req.user?._id.toString()
    ) {
      throw createError(403, "You are not authorized to comment on this ticket");
    }

    const attachments: string[] = [];
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const result: any = await uploadToCloudinary(
            file.buffer,
            "support-tickets"
          );
          attachments.push(result.secure_url);
        } catch (error) {
          console.error("Cloudinary upload error:", error);
        }
      }
    }

    ticket.comments.push({
      userId: req.user?._id,
      message,
      attachments,
      createdAt: new Date(),
    });

    if (req.user?.role === "admin" && ticket.status === "open") {
      ticket.status = "in-progress";
    }

    await ticket.save();

    if (req.user?.role === "admin") {
      await Notification.create({
        userId: ticket.userId,
        title: "New Support Response",
        message: `An admin has replied to your ticket #${ticket.ticketNumber}.`,
        type: "info",
        category: "support",
        actionUrl: `/help?tab=tickets&ticketId=${ticket._id}`,
      });
    }

    successResponse(res, {
      statusCode: 201,
      message: "Comment added successfully",
      payload: { ticket },
    });
  }
);

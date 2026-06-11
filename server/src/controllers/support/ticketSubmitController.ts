import { Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { SupportTicket } from "../../models/SupportTicket";
import { successResponse } from "../responsControllers";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { AuthRequest } from "../../types";
import Notification from "../../models/Notification";

export const handleSubmitTicket = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { subject, description, category, priority, logs } = req.body;

    if (!subject || !description || !category) {
      throw createError(400, "Subject, description, and category are required");
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

    const finalDescription = logs
      ? `${description}\n\n--- SECURITY LOGS ATTACHED ---\n${logs}`
      : description;

    const ticket = await SupportTicket.create({
      userId: req.user?._id,
      subject,
      description: finalDescription,
      category,
      priority: priority || "medium",
      attachments,
    });

    await Notification.create({
      userId: req.user?._id,
      title: "Support Ticket Submitted",
      message: `Your ticket #${ticket.ticketNumber} has been submitted successfully.`,
      type: "success",
      category: "support",
      actionUrl: `/help?tab=tickets&ticketId=${ticket._id}`,
    });

    successResponse(res, {
      statusCode: 201,
      message: "Support ticket submitted successfully",
      payload: {
        ticketId: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        estimatedResponseTime: "24-48 hours",
      },
    });
  }
);

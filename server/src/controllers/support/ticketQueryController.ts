import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import { SupportTicket } from "../../models/SupportTicket";
import { successResponse } from "../responseControllers";
import { AuthRequest } from "../../types";

export const handleGetAllTickets = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;

    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const totalTickets = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .populate("userId", "username email firstName lastName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    successResponse(res, {
      statusCode: 200,
      message: "Support tickets fetched successfully",
      payload: {
        tickets,
        pagination: {
          totalTickets,
          totalPages: Math.ceil(totalTickets / limit),
          currentPage: page,
        },
      },
    });
  }
);

export const handleGetUserTickets = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tickets = await SupportTicket.find({ userId: req.user?._id }).sort({
      createdAt: -1,
    });

    successResponse(res, {
      statusCode: 200,
      message: "Your support tickets fetched successfully",
      payload: { tickets },
    });
  }
);

export const handleGetTicketById = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("userId", "username email firstName lastName")
      .populate("comments.userId", "username email firstName lastName role");

    if (!ticket) {
      throw createError(404, "Support ticket not found");
    }

    if (
      req.user?.role !== "admin" &&
      (ticket.userId as any)._id.toString() !== req.user?._id.toString()
    ) {
      throw createError(403, "You are not authorized to view this ticket");
    }

    successResponse(res, {
      statusCode: 200,
      message: "Support ticket fetched successfully",
      payload: { ticket },
    });
  }
);

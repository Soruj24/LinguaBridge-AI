import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as friendsController from "../controllers/friendsController";
import connectDB from "../config/connectDB";
import { ChatUser, Friendship, Block } from "../models/chat";
import { findOrCreateChatUser } from "../utils/syncUser";
import User from "../models/schemas/User";
import { generateAuthTokens } from "../utils/auth";
import { sanitizeUser } from "../utils";
import { IUser } from "../types";
import { extractTokenUser } from "../middleware/auth/tokenAuth";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../helper/cookie";

const friendsRouter = Router();

// ── Auth sync: get accessToken + refreshToken for NextAuth users ──
friendsRouter.post("/auth-sync", async (req: Request, res: Response) => {
  try {
    const { email, name, avatar, provider, providerId } = req.body;
    if (!email) { res.status(400).json({ error: "email is required" }); return; }

    await connectDB();

    // Find or create auth User
    const searchQuery: Record<string, string> = { email: email.toLowerCase() };
    let user = await User.findOne(searchQuery);

    if (!user) {
      const uname = (email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]/g, "");
      user = await User.create({
        username: uname,
        email: email.toLowerCase(),
        firstName: name?.split(" ")[0] || "",
        lastName: name?.split(" ").slice(1).join("") || "",
        displayName: name || uname,
        emailVerified: true,
        status: "active",
        avatar: avatar ? { url: avatar, publicId: `social_${provider || "nextauth"}_${providerId || email}`, uploadedAt: new Date() } : undefined,
      });
    }

    // Generate tokens
    const tokens = generateAuthTokens(user as unknown as IUser);

    // Also sync ChatUser
    await findOrCreateChatUser({ email, name, avatar });

    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user as unknown as IUser),
    });
  } catch (e: unknown) {
    console.error("Auth sync error:", e);
    const msg = e instanceof Error ? e.message : "Auth sync failed";
    res.status(500).json({ error: msg });
  }
});

// ── Refresh token endpoint ──
friendsRouter.post("/refresh-token", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ error: "refreshToken is required" }); return; }

    await connectDB();
    const jwt = await import("jsonwebtoken");
    const { env } = await import("../shared/env");

    const decoded = jwt.default.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string; email: string; role: string };

    const user = await User.findById(decoded.id);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const tokens = generateAuthTokens(user as unknown as IUser);
    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Token refresh failed";
    res.status(401).json({ error: msg });
  }
});

// ── Sync user (create/find ChatUser from NextAuth) ──
friendsRouter.post("/sync-user", async (req: Request, res: Response) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) { res.status(400).json({ error: "email is required" }); return; }
    const user = await findOrCreateChatUser({ email, name, avatar });
    res.json({ user });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    res.status(500).json({ error: msg });
  }
});

// ── Search users ──
friendsRouter.get("/search", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.json({ users: [] }); return; }

  const currentUser = await ChatUser.findOne({ email: tokenUser.email.toLowerCase() });
  if (!currentUser) { res.json({ users: [] }); return; }

  const { query } = req.query;
  if (!query || (query as string).length < 2) { res.json({ users: [] }); return; }

  const users = await ChatUser.find({
    name: { $regex: query as string, $options: "i" },
    _id: { $ne: currentUser._id },
  }).select("name email avatar").limit(20).lean();

  const usersWithStatus = await Promise.all(
    users.map(async (u) => {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: currentUser._id, recipient: u._id },
          { requester: u._id, recipient: currentUser._id },
        ],
      });

      const block = await Block.findOne({
        $or: [
          { blocker: currentUser._id, blocked: u._id },
          { blocker: u._id, blocked: currentUser._id },
        ],
      });

      let friendStatus: "none" | "friends" | "request_sent" | "request_received" = "none";
      if (block) friendStatus = "none";
      else if (friendship) {
        if (friendship.status === "accepted") friendStatus = "friends";
        else if (friendship.status === "pending") {
          friendStatus = friendship.requester.toString() === currentUser._id.toString() ? "request_sent" : "request_received";
        }
      }

      return { ...u, friendStatus };
    })
  );

  res.json({ users: usersWithStatus });
});

// ── Get pending requests (compat: uses token auth) ──
friendsRouter.get("/requests", async (req: Request, res: Response) => {
  try {
    await connectDB();
    const tokenUser = extractTokenUser(req);
    if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

    const user = await ChatUser.findOne({ email: tokenUser.email.toLowerCase() });
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const requests = await Friendship.find({ recipient: user._id, status: "pending" })
      .populate("requester", "name email avatar preferredLanguage")
      .sort({ createdAt: -1 })
      .lean();

    const incoming = requests.map((r) => ({ _id: r._id, user: r.requester, createdAt: r.createdAt }));
    res.json({ incoming });
  } catch (error) {
    console.error("Friend requests fetch error:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// ── Send friend request (compat: uses token auth) ──
friendsRouter.post("/request", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await ChatUser.findOne({ email: tokenUser.email.toLowerCase() });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const { recipientId } = req.body;
  if (!recipientId) { res.status(400).json({ error: "recipientId is required" }); return; }

  req.body.requesterId = user._id.toString();
  req.body.recipientId = recipientId;
  friendsController.sendFriendRequest(req, res);
});

// ── Accept/reject friend request (compat: PATCH /:id with {action}) ──
friendsRouter.patch("/:id", async (req: Request, res: Response) => {
  const { action } = req.body;
  if (action === "accept") {
    req.params.friendshipId = req.params.id;
    friendsController.acceptFriendRequest(req, res);
  } else if (action === "reject") {
    req.params.friendshipId = req.params.id;
    friendsController.rejectFriendRequest(req, res);
  } else {
    res.status(400).json({ error: "action must be 'accept' or 'reject'" });
  }
});

friendsRouter.get("/status/:userId1/:userId2", asyncHandler(friendsController.getFriendStatus));
friendsRouter.get("/block/:blockId", asyncHandler(friendsController.unblockUser));

// ── Compat routes (must be before /:userId parametric routes) ──
friendsRouter.get("/blocked-users", extractTokenUser ? async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const blocks = await Block.find({ blockerId: tokenUser._id }).populate("blockedId", "name email avatar").lean();
  res.json(blocks.map((b) => ({ _id: b._id, blocked: b.blockedId, createdAt: b.createdAt })));
} : async (_req: Request, res: Response) => { res.json([]); });

friendsRouter.get("/export", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  const friendships = await Friendship.find({
    $or: [{ requesterId: tokenUser._id }, { receiverId: tokenUser._id }],
    status: "accepted",
  }).populate("requesterId", "name email avatar preferredLanguage").populate("receiverId", "name email avatar preferredLanguage").lean();

  const friends = friendships.map((f) => {
    const friend = (f.requesterId as unknown as Record<string, unknown>)._id?.toString() === tokenUser._id
      ? f.receiverId : f.requesterId;
    return friend;
  });

  const format = req.query.format;
  if (format === "csv") {
    const csv = "Name,Email,Language\n" + friends.map((f: any) => `"${f.name}","${f.email}","${f.preferredLanguage || ""}"`).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
    res.send(csv);
  } else {
    res.json({ contacts: friends });
  }
});

friendsRouter.post("/import", async (req: Request, res: Response) => {
  await connectDB();
  const tokenUser = extractTokenUser(req);
  if (!tokenUser) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const { contacts } = req.body;
    if (!Array.isArray(contacts)) { res.status(400).json({ error: "contacts array required" }); return; }

    let imported = 0;
    for (const contact of contacts) {
      if (contact.email) {
        const existing = await User.findOne({ email: contact.email.toLowerCase() });
        if (existing) {
          const alreadyFriends = await Friendship.findOne({
            $or: [
              { requesterId: tokenUser._id, receiverId: existing._id },
              { requesterId: existing._id, receiverId: tokenUser._id },
            ],
          });
          if (!alreadyFriends) {
            await Friendship.create({
              requesterId: tokenUser._id, receiverId: existing._id, status: "pending",
            });
            imported++;
          }
        }
      }
    }
    res.json({ imported, total: contacts.length });
  } catch (e) {
    res.status(500).json({ error: "Import failed" });
  }
});

friendsRouter.get("/:userId/requests", asyncHandler(friendsController.getPendingRequests));
friendsRouter.get("/:userId/blocked", asyncHandler(friendsController.getBlockedUsers));
friendsRouter.get("/:userId", asyncHandler(friendsController.getFriends));
friendsRouter.post("/request", asyncHandler(friendsController.sendFriendRequest));
friendsRouter.post("/:friendshipId/accept", asyncHandler(friendsController.acceptFriendRequest));
friendsRouter.post("/:friendshipId/reject", asyncHandler(friendsController.rejectFriendRequest));
friendsRouter.post("/block", asyncHandler(friendsController.blockUser));
friendsRouter.delete("/:friendshipId", asyncHandler(friendsController.removeFriend));
friendsRouter.delete("/block/:blockId", asyncHandler(friendsController.unblockUser));

export default friendsRouter;

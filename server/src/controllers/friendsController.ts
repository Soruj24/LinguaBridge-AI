import { Request, Response } from "express";
import connectDB from "../config/connectDB";
import { ChatUser, Friendship, Block } from "../models/chat";

export async function getFriends(req: Request, res: Response) {
  await connectDB();
  const { userId } = req.params;

  const friendships = await Friendship.find({
    $or: [
      { requester: userId, status: "accepted" },
      { recipient: userId, status: "accepted" },
    ],
  })
    .populate("requester", "name email avatar preferredLanguage")
    .populate("recipient", "name email avatar preferredLanguage")
    .lean();

  const friends = friendships.map(friendship => {
    const friend = friendship.requester._id.toString() === userId
      ? friendship.recipient
      : friendship.requester;
    return {
      ...friend,
      friendshipId: friendship._id,
    };
  });

  res.json({ success: true, data: friends });
}

export async function getPendingRequests(req: Request, res: Response) {
  await connectDB();
  const { userId } = req.params;

  const requests = await Friendship.find({
    recipient: userId,
    status: "pending",
  })
    .populate("requester", "name email avatar preferredLanguage")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: requests });
}

export async function sendFriendRequest(req: Request, res: Response) {
  await connectDB();
  const { requesterId, recipientId } = req.body;

  if (!requesterId || !recipientId) {
    res.status(400).json({ success: false, error: "requesterId and recipientId are required" });
    return;
  }

  if (requesterId === recipientId) {
    res.status(400).json({ success: false, error: "Cannot send friend request to yourself" });
    return;
  }

  const recipient = await ChatUser.findById(recipientId);
  if (!recipient) {
    res.status(404).json({ success: false, error: "Recipient not found" });
    return;
  }

  const existingFriendship = await Friendship.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId },
    ],
  });

  if (existingFriendship) {
    if (existingFriendship.status === "accepted") {
      res.status(400).json({ success: false, error: "Already friends" });
      return;
    } else if (existingFriendship.status === "pending") {
      res.status(400).json({ success: false, error: "Friend request already pending" });
      return;
    }
  }

  const block = await Block.findOne({
    $or: [
      { blocker: requesterId, blocked: recipientId },
      { blocker: recipientId, blocked: requesterId },
    ],
  });

  if (block) {
    res.status(403).json({ success: false, error: "Cannot send friend request to blocked user" });
    return;
  }

  const friendship = await Friendship.create({
    requester: requesterId,
    recipient: recipientId,
    status: "pending",
  });

  const populatedFriendship = await Friendship.findById(friendship._id)
    .populate("requester", "name email avatar")
    .populate("recipient", "name email avatar");

  res.status(201).json({ success: true, data: populatedFriendship });
}

export async function acceptFriendRequest(req: Request, res: Response) {
  await connectDB();
  const { friendshipId } = req.params;

  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    res.status(404).json({ success: false, error: "Friend request not found" });
    return;
  }

  if (friendship.status !== "pending") {
    res.status(400).json({ success: false, error: "Friend request is not pending" });
    return;
  }

  friendship.status = "accepted";
  await friendship.save();

  const populatedFriendship = await Friendship.findById(friendship._id)
    .populate("requester", "name email avatar preferredLanguage")
    .populate("recipient", "name email avatar preferredLanguage");

  res.json({ success: true, data: populatedFriendship });
}

export async function rejectFriendRequest(req: Request, res: Response) {
  await connectDB();
  const { friendshipId } = req.params;

  const friendship = await Friendship.findById(friendshipId);
  if (!friendship) {
    res.status(404).json({ success: false, error: "Friend request not found" });
    return;
  }

  if (friendship.status !== "pending") {
    res.status(400).json({ success: false, error: "Friend request is not pending" });
    return;
  }

  friendship.status = "rejected";
  await friendship.save();

  res.json({ success: true, message: "Friend request rejected" });
}

export async function removeFriend(req: Request, res: Response) {
  await connectDB();
  const { friendshipId } = req.params;

  const friendship = await Friendship.findByIdAndDelete(friendshipId);
  if (!friendship) {
    res.status(404).json({ success: false, error: "Friendship not found" });
    return;
  }

  res.json({ success: true, message: "Friend removed" });
}

export async function blockUser(req: Request, res: Response) {
  await connectDB();
  const { blockerId, blockedId } = req.body;

  if (!blockerId || !blockedId) {
    res.status(400).json({ success: false, error: "blockerId and blockedId are required" });
    return;
  }

  if (blockerId === blockedId) {
    res.status(400).json({ success: false, error: "Cannot block yourself" });
    return;
  }

  const existingBlock = await Block.findOne({
    blocker: blockerId,
    blocked: blockedId,
  });

  if (existingBlock) {
    res.status(400).json({ success: false, error: "User already blocked" });
    return;
  }

  await Friendship.deleteMany({
    $or: [
      { requester: blockerId, recipient: blockedId },
      { requester: blockedId, recipient: blockerId },
    ],
  });

  const block = await Block.create({
    blocker: blockerId,
    blocked: blockedId,
  });

  res.status(201).json({ success: true, data: block });
}

export async function unblockUser(req: Request, res: Response) {
  await connectDB();
  const { blockId } = req.params;

  const block = await Block.findByIdAndDelete(blockId);
  if (!block) {
    res.status(404).json({ success: false, error: "Block not found" });
    return;
  }

  res.json({ success: true, message: "User unblocked" });
}

export async function getBlockedUsers(req: Request, res: Response) {
  await connectDB();
  const { userId } = req.params;

  const blocks = await Block.find({ blocker: userId })
    .populate("blocked", "name email avatar")
    .lean();

  res.json({ success: true, data: blocks });
}

export async function getFriendStatus(req: Request, res: Response) {
  await connectDB();
  const { userId1, userId2 } = req.params;

  const friendship = await Friendship.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
  });

  const block = await Block.findOne({
    $or: [
      { blocker: userId1, blocked: userId2 },
      { blocker: userId2, blocked: userId1 },
    ],
  });

  let status = "none";
  if (block) {
    status = "blocked";
  } else if (friendship) {
    if (friendship.status === "accepted") {
      status = "friends";
    } else if (friendship.status === "pending") {
      status = friendship.requester.toString() === userId1 ? "request_sent" : "request_received";
    } else if (friendship.status === "rejected") {
      status = "rejected";
    }
  }

  res.json({ 
    success: true, 
    data: { 
      status, 
      friendshipId: friendship?._id || null,
      blockId: block?._id || null,
    } 
  });
}

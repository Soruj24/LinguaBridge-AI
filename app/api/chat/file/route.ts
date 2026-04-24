import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { processMessage } from "@/lib/chat-service";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const chatId = formData.get("chatId") as string;
    const receiverId = formData.get("receiverId") as string;

    if (!file || !chatId || !receiverId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 10MB allowed." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split(".").pop();
    const fileName = `file-${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    await pipeline(
      Readable.from(buffer),
      fs.createWriteStream(filePath)
    );

    const fileUrl = `/uploads/${fileName}`;
    const isImage = file.type.startsWith("image/");

    const message = await processMessage({
      senderId: session.user.id,
      receiverId,
      text: file.name,
      chatId,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      isImage,
    });

    return NextResponse.json({
      ...JSON.parse(JSON.stringify(message)),
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
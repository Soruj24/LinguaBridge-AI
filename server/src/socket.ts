const { Server } = require("socket.io");
const axios = require("axios");
const User = require("./models/User");
import type { Server as SocketIOServer, Socket } from "socket.io"; // Added type import

let io: SocketIOServer;

// Interfaces for socket event payloads
interface JoinPayload {
    username: string;
    language: string;
}

interface SendMessagePayload {
    from: string;
    to: string;
    message: string;
}

interface ReceiveMessagePayload {
    from: string;
    message: string;
}

interface UserJoinedPayload {
    username: string;
}

// Interface for the User model document structure
interface UserDocument {
    username: string;
    language: string;
    socketId: string | null;
    // Add other fields from your Mongoose User model if necessary, e.g.:
    // _id: any; // If using Mongoose, this would typically be `mongoose.Types.ObjectId`
    // __v: number;
}

function initSocket(server: any) {
    io = new Server(server, {
        cors: { origin: "*" }
    });

    const translationCache: Record<string, string> = {}; // prevent duplicate translation

    io.on("connection", (socket: Socket) => { // Type 'socket'
        console.log("🟢 User connected:", socket.id);

        socket.on("join", async ({ username, language }: JoinPayload) => { // Type payload
            await User.findOneAndUpdate(
                { username },
                { username, language, socketId: socket.id },
                { upsert: true, new: true }
            );

            socket.broadcast.emit("user-joined", { username } as UserJoinedPayload); // Type payload
        });

        socket.on("send-message", async ({ from, to, message }: SendMessagePayload) => { // Type payload
            // Fetch recipient language
            const recipient: UserDocument | null = await User.findOne({ username: to }); // Type 'recipient'
            if (!recipient) return;

            let translatedMessage: string = message; // Type 'translatedMessage'

            // Avoid duplicate translation for same message
            if (!translationCache[message + to]) {
                try {
                    const res = await axios.post(
                        "https://api.openai.com/v1/chat/completions",
                        {
                            model: "gpt-3.5-turbo",
                            messages: [
                                {
                                    role: "system",
                                    content: `Translate this text to ${recipient.language} without changing the meaning: "${message}"`
                                }
                            ],
                            max_tokens: 1000
                        },
                        { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
                    );

                    translatedMessage = res.data.choices[0].message.content;
                    translationCache[message + to] = translatedMessage;
                } catch (err: any) { // Type 'err'
                    console.log("Translation error:", err.message);
                }
            } else {
                translatedMessage = translationCache[message + to];
            }

            // Send message to recipient
            // Use non-null assertion `!` as socketId might be null if recipient disconnected,
            // but current logic implies it's expected to be present for an active recipient.
            io.to(recipient.socketId!).emit("receive-message", {
                from,
                message: translatedMessage
            } as ReceiveMessagePayload); // Type payload

            // Send message back to sender
            socket.emit("receive-message", {
                from,
                message
            } as ReceiveMessagePayload); // Type payload
        });

        socket.on("disconnect", async () => {
            console.log("🔴 User disconnected:", socket.id);
            await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
        });
    });
}

module.exports = { initSocket };

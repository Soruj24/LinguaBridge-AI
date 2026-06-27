import http from "http";
import { Server } from "socket.io";

import { connectDatabase } from "./config/db";
import app from "./app";
import { env } from "./shared/env";
import { logger } from "./shared/logger";
import { setupSocketHandlers } from "./socket/handlers";
import { setIO } from "./socket/ioInstance";
import { startScheduler } from "./services/messageScheduler";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [
      env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

setIO(io);
startScheduler(io);
setupSocketHandlers(io);

connectDatabase();
server.listen(env.PORT, () =>
  logger.info(`Server running on http://localhost:${env.PORT}`)
);

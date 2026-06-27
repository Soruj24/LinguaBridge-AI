// Socket module - consolidated handlers
// The main socket logic is now in handlers.ts
// This file is kept for backward compatibility

export { setupSocketHandlers } from "./handlers";
export { userManager } from "./utils/userManager";
export { getIO, setIO } from "./ioInstance";

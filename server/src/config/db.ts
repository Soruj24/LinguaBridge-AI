import mongoose from "mongoose";
import { mongoUri } from "../secret";
import dns from "node:dns/promises";

export const connectDatabase = async (): Promise<void> => {
  try {

dns.setServers(["1.1.1.1", "8.8.8.8"]);
      await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected `);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

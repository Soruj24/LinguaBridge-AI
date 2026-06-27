import { generateMockUsers } from "./users";

const generateMockData = async () => {
  try {
    console.log("🚀 Starting user seeding process...");
    const users = await generateMockUsers();
    console.log(`✅ Generated ${users.length} users`);
    return { users };
  } catch (error) {
    console.error("❌ User data generation failed:", error);
    throw error;
  }
};

export default generateMockData;

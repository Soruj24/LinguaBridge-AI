import { generateAdminUsers } from "./adminUsers";
import { generateRegularUsers } from "./userGenerator";

const generateMockData = async () => {
  try {
    console.log("🚀 Starting user seeding process...");

    const usedUsernames = new Set<string>();
    const usedEmails = new Set<string>();

    const adminUsers = await generateAdminUsers(usedUsernames, usedEmails);
    const regularUsers = await generateRegularUsers(usedUsernames, usedEmails, 47);
    const users = [...adminUsers, ...regularUsers];

    console.log(`✅ Generated ${users.length} users`);

    return { users };
  } catch (error) {
    console.error("❌ User data generation failed:", error);
    throw error;
  }
};

export default generateMockData;

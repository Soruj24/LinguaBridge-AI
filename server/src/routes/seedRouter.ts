import { Router } from "express";
import { seedUsers, getSeedStats } from "../controllers/seedController";
import { isLoggedIn, hasPermission } from "../middleware";
import { Permission } from "../models/User";

const seedRouter = Router();

// Only super admin or someone with USERS_DELETE permission can seed/reset data
seedRouter.use(isLoggedIn);
seedRouter.use(hasPermission(Permission.USERS_DELETE));

seedRouter.post("/users", seedUsers);

seedRouter.get("/stats", getSeedStats);

seedRouter.get("/", seedUsers); // or seedAllData depending on your needs

export default seedRouter;



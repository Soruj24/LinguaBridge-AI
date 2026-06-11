import { IUserDoc } from "../types/UserTypes";
import { IUser } from "../interfaces/IUser";
import User from "../schemas/User";

export async function createUser(userData: Partial<IUser>): Promise<IUserDoc> {
    const user = new User(userData);
    await user.validate();
    return user.save();
}

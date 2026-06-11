import User from "../schemas/User";
import { IUserDoc } from "../types/UserTypes";
import { ILoginHistory } from "../interfaces/IUser";

export async function authenticateUser(
    identifier: string,
    password: string,
    loginDetails: Partial<ILoginHistory>
): Promise<{ user: IUserDoc | null; success: boolean; message: string }> {
    try {
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        }).select('+password +loginAttempts +lockoutUntil');

        if (!user) {
            return { user: null, success: false, message: 'User not found' };
        }

        if (user.isAccountLocked()) {
            await user.addLoginHistory({ ...loginDetails, success: false, failureReason: 'Account locked' });
            return { user: null, success: false, message: 'Account is temporarily locked' };
        }

        if (!user.isAccountActive) {
            await user.addLoginHistory({ ...loginDetails, success: false, failureReason: 'Account inactive' });
            return { user: null, success: false, message: 'Account is not active' };
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            await user.addLoginHistory({ ...loginDetails, success: false, failureReason: 'Invalid password' });
            return { user: null, success: false, message: 'Invalid credentials' };
        }

        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        await user.addLoginHistory({ ...loginDetails, success: true });
        await user.updateLastSeen();

        return { user, success: true, message: 'Login successful' };
    } catch (error) {
        console.error('Authentication error:', error);
        return { user: null, success: false, message: 'Authentication failed' };
    }
}

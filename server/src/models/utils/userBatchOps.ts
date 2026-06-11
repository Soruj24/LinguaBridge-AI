import { Types } from "mongoose";
import { UserStatus } from "../interfaces/IUser";
import User from "../schemas/User";

export async function batchUserOperations(operations: Array<{
    userId: Types.ObjectId;
    operation: 'activate' | 'deactivate' | 'ban' | 'unban' | 'verify' | 'delete';
    reason?: string;
}>): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const op of operations) {
        try {
            const user = await User.findById(op.userId);
            if (!user) {
                errors.push(`User ${op.userId} not found`);
                failed++;
                continue;
            }

            switch (op.operation) {
                case 'activate':
                    user.status = UserStatus.ACTIVE;
                    user.isActive = true;
                    break;
                case 'deactivate':
                    user.status = UserStatus.INACTIVE;
                    user.isActive = false;
                    break;
                case 'ban':
                    user.isBanned = true;
                    user.status = UserStatus.SUSPENDED;
                    break;
                case 'unban':
                    user.isBanned = false;
                    user.status = UserStatus.ACTIVE;
                    break;
                case 'verify':
                    user.isVerified = true;
                    user.emailVerified = true;
                    break;
                case 'delete':
                    user.isDeleted = true;
                    user.status = UserStatus.DELETED;
                    break;
            }

            await user.addAuditLog(`BATCH_${op.operation.toUpperCase()}`, {
                reason: op.reason,
                batchOperation: true
            });

            await user.save();
            success++;
        } catch (error: any) {
            errors.push(`Failed to ${op.operation} user ${op.userId}: ${error.message}`);
            failed++;
        }
    }

    return { success, failed, errors };
}

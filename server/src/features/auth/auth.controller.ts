// Re-export from existing controller locations for backward compatibility
export {
  handleCreateUser,
  handleVerifyEmail,
  handleLogIn,
  handleLogOut,
  handleSocialLogin,
  handleRefreshToken,
  handleProtected,
  handleGetMe,
} from "../../controllers/authController";

export {
  handleChangedPassword,
  handleForgotPassword,
  handleResetPassword,
  handleSendVerificationEmail,
  handleResendVerificationEmail,
  handleDeleteAccount,
  handleDeactivateAccount,
  handleReactivateAccount,
  handleUpdateEmail,
  handleCheckUsernameAvailability,
  handleCheckEmailAvailability,
} from "../../controllers/accountController";

export {
  handleUpdateProfile,
  handleUploadAvatar,
  handleDeleteAvatar,
  handleGetUserPreferences,
  handleUpdateUserPreferences,
  handleGetAccountStatus,
} from "../../controllers/profileController";

export {
  handleSetupTwoFactor,
  handleVerifyTwoFactor,
  handleDisableTwoFactor,
  handleGenerateBackupCodes,
} from "../../controllers/twoFactorController";

export {
  handleGetSessions,
  handleRevokeSession,
  handleRevokeAllSessions,
} from "../../controllers/sessionController";

export {
  handleGetSecurityLogs,
  handleClearSecurityLogs,
} from "../../controllers/securityLogController";

export {
  handleGetAllUsers,
  handleGetUser,
  handleDeleteUser,
  handleUpdateUserRole,
  handleSendEmailToUser,
  handleUpdateUser,
  handleAdminCreateUser,
  handleAdminToggleTwoFactor,
  handleAdminRevokeAllSessions,
} from "../../controllers/adminUserController";

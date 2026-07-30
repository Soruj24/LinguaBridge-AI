"use client";

import { motion } from "framer-motion";
import { useSecurity } from "@/components/features/security/hooks/use-security";
import {
  SecurityStatusCard,
  SecurityActivityList,
  Security2FASection,
  SecurityChangePassword,
  SecurityDeleteAccount,
} from "@/components/features/security/components";

export default function SecurityPage() {
  const s = useSecurity();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <div className="grid gap-6">
        <SecurityStatusCard
          emailVerified={s.emailVerified}
          userEmail={s.userEmail}
          twoFactorEnabled={s.twoFactorEnabled}
          setShow2FASetup={s.setShow2FASetup}
          setCurrentPassword={s.setCurrentPassword}
          setVerificationCode={s.setVerificationCode}
        />

        <SecurityActivityList
          activities={s.loginActivities}
          loading={s.activitiesLoading}
          onLoadMore={s.fetchLoginActivity}
        />

        <Security2FASection
          show2FASetup={s.show2FASetup}
          twoFactorEnabled={s.twoFactorEnabled}
          twoFactorSetup={s.twoFactorSetup}
          verificationCode={s.verificationCode}
          setVerificationCode={s.setVerificationCode}
          recoveryCodes={s.recoveryCodes}
          showRecoveryCodes={s.showRecoveryCodes}
          setShowRecoveryCodes={s.setShowRecoveryCodes}
          setShow2FASetup={s.setShow2FASetup}
          setTwoFactorSetup={s.setTwoFactorSetup}
          currentPassword={s.currentPassword}
          setCurrentPassword={s.setCurrentPassword}
          showCurrentPassword={s.showCurrentPassword}
          setShowCurrentPassword={s.setShowCurrentPassword}
          isLoading={s.isLoading}
          handleSetup2FA={s.handleSetup2FA}
          handleVerify2FA={s.handleVerify2FA}
          handleDisable2FA={s.handleDisable2FA}
          copyRecoveryCodes={s.copyRecoveryCodes}
        />

        <SecurityChangePassword
          showChangePassword={s.showChangePassword}
          setShowChangePassword={s.setShowChangePassword}
          currentPassword={s.currentPassword}
          setCurrentPassword={s.setCurrentPassword}
          newPassword={s.newPassword}
          setNewPassword={s.setNewPassword}
          confirmPassword={s.confirmPassword}
          setConfirmPassword={s.setConfirmPassword}
          showCurrentPassword={s.showCurrentPassword}
          setShowCurrentPassword={s.setShowCurrentPassword}
          showNewPassword={s.showNewPassword}
          setShowNewPassword={s.setShowNewPassword}
          isLoading={s.isLoading}
          handleChangePassword={s.handleChangePassword}
        />

        <SecurityDeleteAccount
          showDeleteConfirm={s.showDeleteConfirm}
          setShowDeleteConfirm={s.setShowDeleteConfirm}
          deletePassword={s.deletePassword}
          setDeletePassword={s.setDeletePassword}
          deleteConfirmText={s.deleteConfirmText}
          setDeleteConfirmText={s.setDeleteConfirmText}
          isLoading={s.isLoading}
          handleDeleteAccount={s.handleDeleteAccount}
        />
      </div>
    </motion.div>
  );
}

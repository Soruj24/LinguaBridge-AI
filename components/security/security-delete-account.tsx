"use client";

import { motion } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SecurityDeleteAccountProps {
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  deletePassword: string;
  setDeletePassword: (v: string) => void;
  deleteConfirmText: string;
  setDeleteConfirmText: (v: string) => void;
  isLoading: boolean;
  handleDeleteAccount: () => Promise<void>;
}

export function SecurityDeleteAccount({
  showDeleteConfirm, setShowDeleteConfirm,
  deletePassword, setDeletePassword,
  deleteConfirmText, setDeleteConfirmText,
  isLoading, handleDeleteAccount,
}: SecurityDeleteAccountProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showDeleteConfirm ? (
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-medium mb-2">
                Warning: This action cannot be undone!
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>{"\u2022"} All your messages will be permanently deleted</li>
                <li>{"\u2022"} All your chats will be removed</li>
                <li>{"\u2022"} Your profile data will be erased</li>
                <li>{"\u2022"} You will lose access to your account immediately</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-delete-password">Enter your password</Label>
              <Input
                id="security-delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Confirm with your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-delete-confirm">Type DELETE to confirm</Label>
              <Input
                id="security-delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading || deleteConfirmText !== "DELETE" || !deletePassword}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Forever
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowDeleteConfirm(false);
                setDeletePassword("");
                setDeleteConfirmText("");
              }}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

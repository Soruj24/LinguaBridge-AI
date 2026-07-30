"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ban, Loader2 } from "lucide-react";

interface BlockConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export function BlockConfirmDialog({
  open,
  onOpenChange,
  username,
  onConfirm,
  isLoading,
}: BlockConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Block @{username}
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-2">
            <p>
              Are you sure you want to block <strong>{username}</strong>?
            </p>
            <p className="text-destructive font-medium">
              This will also unfriend them and remove any pending friend
              requests. You will not be able to send messages to each other.
            </p>
            <p>You can unblock them later from their profile.</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

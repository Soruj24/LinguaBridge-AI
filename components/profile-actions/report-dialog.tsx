"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2 } from "lucide-react";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fake_account", label: "Fake account" },
  { value: "other", label: "Other" },
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  onSubmit: (reason: string, description: string) => Promise<void>;
  isLoading: boolean;
}

export function ReportDialog({
  open,
  onOpenChange,
  username,
  onSubmit,
  isLoading,
}: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!reason) return;
    await onSubmit(reason, description);
    setReason("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-500" />
            Report @{username}
          </DialogTitle>
          <DialogDescription>
            Your report is anonymous. The reported user will not know who filed
            it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              placeholder="Provide additional details..."
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setDescription(e.target.value);
                }
              }}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/1000
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={isLoading || !reason}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Flag className="h-4 w-4" />
            )}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

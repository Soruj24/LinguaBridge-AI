"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface ContactExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactExportDialog({
  open,
  onOpenChange,
}: ContactExportDialogProps) {
  const handleExport = async (format: "json" | "csv") => {
    try {
      const res = await api.get(`/api/friends/export?format=${format}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Contacts exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Failed to export contacts");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Contacts</DialogTitle>
          <DialogDescription>
            Export your friends list to a file.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 py-4">
          <Button
            variant="outline"
            onClick={() => handleExport("json")}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

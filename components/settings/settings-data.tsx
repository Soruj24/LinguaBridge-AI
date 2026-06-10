"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SettingsData() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to export data");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lingualbridge-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-card to-card/50 border">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Download className="h-4 w-4" />
        <span>Your Data</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Download a copy of your data
      </p>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
      >
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isExporting ? "Generating export..." : "Download my data"}
      </Button>
    </div>
  );
}

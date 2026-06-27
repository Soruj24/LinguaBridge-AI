"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, X } from "lucide-react";
import api from "@/lib/api";
import { isAxiosError } from "axios";
import { toast } from "sonner";

interface ContactImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
}

export function ContactImportDialog({
  open,
  onOpenChange,
}: ContactImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setImporting(false);
    setResult(null);
  };

  const parseCSV = (text: string): PreviewData => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return { headers: [], rows: [] };
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    return {
      headers: parseLine(lines[0]),
      rows: lines.slice(1).map(parseLine),
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setPreview(parseCSV(text));
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.name.endsWith(".csv")) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setPreview(parseCSV(text));
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/friends/import", formData);
      setResult(res.data);
      toast.success(`Imported ${res.data.imported} contacts`);
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to import contacts";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

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

  const emailColumnIndex =
    preview?.headers.findIndex((h) => h.toLowerCase() === "email") ?? -1;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import/Export Contacts</DialogTitle>
          <DialogDescription>
            Import contacts from a CSV file or export your friends list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              activeTab === "import"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Upload className="inline mr-1.5 h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`px-4 py-1.5 text-sm rounded-md ${
              activeTab === "export"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Download className="inline mr-1.5 h-4 w-4" />
            Export
          </button>
        </div>

        {activeTab === "import" ? (
          <div className="space-y-4">
            {!preview ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drop a CSV file here or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Found {preview.rows.length} contacts
                </div>

                <div className="max-h-40 overflow-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        {preview.headers.map((h, i) => (
                          <th key={i} className="text-left p-2 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t">
                          {row.map((cell, j) => (
                            <td key={j} className="p-2 truncate max-w-32">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {emailColumnIndex === -1 && (
                  <p className="text-xs text-destructive">
                    CSV must contain an &quot;email&quot; column
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importing || emailColumnIndex === -1}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {importing ? "Importing..." : "Import"}
                  </Button>
                </div>

                {result && (
                  <div className="text-sm space-y-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-green-600">
                      Successfully imported {result.imported} contacts.
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-muted-foreground">
                        Skipped {result.skipped} (already friends or no matching
                        user).
                      </p>
                    )}
                    {result.errors.length > 0 && (
                      <div>
                        <p className="text-destructive">
                          {result.errors.length} errors:
                        </p>
                        <ul className="list-disc list-inside text-xs text-destructive">
                          {result.errors.slice(0, 3).map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Export your friends list to a file.
            </p>
            <div className="flex gap-3">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";

interface ChatFilePreviewProps {
  selectedFile: File | null;
  isUploading: boolean;
  onFileRemove: () => void;
  onFileSend: () => void;
}

export function ChatFilePreview({ selectedFile, isUploading, onFileRemove, onFileSend }: ChatFilePreviewProps) {
  if (!selectedFile) return null;

  return (
    <div className="px-3 md:px-5 py-2">
      <FilePreview file={selectedFile} onRemove={onFileRemove} />
      <div className="flex justify-end mt-2">
        <Button size="sm" onClick={onFileSend} disabled={isUploading} className="h-8 text-xs gap-1.5">
          {isUploading ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
          ) : (
            <><Send className="h-3.5 w-3.5" /> Send File</>
          )}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { File, Image, Download, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  className?: string;
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isImage = file.type.startsWith("image/");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePreview = () => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/30",
          className
        )}
      >
        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
          {isImage ? (
            <Image className="h-5 w-5 text-primary" />
          ) : (
            <File className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isImage && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handlePreview}
          >
            <Image className="h-4 w-4" />
          </Button>
        )}
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewUrl(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-10 w-10"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={previewUrl}
            alt={file.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

interface FileBubbleProps {
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  isImage?: boolean;
  fileName?: string;
}

export function FileBubble({
  fileUrl,
  fileType,
  fileSize,
  isImage,
  fileName,
}: FileBubbleProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isImage) {
    return (
      <div className="relative group">
        <img
          src={fileUrl}
          alt={fileName || "Image"}
          className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-background rounded-full"
          >
            <Download className="h-5 w-5" />
          </a>
        </div>
      </div>
    );
  }

  const ext = fileName?.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <a
      href={fileUrl}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border hover:bg-muted/80 transition-colors max-w-[250px]"
    >
      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
        <File className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fileName || "File"}</p>
        <p className="text-xs text-muted-foreground">
          {ext} - {formatFileSize(fileSize)}
        </p>
      </div>
      <Download className="h-4 w-4 text-muted-foreground shrink-0" />
    </a>
  );
}
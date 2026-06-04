"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";

interface ChatFilePreviewProps {
  selectedFile: File | null;
  isUploading: boolean;
  onFileRemove: () => void;
  onFileSend: () => void;
}

export function ChatFilePreview({ selectedFile, isUploading, onFileRemove, onFileSend }: ChatFilePreviewProps) {
  return (
    <AnimatePresence>
      {selectedFile && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden px-3 md:px-5"
        >
          <div className="py-2">
            <FilePreview file={selectedFile} onRemove={onFileRemove} />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={onFileSend} disabled={isUploading} className="h-8 rounded-lg text-xs gap-1.5 bg-primary hover:bg-primary/90">
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send File
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

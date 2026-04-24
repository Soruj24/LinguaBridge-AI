"use client";

import { useState } from "react";
import {
  Mic,
  Image,
  Languages,
  Sparkles,
  X,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface RadialMenuProps {
  onVoiceRecord: () => void;
  onImageUpload: () => void;
  onQuickTranslate: () => void;
  onAIAssist: () => void;
}

export function RadialMenu({
  onVoiceRecord,
  onImageUpload,
  onQuickTranslate,
  onAIAssist,
}: RadialMenuProps) {
  const t = useTranslations("Chat");
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Mic, label: t("voiceRecord"), action: onVoiceRecord, color: "bg-rose-500" },
    { icon: Image, label: t("imageUpload"), action: onImageUpload, color: "bg-blue-500" },
    { icon: Languages, label: t("quickTranslate"), action: onQuickTranslate, color: "bg-violet-500" },
    { icon: Sparkles, label: t("aiAssist"), action: onAIAssist, color: "bg-amber-500" },
  ];

  return (
    <div className="fixed right-4 bottom-24 z-40 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-14 right-0 flex flex-col gap-2"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="bg-background px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap">
                  {item.label}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-lg/30`}
                >
                  <item.icon className="h-5 w-5" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-xl shadow-primary/30 flex items-center justify-center"
      >
        <motion.animate
          initial={false}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Wand2 className="h-6 w-6" />
          )}
        </motion.animate>
      </motion.button>
    </div>
  );
}
import {  Lock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function TrustBanner() {
  const t = useTranslations('Chat');
  
  return (
    <div className="w-full bg-gradient-to-r from-emerald-50/30 to-primary/5 dark:from-emerald-950/10 dark:to-primary/5 border-b border-emerald-100/50 dark:border-emerald-900/20 py-2 px-4 flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <ShieldCheck className="h-3.5 w-3.5" />
      <span>{t('trustBanner')}</span>
    </div>
  );
}

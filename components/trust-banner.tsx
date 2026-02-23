import { ShieldCheck, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

export function TrustBanner() {
  const t = useTranslations('Chat');
  
  return (
    <div className="w-full bg-emerald-50/50 dark:bg-emerald-950/10 border-b border-emerald-100 dark:border-emerald-900/20 py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <Lock className="h-3 w-3" />
      <span>{t('trustBanner')}</span>
    </div>
  );
}

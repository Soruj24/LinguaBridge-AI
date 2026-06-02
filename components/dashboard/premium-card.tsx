"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Crown, HeadphonesIcon, Check, ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, labelKey: "unlimitedText" },
  { icon: Zap, labelKey: "highQualityVoice" },
  { icon: HeadphonesIcon, labelKey: "prioritySupport" },
];

export function PremiumCard() {
  const t = useTranslations("Dashboard");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white border-0 shadow-2xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1.5s" }} />
          <svg className="absolute top-6 right-8 w-8 h-8 text-white/10 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <svg className="absolute bottom-16 left-6 w-5 h-5 text-white/10 animate-pulse" style={{ animationDelay: "1s" }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        <CardHeader className="relative pt-6">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-yellow-200" />
            <CardTitle className="text-xl font-bold">{t("premiumPlan")}</CardTitle>
          </div>
          <CardDescription className="text-orange-100/90 text-sm leading-relaxed">
            {t("unlockUnlimited")}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">$19</span>
            <span className="text-sm text-orange-100/80">/month</span>
          </div>
          <ul className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.li
                  key={feature.labelKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{t(feature.labelKey)}</span>
                </motion.li>
              );
            })}
          </ul>
        </CardContent>

        <CardFooter className="relative pb-6">
          <Button
            asChild
            className="w-full font-semibold bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 shadow-lg hover:shadow-xl transition-all group"
          >
            <Link href="/subscription">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("upgradeNow")}
              <ArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

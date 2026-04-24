"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Crown, HeadphonesIcon } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const features = [
  { icon: Zap, labelKey: "unlimitedText", color: "bg-yellow-400" },
  { icon: Zap, labelKey: "highQualityVoice", color: "bg-yellow-400" },
  { icon: HeadphonesIcon, labelKey: "prioritySupport", color: "bg-yellow-400" },
];

export function PremiumCard() {
  const t = useTranslations("Dashboard");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="h-full relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white border-0 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
          
          {/* Floating sparkles */}
          <svg className="absolute top-4 right-8 w-6 h-6 text-white/20 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <svg className="absolute bottom-12 left-4 w-4 h-4 text-white/20 animate-pulse delay-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        <CardHeader className="relative pt-6">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-yellow-200" />
            <CardTitle className="text-xl font-bold">{t("premiumPlan")}</CardTitle>
          </div>
          <CardDescription className="text-orange-100 text-sm">
            {t("unlockUnlimited")}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
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
                    <Icon className="h-3.5 w-3.5 text-white" />
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
            className="w-full font-semibold bg-white text-orange-600 hover:bg-yellow-50 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/subscription">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("upgradeNow")}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
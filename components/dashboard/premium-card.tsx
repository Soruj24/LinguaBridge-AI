"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown, Check } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

const features = ["unlimitedText", "highQualityVoice", "prioritySupport"] as const;

export function PremiumCard() {
  const t = useTranslations("Dashboard");

  return (
    <Card className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-200" />
          <CardTitle className="text-lg font-bold">{t("premiumPlan")}</CardTitle>
        </div>
        <CardDescription className="text-orange-100 text-sm">
          {t("unlockUnlimited")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">$19</span>
          <span className="text-sm text-orange-100">/month</span>
        </div>
        <ul className="space-y-2">
          {features.map((key) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0" />
              {t(key)}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-white text-orange-600 hover:bg-orange-50">
          <Link href="/subscription">
            <Sparkles className="h-4 w-4 mr-2" />
            {t("upgradeNow")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

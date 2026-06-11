"use client";

import { Link } from "@/navigation";
import { Globe, Heart } from "lucide-react";
import { useTranslations } from "next-intl";

export function FooterSection() {
  const t = useTranslations("Landing");

  return (
    <footer className="relative border-t bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">LinguaBridge <span className="text-primary">AI</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{t("footer.description")}</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{t("footer.product")}</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("header.features")}</Link></li>
              <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("header.pricing")}</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("header.login")}</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{t("footer.company")}</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("header.testimonials")}</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">{t("footer.legal")}</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t("footer.terms")}</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{t("footer.privacy")}</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LinguaBridge AI. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 fill-red-500 text-red-500 mx-0.5" /> for global communication
          </div>
        </div>
      </div>
    </footer>
  );
}

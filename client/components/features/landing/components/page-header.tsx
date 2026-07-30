"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils";

interface PageHeaderProps {
  scrolled: boolean;
}

export function PageHeader({ scrolled }: PageHeaderProps) {
  const t = useTranslations("Landing");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl flex h-16 items-center px-4 lg:px-8">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">LinguaBridge <span className="text-primary">AI</span></span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {[
            { href: "#features", label: t("header.features") },
            { href: "#pricing", label: t("header.pricing") },
            { href: "#testimonials", label: t("header.testimonials") },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden sm:inline-flex px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm">
              {t("header.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-sm font-semibold shadow-sm shadow-primary/20">
              {t("header.getStarted")}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

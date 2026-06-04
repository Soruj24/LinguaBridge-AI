"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
        <Link className="flex items-center gap-2 group" href="/">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            LinguaBridge AI
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          {[
            { href: "#features", label: t("header.features") },
            { href: "#testimonials", label: t("header.testimonials") },
            { href: "#pricing", label: t("header.pricing") },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                {t("header.login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-medium bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                {t("header.getStarted")}
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

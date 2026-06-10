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
        scrolled ? "bg-background border-b" : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl flex h-14 items-center px-4 lg:px-8">
        <Link className="flex items-center gap-2" href="/">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-base">LinguaBridge AI</span>
        </Link>

        <nav className="ml-auto flex items-center gap-2">
          {[
            { href: "#features", label: t("header.features") },
            { href: "#pricing", label: t("header.pricing") },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm">
              {t("header.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="text-sm">
              {t("header.getStarted")}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

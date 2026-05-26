"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X, CalendarHeart, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

const NAV = [
  { key: "home", href: "/" },
  { key: "treatments", href: "/treatments" },
  { key: "team", href: "/team" },
  { key: "clinics", href: "/clinics" },
  { key: "shop", href: "/shop" },
] as const;

export function MobileNav() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-cream-50 animate-fade-in">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-5 py-6">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-lg text-ink transition-colors hover:bg-cream-200"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 border-t border-line px-5 py-5">
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gold text-sm font-medium text-white"
            >
              <CalendarHeart className="h-4 w-4" />
              {t("book")}
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-medium text-ink"
            >
              <UserRound className="h-4 w-4" />
              {t("account")}
            </Link>
            <div className="flex justify-center pt-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

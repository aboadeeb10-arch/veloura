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
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-fade-in"
          />
          <div className="absolute inset-y-0 end-0 flex w-[86vw] max-w-[360px] flex-col bg-white border-s border-line shadow-[0_0_60px_-10px_rgba(46,42,36,0.45)] animate-fade-in">
            <div className="flex items-center justify-between border-b border-line bg-cream-50 px-5 py-4">
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

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto bg-white px-5 py-6">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-lg text-ink transition-colors hover:bg-cream-100"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="space-y-3 border-t border-line bg-cream-50 px-5 py-5">
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-gold text-sm font-medium text-white transition-colors hover:bg-gold-dark"
              >
                <CalendarHeart className="h-4 w-4" />
                {t("book")}
              </Link>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-medium text-ink transition-colors hover:bg-cream-100"
              >
                <UserRound className="h-4 w-4" />
                {t("account")}
              </Link>
              <div className="flex justify-center pt-1">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

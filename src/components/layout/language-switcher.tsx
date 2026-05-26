"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ tone = "ink" }: { tone?: "ink" | "light" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function change(next: string) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
          tone === "light"
            ? "text-white hover:bg-white/10"
            : "text-ink hover:bg-cream-100",
          isPending && "opacity-60",
        )}
      >
        <Globe className="h-4 w-4" />
        <span>{localeNames[locale as keyof typeof localeNames]}</span>
      </button>

      {open && (
        <div className="absolute end-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lift">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => change(l)}
              dir={l === "he" || l === "ar" ? "rtl" : "ltr"}
              className={cn(
                "flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-cream-100",
                l === locale ? "text-gold-dark" : "text-ink",
              )}
            >
              <span>{localeNames[l]}</span>
              {l === locale && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

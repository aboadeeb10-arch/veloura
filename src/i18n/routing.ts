import { defineRouting } from "next-intl/routing";

/** Supported locales. Hebrew is the default. */
export const locales = ["he", "ar", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "he";

/** Locales that render right-to-left. */
export const rtlLocales: readonly Locale[] = ["he", "ar"];

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export function dirFor(locale: string): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}

/** Native display names for the language switcher. */
export const localeNames: Record<Locale, string> = {
  he: "עברית",
  ar: "العربية",
  ru: "Русский",
  en: "English",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});

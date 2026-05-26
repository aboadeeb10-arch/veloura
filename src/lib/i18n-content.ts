import type { Locale } from "@/i18n/routing";

/** Shape of translatable content stored as JSON in the database. */
export type Localized = Partial<Record<Locale, string>>;

/**
 * Resolve a localized JSON value to a display string for the active locale,
 * falling back gracefully (active → he → en → ar → ru → any).
 */
export function pick(value: unknown, locale: string): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of [locale, "he", "en", "ar", "ru"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v;
    }
    for (const v of Object.values(obj)) {
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return "";
}

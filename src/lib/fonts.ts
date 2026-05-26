import {
  Heebo,
  Noto_Sans,
  Noto_Sans_Arabic,
  Frank_Ruhl_Libre,
} from "next/font/google";

/** Body sans — Hebrew + Latin. */
export const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

/** Body sans — Latin + Cyrillic (Russian / English). */
export const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto",
  display: "swap",
});

/** Body sans — Arabic. */
export const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

/** Elegant serif for headings — Hebrew + Latin. */
export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700"],
  variable: "--font-frank",
  display: "swap",
});

/** Combined font variables to apply on <html>. The browser picks the
 *  first family in the CSS stack that has a glyph for each character,
 *  so all four scripts render correctly from a single stack. */
export const fontVariables = [
  heebo.variable,
  notoSans.variable,
  notoArabic.variable,
  frankRuhl.variable,
].join(" ");

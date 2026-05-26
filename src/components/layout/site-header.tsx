import { getTranslations } from "next-intl/server";
import { CalendarHeart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { CartButton } from "@/components/cart/cart-button";

const NAV = [
  { key: "home", href: "/" },
  { key: "treatments", href: "/treatments" },
  { key: "team", href: "/team" },
  { key: "clinics", href: "/clinics" },
  { key: "shop", href: "/shop" },
] as const;

export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const session = await auth().catch(() => null);
  const accountHref = session?.user
    ? session.user.role === "ADMIN" || session.user.role === "EDITOR"
      ? "/admin"
      : "/account"
    : "/sign-in";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream-50/90 backdrop-blur">
      <div className="container-wide flex h-16 items-center justify-between gap-4 sm:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-cream-200 hover:text-ink"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          <Link
            href={accountHref}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-cream-200 hover:text-ink lg:block"
          >
            {session?.user ? t("account") : t("signIn")}
          </Link>
          <Link
            href="/book"
            className="hidden h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-medium text-white transition-colors hover:bg-gold-dark lg:inline-flex"
          >
            <CalendarHeart className="h-4 w-4" />
            {t("book")}
          </Link>
          <CartButton />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

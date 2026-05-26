import { getLocale, getTranslations } from "next-intl/server";
import { Instagram, Facebook, Phone, MessageCircle, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";

const NAV = [
  { key: "treatments", href: "/treatments" },
  { key: "team", href: "/team" },
  { key: "clinics", href: "/clinics" },
  { key: "shop", href: "/shop" },
  { key: "book", href: "/book" },
] as const;

async function getFooterData() {
  try {
    const [settings, clinics] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.clinic.findMany({ orderBy: { city: "asc" } }),
    ]);
    return { settings, clinics };
  } catch {
    return { settings: null, clinics: [] };
  }
}

export async function SiteFooter() {
  const locale = await getLocale();
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const { settings, clinics } = await getFooterData();
  const phone = settings?.phone ?? "050-277-7515";
  const whatsapp = settings?.whatsappNumber ?? "972502777515";

  return (
    <footer className="border-t border-line bg-cream-100">
      <div className="container-wide grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl text-ink">Veloura</p>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">{t("tagline")}</p>
        </div>

        <nav className="flex flex-col gap-2.5">
          <p className="mb-1 text-sm font-semibold text-ink">
            {t("quickLinks")}
          </p>
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-ink-soft transition-colors hover:text-gold-dark"
            >
              {tn(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink">{t("clinics")}</p>
          {clinics.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm text-ink-soft">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                <span className="font-medium text-ink">
                  {pick(c.name, locale)}
                </span>
                <br />
                {pick(c.address, locale)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-ink">{t("contact")}</p>
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-gold-dark"
          >
            <Phone className="h-4 w-4 text-gold" />
            {phone}
          </a>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-gold-dark"
          >
            <MessageCircle className="h-4 w-4 text-gold" />
            WhatsApp
          </a>
          <div className="mt-1 flex gap-2">
            {settings?.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:text-gold-dark"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {settings?.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:text-gold-dark"
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-wide py-5 text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} Veloura. {t("rights")}.
        </div>
      </div>
    </footer>
  );
}

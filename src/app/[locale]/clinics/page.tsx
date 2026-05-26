import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { MapPin, Phone, Clock, ExternalLink, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { PageHero } from "@/components/ui/page-hero";

export const dynamic = "force-dynamic";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_OFFSET: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function weekdayLabel(key: string, locale: string) {
  // Jan 7 2024 is a Sunday — add the day offset for each weekday.
  const d = new Date(2024, 0, 7 + (DAY_OFFSET[key] ?? 0));
  return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
}

async function getClinics() {
  try {
    return await prisma.clinic.findMany({
      orderBy: { city: "asc" },
      include: {
        practitioners: {
          include: {
            practitioner: { select: { name: true, slug: true } },
          },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function ClinicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Clinics");

  const clinics = await getClinics();

  return (
    <main>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="container-wide section space-y-12">
        {clinics.map((c) => {
          const hours = (c.hours as Record<string, string> | null) ?? {};
          const address = pick(c.address, locale);
          const name = pick(c.name, locale);
          const mapHref =
            c.mapUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${name} ${address}`,
            )}`;

          return (
            <div
              key={c.id}
              className="overflow-hidden rounded-3xl border border-line bg-white shadow-card"
            >
              <div className="grid lg:grid-cols-2">
                <div className="relative aspect-[16/10] bg-cream-100 lg:aspect-auto lg:min-h-[380px]">
                  {c.photos[0] && (
                    <Image
                      src={c.photos[0]}
                      alt={name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  <h2 className="font-serif text-2xl text-ink">{name}</h2>
                  <p className="mt-3 flex items-start gap-2 text-sm text-ink-soft">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {address}
                  </p>
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/[^+\d]/g, "")}`}
                      className="mt-2 flex items-center gap-2 text-sm text-ink-soft hover:text-gold-dark"
                    >
                      <Phone className="h-4 w-4 text-gold" />
                      {c.phone}
                    </a>
                  )}

                  <div className="mt-5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Clock className="h-4 w-4 text-gold" />
                      {t("hours")}
                    </p>
                    <dl className="mt-2 divide-y divide-line rounded-xl border border-line">
                      {DAY_KEYS.map((d) => {
                        const v = hours[d];
                        const closed = !v || v === "closed";
                        return (
                          <div
                            key={d}
                            className="flex justify-between px-3 py-1.5 text-sm"
                          >
                            <dt className="text-ink-soft">
                              {weekdayLabel(d, locale)}
                            </dt>
                            <dd
                              className={
                                closed ? "text-ink-muted" : "text-ink"
                              }
                            >
                              {closed ? t("closed") : v}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>

                  {c.practitioners.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {c.practitioners.map((pc) => (
                        <Link
                          key={pc.id}
                          href={`/team/${pc.practitioner.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-cream-200"
                        >
                          <UserRound className="h-3.5 w-3.5 text-gold" />
                          {pc.practitioner.name}
                        </Link>
                      ))}
                    </div>
                  )}

                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-gold px-6 text-sm font-medium text-gold-dark transition-colors hover:bg-cream-100"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t("getDirections")}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

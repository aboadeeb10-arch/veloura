import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, CalendarHeart, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { num } from "@/lib/queries";
import {
  TreatmentCard,
  type TreatmentCardData,
} from "@/components/treatments/treatment-card";

export const dynamic = "force-dynamic";

async function getPractitioner(slug: string) {
  try {
    return await prisma.practitioner.findUnique({
      where: { slug },
      include: {
        services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        clinics: { include: { clinic: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function PractitionerPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Team");
  const tc = await getTranslations("Common");
  const tcat = await getTranslations("ServiceCategory");

  const p = await getPractitioner(slug);
  if (!p) notFound();

  const services = p.services.map<TreatmentCardData>((s) => ({
    slug: s.slug,
    name: pick(s.name, locale),
    categoryLabel: tcat(s.category),
    image: s.image,
    priceLabel: formatPrice(num(s.price), locale),
    durationLabel: `${s.durationMin} ${tc("minutes")}`,
    practitionerName: p.name,
  }));

  return (
    <main>
      <section className="bg-cream-100">
        <div className="container-wide grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-cream-200 shadow-soft">
            {p.photos[0] ? (
              <Image
                src={p.photos[0]}
                alt={p.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <UserRound className="h-20 w-20 text-gold/35" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl text-ink sm:text-4xl">{p.name}</h1>
            <p className="mt-2 text-lg text-gold-dark">
              {pick(p.title, locale)}
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-ink-soft">
              {pick(p.bio, locale)}
            </p>

            {p.clinics.length > 0 && (
              <div className="mt-5 flex flex-col gap-2">
                <p className="text-sm font-semibold text-ink">
                  {t("worksAt")}
                </p>
                {p.clinics.map((pc) => (
                  <span
                    key={pc.id}
                    className="inline-flex items-center gap-2 text-sm text-ink-soft"
                  >
                    <MapPin className="h-4 w-4 text-gold" />
                    {pick(pc.clinic.name, locale)}
                  </span>
                ))}
              </div>
            )}

            <Link
              href={{ pathname: "/book", query: { practitioner: p.slug } }}
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-8 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
            >
              <CalendarHeart className="h-4 w-4" />
              {tc("bookNow")}
            </Link>
          </div>
        </div>
      </section>

      {services.length > 0 && (
        <section className="container-wide section">
          <h2 className="mb-6 font-serif text-2xl text-ink">{t("services")}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((data) => (
              <TreatmentCard key={data.slug} data={data} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

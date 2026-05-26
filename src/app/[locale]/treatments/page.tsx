import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { num } from "@/lib/queries";
import { PageHero } from "@/components/ui/page-hero";
import {
  TreatmentCard,
  type TreatmentCardData,
} from "@/components/treatments/treatment-card";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER = [
  "AESTHETIC",
  "IV_DRIP",
  "MASSAGE",
  "COSMETIC",
  "CHINESE",
  "LASER",
];

async function getServices() {
  try {
    return await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { practitioner: { select: { name: true } } },
    });
  } catch {
    return [];
  }
}

export default async function TreatmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Treatments");
  const tc = await getTranslations("Common");
  const tcat = await getTranslations("ServiceCategory");

  const services = await getServices();

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: services
      .filter((s) => s.category === cat)
      .map<TreatmentCardData>((s) => ({
        slug: s.slug,
        name: pick(s.name, locale),
        categoryLabel: tcat(cat),
        image: s.image,
        priceLabel: formatPrice(num(s.price), locale),
        durationLabel: `${s.durationMin} ${tc("minutes")}`,
        practitionerName: s.practitioner.name,
      })),
  })).filter((g) => g.items.length > 0);

  return (
    <main>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="container-wide section space-y-14">
        {groups.length === 0 && (
          <p className="text-center text-ink-muted">{tc("loading")}</p>
        )}
        {groups.map((group) => (
          <div key={group.cat}>
            <h2 className="mb-6 font-serif text-2xl text-ink">
              {tcat(group.cat)}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((data) => (
                <TreatmentCard key={data.slug} data={data} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { UserRound, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { PageHero } from "@/components/ui/page-hero";

export const dynamic = "force-dynamic";

async function getTeam() {
  try {
    return await prisma.practitioner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { services: true } } },
    });
  } catch {
    return [];
  }
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Team");
  const team = await getTeam();

  return (
    <main>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="container-wide section grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((p) => (
          <Link
            key={p.id}
            href={`/team/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:shadow-lift"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
              {p.photos[0] ? (
                <Image
                  src={p.photos[0]}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UserRound className="h-14 w-14 text-gold/35" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-serif text-xl text-ink">{p.name}</h3>
              <p className="mt-1 text-sm text-gold-dark">
                {pick(p.title, locale)}
              </p>
              <p className="mt-3 text-sm text-ink-soft">
                {p._count.services} {t("services")}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                {t("viewProfile")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

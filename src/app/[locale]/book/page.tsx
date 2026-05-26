import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { num } from "@/lib/queries";
import { PageHero } from "@/components/ui/page-hero";
import {
  BookingFlow,
  type BookingService,
} from "@/components/booking/booking-flow";

export const dynamic = "force-dynamic";

async function getBookingServices() {
  try {
    return await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        practitioner: {
          include: { clinics: { include: { clinic: true } } },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { service: initialServiceSlug } = await searchParams;

  const t = await getTranslations("Booking");
  const tcat = await getTranslations("ServiceCategory");
  const session = await auth().catch(() => null);

  const raw = await getBookingServices();
  const services: BookingService[] = raw.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: pick(s.name, locale),
    categoryLabel: tcat(s.category),
    durationMin: s.durationMin,
    price: num(s.price),
    practitionerId: s.practitionerId,
    practitionerName: s.practitioner.name,
    clinics: s.practitioner.clinics.map((pc) => ({
      id: pc.clinic.id,
      name: pick(pc.clinic.name, locale),
    })),
  }));

  let firstVisitDiscount = false;
  if (session?.user?.id) {
    try {
      const u = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstSignupDiscountUsed: true },
      });
      firstVisitDiscount = !!u && !u.firstSignupDiscountUsed;
    } catch {
      firstVisitDiscount = false;
    }
  }

  return (
    <main>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="container-wide section">
        {services.length === 0 ? (
          <p className="text-center text-ink-muted">{t("noSlots")}</p>
        ) : (
          <BookingFlow
            services={services}
            isAuthed={Boolean(session?.user)}
            firstVisitDiscount={firstVisitDiscount}
            initialServiceSlug={initialServiceSlug}
          />
        )}
      </div>
    </main>
  );
}

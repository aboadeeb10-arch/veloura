import { setRequestLocale, getTranslations } from "next-intl/server";
import { CalendarHeart } from "lucide-react";
import { redirect, Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { PageHero } from "@/components/ui/page-hero";
import {
  BookingCard,
  type BookingCardData,
} from "@/components/account/booking-card";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect({ href: "/sign-in", locale });

  const t = await getTranslations("Account");
  const tb = await getTranslations("BookingStatus");

  const rows = await prisma.booking.findMany({
    where: { customerId: session.user.id },
    orderBy: { startsAt: "desc" },
    include: { service: true, clinic: true, practitioner: true },
  });

  const dtf = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const bookings: BookingCardData[] = rows.map((b) => ({
    id: b.id,
    serviceName: pick(b.service.name, locale),
    practitionerName: b.practitioner.name,
    clinicName: pick(b.clinic.name, locale),
    whenLabel: dtf.format(b.startsAt),
    statusKey: b.status,
    statusLabel: tb(b.status),
    priceLabel: formatPrice(Number(b.priceAtBooking), locale),
    canCancel:
      (b.status === "REQUESTED" || b.status === "APPROVED") &&
      new Date(b.startsAt).getTime() > Date.now() + 24 * 3600 * 1000,
  }));

  return (
    <main>
      <PageHero title={t("bookings")} />
      <div className="container-wide section">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="text-ink-muted">{t("noBookings")}</p>
            <Link
              href="/book"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 text-sm font-medium text-white hover:bg-gold-dark"
            >
              <CalendarHeart className="h-4 w-4" />
              {t("bookNow")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((b) => (
              <BookingCard key={b.id} data={b} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

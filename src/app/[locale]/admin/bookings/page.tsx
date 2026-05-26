import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/admin/booking-actions";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<
  string,
  "warning" | "success" | "neutral" | "sale"
> = {
  REQUESTED: "warning",
  APPROVED: "success",
  COMPLETED: "neutral",
  DECLINED: "sale",
  CANCELLED: "neutral",
};

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const tb = await getTranslations("BookingStatus");

  const session = await auth();
  let where = {};
  if (session?.user?.role === "EDITOR" && session.user.id) {
    const practitioner = await prisma.practitioner.findUnique({
      where: { userId: session.user.id },
    });
    where = { practitionerId: practitioner?.id ?? "__none__" };
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { customer: true, service: true, clinic: true, practitioner: true },
    take: 100,
  });

  const dtf = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl text-ink">{t("bookings")}</h1>

      {bookings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-muted">
          {t("noBookings")}
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {pick(b.service.name, locale)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {b.customer.name} ·{" "}
                    {b.customer.phone || b.customer.email}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {dtf.format(b.startsAt)} · {pick(b.clinic.name, locale)} ·{" "}
                    {b.practitioner.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={STATUS_VARIANT[b.status] ?? "neutral"}>
                    {tb(b.status)}
                  </Badge>
                  <span className="text-sm font-semibold text-gold-dark">
                    {formatPrice(Number(b.priceAtBooking), locale)}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <BookingActions bookingId={b.id} status={b.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

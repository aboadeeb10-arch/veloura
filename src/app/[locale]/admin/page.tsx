import { setRequestLocale, getTranslations } from "next-intl/server";
import { CalendarClock, CalendarCheck, ShoppingBag, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const session = await auth();
  const role = session?.user?.role;

  let practitionerId: string | null = null;
  if (role === "EDITOR" && session?.user?.id) {
    const p = await prisma.practitioner.findUnique({
      where: { userId: session.user.id },
    });
    practitionerId = p?.id ?? null;
  }
  const bookingScope = practitionerId ? { practitionerId } : {};

  const [pending, upcoming, newOrders, products] = await Promise.all([
    prisma.booking.count({ where: { status: "REQUESTED", ...bookingScope } }),
    prisma.booking.count({
      where: { status: "APPROVED", startsAt: { gte: new Date() }, ...bookingScope },
    }),
    role === "ADMIN"
      ? prisma.order.count({ where: { status: "NEW" } })
      : Promise.resolve(0),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  const cards = [
    { label: t("pendingBookings"), value: pending, Icon: CalendarClock },
    { label: t("upcomingBookings"), value: upcoming, Icon: CalendarCheck },
    ...(role === "ADMIN"
      ? [{ label: t("newOrders"), value: newOrders, Icon: ShoppingBag }]
      : []),
    { label: t("totalProducts"), value: products, Icon: Package },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl text-ink">{t("dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-white p-5 shadow-card"
          >
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
            <p className="text-sm text-ink-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

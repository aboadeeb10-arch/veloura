import { setRequestLocale, getTranslations } from "next-intl/server";
import { Sparkles, Gift, CalendarHeart } from "lucide-react";
import { redirect, Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice, cn } from "@/lib/utils";
import {
  BookingCard,
  type BookingCardData,
} from "@/components/account/booking-card";
import { SignOutButton } from "@/components/account/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect({ href: "/sign-in", locale });
  if (session.user.role === "ADMIN" || session.user.role === "EDITOR") {
    redirect({ href: "/admin", locale });
  }

  const t = await getTranslations("Account");
  const tb = await getTranslations("BookingStatus");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      rewardAccount: {
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 6 },
        },
      },
      bookings: {
        orderBy: { startsAt: "desc" },
        take: 4,
        include: { service: true, clinic: true, practitioner: true },
      },
    },
  });
  if (!user) redirect({ href: "/sign-in", locale });

  const points = user.rewardAccount?.pointsBalance ?? 0;
  const worth = Math.floor(points / 100) * 10;
  const dtf = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const bookings: BookingCardData[] = user.bookings.map((b) => ({
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
    <main className="bg-cream-50">
      <div className="container-wide section">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl text-ink sm:text-3xl">
            {t("greeting", { name: user.name })}
          </h1>
          <SignOutButton />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-gold" />
              {t("rewards")}
            </p>
            <p className="mt-3 text-3xl font-semibold text-gold-dark">
              {points}
            </p>
            <p className="text-sm text-ink-muted">{t("pointsBalance")}</p>
            <p className="mt-2 text-sm text-ink-soft">
              {t("pointsWorth")}: {formatPrice(worth, locale)}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Gift className="h-4 w-4 text-gold" />
              {t("firstDiscount")}
            </p>
            <p
              className={cn(
                "mt-3 text-sm",
                user.firstSignupDiscountUsed
                  ? "text-ink-muted"
                  : "text-emerald-600",
              )}
            >
              {user.firstSignupDiscountUsed
                ? t("firstDiscountUsed")
                : t("firstDiscountActive")}
            </p>
          </div>
        </div>

        {user.rewardAccount &&
          user.rewardAccount.transactions.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-serif text-xl text-ink">
                {t("pointsHistory")}
              </h2>
              <div className="divide-y divide-line rounded-2xl border border-line bg-white">
                {user.rewardAccount.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <span className="text-ink-soft">
                      {tx.description || tx.type}
                    </span>
                    <span
                      className={
                        tx.points >= 0 ? "text-emerald-600" : "text-rose-600"
                      }
                    >
                      {tx.points >= 0 ? "+" : ""}
                      {tx.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink">
              {t("recentBookings")}
            </h2>
            {bookings.length > 0 && (
              <Link
                href="/account/bookings"
                className="text-sm text-gold-dark hover:underline"
              >
                {t("viewAll")}
              </Link>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
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
            <div className="grid gap-4 sm:grid-cols-2">
              {bookings.map((b) => (
                <BookingCard key={b.id} data={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

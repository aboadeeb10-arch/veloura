import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderStatusActions } from "@/components/admin/order-status-actions";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<
  string,
  "warning" | "success" | "neutral" | "sale"
> = {
  NEW: "warning",
  DONE: "success",
  CANCELLED: "neutral",
  REFUNDED: "sale",
};

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const ts = await getTranslations("OrderStatus");

  // Orders are admin-only.
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, pickupClinic: true, customer: true },
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
      <h1 className="mb-6 text-2xl text-ink">{t("orders")}</h1>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-muted">
          {t("noOrders")}
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-line bg-white p-4 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {t("orderRef")} #{o.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {o.customer?.name ?? o.guestName} ·{" "}
                      {o.customer?.phone ?? o.guestPhone ?? o.guestEmail}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {dtf.format(o.createdAt)} · {itemCount} {t("items")} ·{" "}
                      {pick(o.pickupClinic.name, locale)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={STATUS_VARIANT[o.status] ?? "neutral"}>
                      {ts(o.status)}
                    </Badge>
                    <span className="text-sm font-semibold text-gold-dark">
                      {formatPrice(Number(o.total), locale)}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <OrderStatusActions orderId={o.id} status={o.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ShoppingBag, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { placeOrderAction, checkPromoAction } from "@/actions/order";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CheckoutClinic = { id: string; name: string };

export function CheckoutForm({
  clinics,
  user,
  pointsBalance,
  pointsPerUnit,
  pointsUnitValue,
}: {
  clinics: CheckoutClinic[];
  user: { name: string; email: string; phone: string } | null;
  pointsBalance: number;
  pointsPerUnit: number;
  pointsUnitValue: number;
}) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const { items, subtotal, clear, ready } = useCart();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{
    code: string;
    kind: string;
    value: number;
  } | null>(null);
  const [promoError, setPromoError] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pending, start] = useTransition();
  const [checkingPromo, startPromo] = useTransition();
  const [result, setResult] = useState<{
    ok: boolean;
    orderRef?: string;
    error?: string;
  } | null>(null);

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : locale, {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const promoDiscount = promo
    ? promo.kind === "PERCENT"
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(subtotal, promo.value)
    : 0;

  const maxPointsValue =
    Math.floor(pointsBalance / pointsPerUnit) * pointsUnitValue;
  const pointsDiscount = usePoints
    ? Math.min(maxPointsValue, Math.max(0, subtotal - promoDiscount))
    : 0;

  const total = Math.max(0, subtotal - promoDiscount - pointsDiscount);
  const canPlace =
    name.trim() && email.trim() && phone.trim() && clinicId && items.length > 0;

  function applyPromo() {
    startPromo(async () => {
      setPromoError(false);
      const r = await checkPromoAction(promoInput);
      if (r.ok && r.kind && r.value != null) {
        setPromo({
          code: promoInput.trim().toUpperCase(),
          kind: r.kind,
          value: r.value,
        });
      } else {
        setPromo(null);
        setPromoError(true);
      }
    });
  }

  function placeOrder() {
    start(async () => {
      const r = await placeOrderAction({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          qty: i.qty,
        })),
        pickupClinicId: clinicId,
        contact: { name, email, phone },
        promoCode: promo?.code,
        usePoints,
      });
      setResult(r);
      if (r.ok) clear();
    });
  }

  if (!ready) {
    return <div className="py-16 text-center text-ink-muted">…</div>;
  }

  if (result?.ok) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-3 font-serif text-2xl text-ink">
          {t("successTitle")}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{t("successText")}</p>
        {result.orderRef && (
          <p className="mt-3 text-sm text-ink">
            {t("orderRef")}: <strong>#{result.orderRef}</strong>
          </p>
        )}
        {!user && (
          <Link
            href="/sign-up"
            className="mt-5 inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-medium text-white hover:bg-gold-dark"
          >
            {t("createAccount")}
          </Link>
        )}
        <Link
          href="/shop"
          className="mt-3 block text-sm text-gold-dark hover:underline"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gold/30" />
        <p className="mt-3 text-ink-muted">{t("errorEmpty")}</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-medium text-white hover:bg-gold-dark"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* details */}
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 font-serif text-lg text-ink">
            {t("yourDetails")}
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-1 font-serif text-lg text-ink">
            {t("pickupClinic")}
          </h2>
          <p className="mb-3 text-xs text-ink-muted">{t("pickupNote")}</p>
          <div className="space-y-2">
            {clinics.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setClinicId(c.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-start text-sm transition",
                  clinicId === c.id
                    ? "border-gold bg-cream-50"
                    : "border-line bg-white hover:border-gold",
                )}
              >
                <span
                  className={cn(
                    "h-4 w-4 rounded-full border-2",
                    clinicId === c.id
                      ? "border-gold bg-gold"
                      : "border-line",
                  )}
                />
                {c.name}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <Label htmlFor="promo">{t("promoCode")}</Label>
          <div className="flex gap-2">
            <Input
              id="promo"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyPromo}
              disabled={checkingPromo || !promoInput.trim()}
            >
              {t("apply")}
            </Button>
          </div>
          {promo && (
            <p className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
              <Tag className="h-3.5 w-3.5" />
              {t("promoApplied")}
            </p>
          )}
          {promoError && (
            <p className="mt-2 text-sm text-rose-600">{t("promoInvalid")}</p>
          )}

          {user && pointsBalance >= pointsPerUnit && (
            <label className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm text-ink">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="h-4 w-4 accent-gold"
              />
              {t("usePoints")} — {t("pointsBalance", { points: pointsBalance })}
            </label>
          )}
        </section>
      </div>

      {/* summary */}
      <div className="h-fit rounded-2xl border border-line bg-white p-5 shadow-card">
        <h2 className="mb-3 font-serif text-lg text-ink">{t("summary")}</h2>
        <Row label={t("subtotal")} value={money.format(subtotal)} />
        {promoDiscount > 0 && (
          <Row
            label={t("discount")}
            value={`- ${money.format(promoDiscount)}`}
            accent
          />
        )}
        {pointsDiscount > 0 && (
          <Row
            label={t("pointsDiscount")}
            value={`- ${money.format(pointsDiscount)}`}
            accent
          />
        )}
        <div className="mt-2 flex justify-between border-t border-line pt-3">
          <span className="font-semibold text-ink">{t("total")}</span>
          <span className="font-semibold text-gold-dark">
            {money.format(total)}
          </span>
        </div>

        <p className="mt-3 rounded-xl bg-cream-100 px-3 py-2 text-xs text-ink-soft">
          {t("paymentNote")}
        </p>
        {!user && (
          <p className="mt-2 text-xs text-ink-muted">{t("guestNote")}</p>
        )}

        {result && !result.ok && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {t(result.error ?? "errorGeneric")}
          </p>
        )}

        <Button
          type="button"
          onClick={placeOrder}
          disabled={pending || !canPlace}
          className="mt-4 w-full"
        >
          {pending ? "…" : t("placeOrder")}
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className={accent ? "text-emerald-600" : "text-ink"}>{value}</span>
    </div>
  );
}

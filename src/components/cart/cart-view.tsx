"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "./cart-provider";

export function CartView() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { items, setQty, remove, subtotal, count, ready } = useCart();

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : locale, {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  if (!ready) {
    return <div className="py-16 text-center text-ink-muted">…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gold/30" />
        <p className="mt-3 text-ink-muted">{t("empty")}</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-medium text-white hover:bg-gold-dark"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId ?? "base"}`}
            className="flex gap-4 rounded-2xl border border-line bg-white p-3"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-gold/30" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-ink-muted">
                      {item.variantLabel}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.productId, item.variantId)}
                  aria-label={t("remove")}
                  className="text-ink-muted hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="inline-flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    aria-label="Decrease"
                    onClick={() =>
                      setQty(item.productId, item.variantId, item.qty - 1)
                    }
                    className="flex h-8 w-8 items-center justify-center text-ink"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm">{item.qty}</span>
                  <button
                    type="button"
                    aria-label="Increase"
                    onClick={() =>
                      setQty(item.productId, item.variantId, item.qty + 1)
                    }
                    className="flex h-8 w-8 items-center justify-center text-ink"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="font-semibold text-gold-dark">
                  {money.format(item.unitPrice * item.qty)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="flex justify-between text-sm">
          <span className="text-ink-soft">
            {t("subtotal")} ({count} {t("items")})
          </span>
          <span className="font-medium text-ink">
            {money.format(subtotal)}
          </span>
        </div>
        <div className="mt-3 flex justify-between border-t border-line pt-3">
          <span className="font-semibold text-ink">{t("total")}</span>
          <span className="font-semibold text-gold-dark">
            {money.format(subtotal)}
          </span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 flex h-12 items-center justify-center rounded-full bg-gold text-sm font-medium text-white hover:bg-gold-dark"
        >
          {t("checkout")}
        </Link>
        <Link
          href="/shop"
          className="mt-2 flex h-11 items-center justify-center rounded-full border border-line text-sm font-medium text-ink-soft hover:bg-cream-100"
        >
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}

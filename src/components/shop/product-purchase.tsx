"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PurchaseVariant = { id: string; label: string; stock: number };

export type PurchaseProduct = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number;
  baseStock: number;
  variants: PurchaseVariant[];
};

export function ProductPurchase({ product }: { product: PurchaseProduct }) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const { add } = useCart();

  const hasVariants = product.variants.length > 0;
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? null,
    [product.variants, variantId],
  );

  const inStock = hasVariants
    ? product.variants.some((v) => v.stock > 0)
    : product.baseStock > 0;

  const maxStock = hasVariants
    ? (selectedVariant?.stock ?? 0)
    : product.baseStock;

  const canAdd = hasVariants ? Boolean(selectedVariant) && maxStock > 0 : inStock;

  function handleAdd() {
    if (!canAdd) return;
    add(
      {
        productId: product.id,
        variantId,
        slug: product.slug,
        name: product.name,
        variantLabel: selectedVariant?.label ?? null,
        image: product.image,
        unitPrice: product.unitPrice,
      },
      qty,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  if (!inStock) {
    return (
      <p className="rounded-xl bg-cream-100 px-4 py-3 text-sm font-medium text-ink-muted">
        {t("outOfStock")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">
            {t("selectVariant")}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={v.stock <= 0}
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition disabled:opacity-40",
                  variantId === v.id
                    ? "border-gold bg-gold text-white"
                    : "border-line bg-white text-ink hover:border-gold",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-line">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease"
            className="flex h-10 w-10 items-center justify-center text-ink"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() =>
              setQty((q) => (maxStock ? Math.min(maxStock, q + 1) : q + 1))
            }
            aria-label="Increase"
            className="flex h-10 w-10 items-center justify-center text-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex-1"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              {t("added")}
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {t("addToCart")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

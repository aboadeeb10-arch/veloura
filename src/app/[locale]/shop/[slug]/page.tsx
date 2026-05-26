import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { num } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import {
  ProductPurchase,
  type PurchaseProduct,
} from "@/components/shop/product-purchase";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Shop");
  const tc = await getTranslations("Common");

  const p = await getProduct(slug);
  if (!p || !p.isActive) notFound();

  const reg = num(p.regularPrice);
  const disc = num(p.discountedPrice);
  const onSale = disc < reg;
  const description = pick(p.description, locale);

  const purchase: PurchaseProduct = {
    id: p.id,
    slug: p.slug,
    name: pick(p.name, locale),
    image: p.images[0] ?? null,
    unitPrice: disc,
    baseStock: p.stock,
    variants: p.variants.map((v) => ({
      id: v.id,
      label: pick(v.label, locale),
      stock: v.stock,
    })),
  };

  return (
    <main className="bg-cream-50">
      <div className="container-wide section">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-gold-dark"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToShop")}
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-white">
            {p.images[0] ? (
              <Image
                src={p.images[0]}
                alt={pick(p.name, locale)}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-gold/30" />
              </div>
            )}
            {onSale && (
              <span className="absolute start-4 top-4">
                <Badge variant="sale">{tc("sale")}</Badge>
              </span>
            )}
          </div>

          <div>
            <Badge variant="neutral">{pick(p.category.name, locale)}</Badge>
            <h1 className="mt-3 text-3xl text-ink">{pick(p.name, locale)}</h1>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-gold-dark">
                {formatPrice(disc, locale)}
              </span>
              {onSale && (
                <span className="text-lg text-ink-muted line-through">
                  {formatPrice(reg, locale)}
                </span>
              )}
            </div>

            {description && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-ink">
                  {t("description")}
                </p>
                <p className="mt-1 leading-relaxed text-ink-soft">
                  {description}
                </p>
              </div>
            )}

            <div className="mt-6">
              <ProductPurchase product={purchase} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice, cn } from "@/lib/utils";
import { num } from "@/lib/queries";
import { PageHero } from "@/components/ui/page-hero";
import {
  ProductCard,
  type ProductCardData,
} from "@/components/shop/product-card";

export const dynamic = "force-dynamic";

async function getShopData(category?: string) {
  try {
    const [categories, products] = await Promise.all([
      prisma.productCategory.findMany(),
      prisma.product.findMany({
        where: {
          isActive: true,
          ...(category ? { category: { slug: category } } : {}),
        },
        include: { variants: { select: { stock: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { categories, products };
  } catch {
    return { categories: [], products: [] };
  }
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { category } = await searchParams;

  const t = await getTranslations("Shop");
  const tc = await getTranslations("Common");
  const { categories, products } = await getShopData(category);

  const cards: ProductCardData[] = products.map((p) => {
    const reg = num(p.regularPrice);
    const disc = num(p.discountedPrice);
    const inStock = p.variants.length
      ? p.variants.some((v) => v.stock > 0)
      : p.stock > 0;
    return {
      slug: p.slug,
      name: pick(p.name, locale),
      image: p.images[0] ?? null,
      regularPriceLabel: formatPrice(reg, locale),
      discountedPriceLabel: formatPrice(disc, locale),
      onSale: disc < reg,
      saleLabel: tc("sale"),
      inStock,
      outOfStockLabel: tc("outOfStock"),
    };
  });

  return (
    <main>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="container-wide section">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Chip href={{ pathname: "/shop" }} label={t("all")} active={!category} />
          {categories.map((c) => (
            <Chip
              key={c.id}
              href={{ pathname: "/shop", query: { category: c.slug } }}
              label={pick(c.name, locale)}
              active={category === c.slug}
            />
          ))}
        </div>

        {cards.length === 0 ? (
          <p className="py-12 text-center text-ink-muted">{t("empty")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((c) => (
              <ProductCard key={c.slug} data={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Chip({
  href,
  label,
  active,
}: {
  href: { pathname: string; query?: Record<string, string> };
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-gold bg-gold text-white"
          : "border-line bg-white text-ink-soft hover:border-gold",
      )}
    >
      {label}
    </Link>
  );
}

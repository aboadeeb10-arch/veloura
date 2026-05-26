import { setRequestLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Plus, Pencil, Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { num } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: { select: { stock: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">{t("products")}</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gold px-4 text-sm font-medium text-white hover:bg-gold-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addProduct")}
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-muted">
          {t("noProducts")}
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => {
            const stock = p.variants.length
              ? p.variants.reduce((s, v) => s + v.stock, 0)
              : p.stock;
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-5 w-5 text-gold/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {pick(p.name, locale)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {pick(p.category.name, locale)} · {t("stock")}: {stock}
                  </p>
                </div>
                {!p.isActive && (
                  <Badge variant="neutral">{t("active")}: —</Badge>
                )}
                <span className="hidden text-sm font-semibold text-gold-dark sm:block">
                  {formatPrice(num(p.discountedPrice), locale)}
                </span>
                <Link
                  href={`/admin/products/${p.id}`}
                  aria-label={t("editProduct")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-cream-100"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteProductButton productId={p.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

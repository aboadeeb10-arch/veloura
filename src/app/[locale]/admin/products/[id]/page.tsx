import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { num } from "@/lib/queries";
import {
  ProductForm,
  type Localized,
} from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.productCategory.findMany(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-gold-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("back")}
      </Link>
      <h1 className="mb-6 text-2xl text-ink">{t("editProduct")}</h1>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <ProductForm
          categories={categories.map((c) => ({
            id: c.id,
            name: pick(c.name, locale),
          }))}
          product={{
            id: product.id,
            name: (product.name as Localized) ?? {},
            description: (product.description as Localized) ?? {},
            categoryId: product.categoryId,
            regularPrice: num(product.regularPrice),
            discountedPrice: num(product.discountedPrice),
            stock: product.stock,
            image: product.images[0] ?? "",
            isFeatured: product.isFeatured,
            isActive: product.isActive,
          }}
        />
      </div>
    </div>
  );
}

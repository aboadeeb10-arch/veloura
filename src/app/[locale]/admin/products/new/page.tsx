import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const categories = await prisma.productCategory.findMany();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-gold-dark"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("back")}
      </Link>
      <h1 className="mb-6 text-2xl text-ink">{t("newProduct")}</h1>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <ProductForm
          categories={categories.map((c) => ({
            id: c.id,
            name: pick(c.name, locale),
          }))}
        />
      </div>
    </div>
  );
}

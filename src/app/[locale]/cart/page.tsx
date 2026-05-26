import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/ui/page-hero";
import { CartView } from "@/components/cart/cart-view";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cart");

  return (
    <main>
      <PageHero title={t("title")} />
      <div className="container-wide section">
        <CartView />
      </div>
    </main>
  );
}

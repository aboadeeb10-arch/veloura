import { setRequestLocale, getTranslations } from "next-intl/server";
import { Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getHomeData, num } from "@/lib/queries";
import { pick } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/utils";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { StoriesRow } from "@/components/home/stories-row";
import { WorkGallery } from "@/components/home/work-gallery";
import { TreatmentCard } from "@/components/treatments/treatment-card";
import { ProductCard } from "@/components/shop/product-card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const tcat = await getTranslations("ServiceCategory");
  const tn = await getTranslations("Nav");

  const { heroSlides, stories, workItems, treatments, products } =
    await getHomeData();

  const slides = heroSlides.map((s) => ({
    id: s.id,
    image: s.image,
    headline: pick(s.headline, locale),
    subtext: pick(s.subtext, locale),
    ctaLabel: pick(s.ctaLabel, locale) || null,
    ctaHref: s.ctaHref,
  }));

  const storyData = stories.map((s) => ({
    id: s.id,
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType as "IMAGE" | "VIDEO",
    thumbnailUrl: s.thumbnailUrl,
    caption: pick(s.caption, locale),
  }));

  const work = workItems.map((w) => ({
    id: w.id,
    beforeImage: w.beforeImage,
    afterImage: w.afterImage,
    singleImage: w.singleImage,
    label: pick(w.treatmentLabel, locale),
  }));

  const treatmentCards = treatments.map((s) => ({
    slug: s.slug,
    name: pick(s.name, locale),
    categoryLabel: tcat(s.category),
    image: s.image,
    priceLabel: formatPrice(num(s.price), locale),
    durationLabel: `${s.durationMin} ${tc("minutes")}`,
    practitionerName: s.practitioner.name,
  }));

  const productCards = products.map((p) => {
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
      {slides.length > 0 ? (
        <HeroCarousel slides={slides} />
      ) : (
        <section className="flex h-[60vh] min-h-[400px] flex-col items-center justify-center bg-cream-100 px-6 text-center">
          <h1 className="text-4xl text-ink sm:text-5xl">Veloura</h1>
          <p className="mt-3 max-w-md text-ink-soft">{t("treatmentsSubtitle")}</p>
          <Link
            href="/book"
            className="mt-7 inline-flex h-12 items-center rounded-full bg-gold px-8 text-sm font-medium text-white hover:bg-gold-dark"
          >
            {tc("bookNow")}
          </Link>
        </section>
      )}

      {storyData.length > 0 && (
        <section className="container-wide pt-8 sm:pt-10">
          <StoriesRow stories={storyData} />
        </section>
      )}

      {work.length > 0 && (
        <section className="container-wide section">
          <SectionHeading title={t("workTitle")} subtitle={t("workSubtitle")} />
          <WorkGallery
            items={work}
            beforeLabel={t("before")}
            afterLabel={t("after")}
          />
        </section>
      )}

      {treatmentCards.length > 0 && (
        <section className="bg-cream-100">
          <div className="container-wide section">
            <SectionHeading
              title={t("treatmentsTitle")}
              subtitle={t("treatmentsSubtitle")}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {treatmentCards.map((c) => (
                <TreatmentCard key={c.slug} data={c} />
              ))}
            </div>
            <div className="mt-9 text-center">
              <Link
                href="/treatments"
                className="inline-flex h-11 items-center rounded-full border border-gold px-7 text-sm font-medium text-gold-dark transition-colors hover:bg-cream-200"
              >
                {tc("viewAll")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {productCards.length > 0 && (
        <section className="container-wide section">
          <SectionHeading
            title={t("productsTitle")}
            subtitle={t("productsSubtitle")}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productCards.map((c) => (
              <ProductCard key={c.slug} data={c} />
            ))}
          </div>
          <div className="mt-9 text-center">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-full border border-gold px-7 text-sm font-medium text-gold-dark transition-colors hover:bg-cream-200"
            >
              {tc("viewAll")}
            </Link>
          </div>
        </section>
      )}

      <section className="bg-ink">
        <div className="container-wide flex flex-col items-center gap-4 py-16 text-center">
          <Gift className="h-9 w-9 text-gold-light" />
          <h2 className="text-2xl text-white sm:text-3xl">
            {t("signupBannerTitle")}
          </h2>
          <p className="max-w-md text-cream-200">{t("signupBannerText")}</p>
          <Link
            href="/sign-up"
            className="mt-2 inline-flex h-12 items-center rounded-full bg-gold px-8 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
          >
            {tn("signUp")}
          </Link>
        </div>
      </section>
    </main>
  );
}

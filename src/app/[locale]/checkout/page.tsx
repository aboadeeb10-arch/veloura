import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pick } from "@/lib/i18n-content";
import { PageHero } from "@/components/ui/page-hero";
import {
  CheckoutForm,
  type CheckoutClinic,
} from "@/components/checkout/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Checkout");
  const session = await auth().catch(() => null);

  let clinics: CheckoutClinic[] = [];
  let pointsPerUnit = 100;
  let pointsUnitValue = 10;
  try {
    const [rawClinics, rewardConfig] = await Promise.all([
      prisma.clinic.findMany({ orderBy: { city: "asc" } }),
      prisma.rewardConfig.findUnique({ where: { id: 1 } }),
    ]);
    clinics = rawClinics.map((c) => ({ id: c.id, name: pick(c.name, locale) }));
    if (rewardConfig) {
      pointsPerUnit = rewardConfig.redeemPointsPerUnit;
      pointsUnitValue = Number(rewardConfig.redeemUnitValue);
    }
  } catch {
    /* render with empties */
  }

  let user: { name: string; email: string; phone: string } | null = null;
  let pointsBalance = 0;
  if (session?.user?.id) {
    try {
      const u = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { rewardAccount: true },
      });
      if (u) {
        user = { name: u.name, email: u.email, phone: u.phone ?? "" };
        pointsBalance = u.rewardAccount?.pointsBalance ?? 0;
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <main>
      <PageHero title={t("title")} />
      <div className="container-wide section">
        <CheckoutForm
          clinics={clinics}
          user={user}
          pointsBalance={pointsBalance}
          pointsPerUnit={pointsPerUnit}
          pointsUnitValue={pointsUnitValue}
        />
      </div>
    </main>
  );
}

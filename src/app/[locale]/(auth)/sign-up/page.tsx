import { setRequestLocale, getTranslations } from "next-intl/server";
import { Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl text-ink">{t("signUpTitle")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("signUpSubtitle")}</p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl bg-cream-200 px-4 py-3 text-sm text-gold-dark">
        <Gift className="h-4 w-4 shrink-0" />
        {t("welcomeDiscount")}
      </div>

      <Card>
        <CardBody>
          <SignUpForm />
        </CardBody>
      </Card>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {t("haveAccount")}{" "}
        <Link
          href="/sign-in"
          className="font-medium text-gold-dark hover:underline"
        >
          {t("signInCta")}
        </Link>
      </p>
    </div>
  );
}

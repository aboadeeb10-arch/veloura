import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage({
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
        <h1 className="text-2xl text-ink">{t("signInTitle")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("signInSubtitle")}</p>
      </div>

      <Card>
        <CardBody>
          <SignInForm />
        </CardBody>
      </Card>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {t("noAccount")}{" "}
        <Link
          href="/sign-up"
          className="font-medium text-gold-dark hover:underline"
        >
          {t("signUpCta")}
        </Link>
      </p>
    </div>
  );
}

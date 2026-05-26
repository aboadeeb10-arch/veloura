import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default async function ForgotPasswordPage({
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
        <h1 className="text-2xl text-ink">{t("forgotTitle")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("forgotSubtitle")}</p>
      </div>
      <Card>
        <CardBody>
          <ForgotPasswordForm />
        </CardBody>
      </Card>
      <p className="mt-5 text-center text-sm text-ink-soft">
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

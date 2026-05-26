import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  const t = await getTranslations("Auth");

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl text-ink">{t("resetTitle")}</h1>
      </div>
      <Card>
        <CardBody>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="py-4 text-center text-sm text-rose-700">
              {t("verifyError")}
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

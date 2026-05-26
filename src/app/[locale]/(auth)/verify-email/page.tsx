import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { consumeVerificationToken } from "@/lib/tokens";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
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

  let ok = false;
  if (token) {
    try {
      ok = (await consumeVerificationToken(token)).ok;
    } catch {
      ok = false;
    }
  }

  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-3 py-8 text-center">
        {ok ? (
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        ) : (
          <XCircle className="h-12 w-12 text-rose-400" />
        )}
        <h1 className="text-xl text-ink">{t("verifyTitle")}</h1>
        <p className="text-sm text-ink-soft">
          {ok ? t("verifySuccess") : t("verifyError")}
        </p>
        <Link
          href="/sign-in"
          className="mt-2 inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-medium text-white hover:bg-gold-dark"
        >
          {t("signInCta")}
        </Link>
      </CardBody>
    </Card>
  );
}

"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { resetPasswordAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(resetPasswordAction, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <p className="text-sm text-ink-soft">{t("resetSuccess")}</p>
        <Link
          href="/sign-in"
          className="mt-1 inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-medium text-white hover:bg-gold-dark"
        >
          {t("signInCta")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>
      {state && !state.ok && state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {t(state.error)}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "…" : t("resetCta")}
      </Button>
    </form>
  );
}

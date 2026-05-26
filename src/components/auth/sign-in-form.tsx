"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { signInAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [state, action, pending] = useActionState(signInAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.push("/account");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <div className="mt-1.5 text-end">
          <Link
            href="/forgot-password"
            className="text-xs text-gold-dark hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>
      </div>

      {state && !state.ok && state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {t(state.error)}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "…" : t("signInCta")}
      </Button>
    </form>
  );
}

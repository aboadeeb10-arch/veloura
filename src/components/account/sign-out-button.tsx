"use client";

import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/actions/auth";

export function SignOutButton() {
  const t = useTranslations("Account");
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-cream-100"
      >
        <LogOut className="h-4 w-4 rtl:rotate-180" />
        {t("signOut")}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cancelBookingAction } from "@/actions/account";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const t = useTranslations("Account");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="text-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            const result = await cancelBookingAction(bookingId);
            if (result.ok) router.refresh();
            else setError(t("cancelError"));
          })
        }
        className="text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
      >
        {pending ? "…" : t("cancel")}
      </button>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

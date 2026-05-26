"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, X, CheckCheck } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { setBookingStatusAction } from "@/actions/admin";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(next: "APPROVED" | "DECLINED" | "COMPLETED") {
    start(async () => {
      const result = await setBookingStatusAction(bookingId, next);
      if (result.ok) router.refresh();
    });
  }

  if (status !== "REQUESTED" && status !== "APPROVED") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "REQUESTED" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => act("APPROVED")}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {t("approve")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => act("DECLINED")}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            {t("decline")}
          </button>
        </>
      )}
      {status === "APPROVED" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => act("COMPLETED")}
          className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-white hover:bg-gold-dark disabled:opacity-50"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          {t("complete")}
        </button>
      )}
    </div>
  );
}

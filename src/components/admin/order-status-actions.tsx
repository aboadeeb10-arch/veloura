"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, X, Undo2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { setOrderStatusAction } from "@/actions/admin";

export function OrderStatusActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const t = useTranslations("Admin");
  const tc = useTranslations("Common");
  const ts = useTranslations("OrderStatus");
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(next: "DONE" | "CANCELLED" | "REFUNDED") {
    start(async () => {
      const result = await setOrderStatusAction(orderId, next);
      if (result.ok) router.refresh();
    });
  }

  if (status !== "NEW" && status !== "DONE") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "NEW" && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => act("DONE")}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {t("markDone")}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => act("CANCELLED")}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            {tc("cancel")}
          </button>
        </>
      )}
      {status === "DONE" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => act("REFUNDED")}
          className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-cream-100 disabled:opacity-50"
        >
          <Undo2 className="h-3.5 w-3.5" />
          {ts("REFUNDED")}
        </button>
      )}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { deleteProductAction } from "@/actions/admin";

export function DeleteProductButton({ productId }: { productId: string }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(t("deleteConfirm"))) return;
        start(async () => {
          const result = await deleteProductAction(productId);
          if (result.ok) router.refresh();
        });
      }}
      aria-label={t("delete")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-rose-600 hover:bg-rose-50 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

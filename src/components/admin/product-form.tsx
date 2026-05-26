"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { saveProductAction } from "@/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type Localized = {
  he?: string;
  ar?: string;
  ru?: string;
  en?: string;
};

export type ProductFormValues = {
  id?: string;
  name?: Localized;
  description?: Localized;
  categoryId?: string;
  regularPrice?: number;
  discountedPrice?: number;
  stock?: number;
  image?: string;
  isFeatured?: boolean;
  isActive?: boolean;
};

const LANGS: { suffix: string; key: keyof Localized; dir: "rtl" | "ltr" }[] = [
  { suffix: "He", key: "he", dir: "rtl" },
  { suffix: "Ar", key: "ar", dir: "rtl" },
  { suffix: "Ru", key: "ru", dir: "ltr" },
  { suffix: "En", key: "en", dir: "ltr" },
];

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductFormValues;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      setError("");
      const result = await saveProductAction(fd);
      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(result.error ?? "generic");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          {t("productName")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGS.map((l) => (
            <div key={l.suffix}>
              <Label>{t(`lang${l.suffix}` as "langHe")}</Label>
              <Input
                name={`name${l.suffix}`}
                dir={l.dir}
                defaultValue={product?.name?.[l.key] ?? ""}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">
          {t("description")}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGS.map((l) => (
            <div key={l.suffix}>
              <Label>{t(`lang${l.suffix}` as "langHe")}</Label>
              <Input
                name={`desc${l.suffix}`}
                dir={l.dir}
                defaultValue={product?.description?.[l.key] ?? ""}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoryId">{t("category")}</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId ?? ""}
            className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none"
          >
            <option value="" disabled>
              —
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="stock">{t("stock")}</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="regularPrice">{t("regularPrice")}</Label>
          <Input
            id="regularPrice"
            name="regularPrice"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.regularPrice ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="discountedPrice">{t("discountedPrice")}</Label>
          <Input
            id="discountedPrice"
            name="discountedPrice"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.discountedPrice ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">{t("imageUrl")}</Label>
        <Input
          id="image"
          name="image"
          type="url"
          dir="ltr"
          placeholder="https://…"
          defaultValue={product?.image ?? ""}
        />
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.isFeatured ?? false}
            className="h-4 w-4 accent-gold"
          />
          {t("featured")}
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4 accent-gold"
          />
          {t("active")}
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error === "name" || error === "fields"
            ? t("productName")
            : t("save")}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "…" : t("save")}
      </Button>
    </form>
  );
}

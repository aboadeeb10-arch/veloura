"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type WorkItemData = {
  id: string;
  beforeImage: string | null;
  afterImage: string | null;
  singleImage: string | null;
  label: string;
};

export function WorkGallery({
  items,
  beforeLabel,
  afterLabel,
}: {
  items: WorkItemData[];
  beforeLabel: string;
  afterLabel: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <WorkCard
          key={item.id}
          item={item}
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
        />
      ))}
    </div>
  );
}

function WorkCard({
  item,
  beforeLabel,
  afterLabel,
}: {
  item: WorkItemData;
  beforeLabel: string;
  afterLabel: string;
}) {
  const hasPair = Boolean(item.beforeImage && item.afterImage);
  const [showBefore, setShowBefore] = useState(false);
  const src = hasPair
    ? showBefore
      ? item.beforeImage!
      : item.afterImage!
    : item.singleImage || item.afterImage || item.beforeImage || "";

  if (!src) return null;

  return (
    <button
      type="button"
      onClick={() => hasPair && setShowBefore((v) => !v)}
      className={cn(
        "group relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-cream-100",
        hasPair ? "cursor-pointer" : "cursor-default",
      )}
    >
      <Image
        src={src}
        alt={item.label}
        fill
        sizes="(max-width: 640px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />

      {hasPair && (
        <span className="absolute start-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-ink">
          {showBefore ? beforeLabel : afterLabel}
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 p-3 text-start text-sm font-medium text-white">
        {item.label}
      </span>
    </button>
  );
}

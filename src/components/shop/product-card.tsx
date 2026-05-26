import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export type ProductCardData = {
  slug: string;
  name: string;
  image: string | null;
  regularPriceLabel: string;
  discountedPriceLabel: string;
  onSale: boolean;
  saleLabel: string;
  inStock: boolean;
  outOfStockLabel: string;
};

export function ProductCard({ data }: { data: ProductCardData }) {
  return (
    <Link
      href={`/shop/${data.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {data.image ? (
          <Image
            src={data.image}
            alt={data.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-9 w-9 text-gold/35" />
          </div>
        )}
        {data.onSale && (
          <span className="absolute start-3 top-3">
            <Badge variant="sale">{data.saleLabel}</Badge>
          </span>
        )}
        {!data.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
              {data.outOfStockLabel}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-ink">
          {data.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-gold-dark">
            {data.discountedPriceLabel}
          </span>
          {data.onSale && (
            <span className="text-sm text-ink-muted line-through">
              {data.regularPriceLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

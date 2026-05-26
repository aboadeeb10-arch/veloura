import Image from "next/image";
import { Clock, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export type TreatmentCardData = {
  slug: string;
  name: string;
  categoryLabel: string;
  image: string | null;
  priceLabel: string;
  durationLabel: string;
  practitionerName: string;
};

export function TreatmentCard({ data }: { data: TreatmentCardData }) {
  return (
    <Link
      href={{ pathname: "/book", query: { service: data.slug } }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        {data.image ? (
          <Image
            src={data.image}
            alt={data.name}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkles className="h-10 w-10 text-gold/35" />
          </div>
        )}
        <span className="absolute start-3 top-3">
          <Badge>{data.categoryLabel}</Badge>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg leading-snug text-ink">
          {data.name}
        </h3>
        <p className="mt-0.5 text-sm text-ink-muted">
          {data.practitionerName}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
            <Clock className="h-3.5 w-3.5" />
            {data.durationLabel}
          </span>
          <span className="font-semibold text-gold-dark">
            {data.priceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

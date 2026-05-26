import { Calendar, MapPin, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CancelBookingButton } from "./cancel-booking-button";

const STATUS_VARIANT: Record<
  string,
  "warning" | "success" | "neutral" | "sale"
> = {
  REQUESTED: "warning",
  APPROVED: "success",
  COMPLETED: "neutral",
  DECLINED: "sale",
  CANCELLED: "neutral",
};

export type BookingCardData = {
  id: string;
  serviceName: string;
  practitionerName: string;
  clinicName: string;
  whenLabel: string;
  statusKey: string;
  statusLabel: string;
  priceLabel: string;
  canCancel: boolean;
};

export function BookingCard({ data }: { data: BookingCardData }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-ink">{data.serviceName}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
            <UserRound className="h-3.5 w-3.5" />
            {data.practitionerName}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[data.statusKey] ?? "neutral"}>
          {data.statusLabel}
        </Badge>
      </div>

      <div className="mt-3 space-y-1 text-sm text-ink-soft">
        <p className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gold" />
          {data.whenLabel}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-gold" />
          {data.clinicName}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <span className="font-semibold text-gold-dark">{data.priceLabel}</span>
        {data.canCancel && <CancelBookingButton bookingId={data.id} />}
      </div>
    </div>
  );
}

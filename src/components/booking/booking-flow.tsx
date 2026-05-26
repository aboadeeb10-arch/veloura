"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Clock, MapPin, CalendarDays } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  getSlotsAction,
  createBookingAction,
  type BookingState,
} from "@/actions/booking";
import type { Slot } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BookingService = {
  id: string;
  slug: string;
  name: string;
  categoryLabel: string;
  durationMin: number;
  price: number;
  practitionerId: string;
  practitionerName: string;
  clinics: { id: string; name: string }[];
};

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function BookingFlow({
  services,
  isAuthed,
  firstVisitDiscount,
  initialServiceSlug,
}: {
  services: BookingService[];
  isAuthed: boolean;
  firstVisitDiscount: boolean;
  initialServiceSlug?: string;
}) {
  const t = useTranslations("Booking");
  const locale = useLocale();

  const initial = initialServiceSlug
    ? services.find((s) => s.slug === initialServiceSlug)
    : undefined;

  const [step, setStep] = useState(initial ? 1 : 0);
  const [service, setService] = useState<BookingService | null>(
    initial ?? null,
  );
  const [clinicId, setClinicId] = useState<string>(
    initial && initial.clinics.length === 1 ? initial.clinics[0].id : "",
  );
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, startSlots] = useTransition();

  const [state, formAction, pending] = useActionState<BookingState, FormData>(
    createBookingAction,
    null,
  );

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ar" ? "ar" : locale, {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const dates = useMemo(() => {
    const out: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      out.push(d);
    }
    return out;
  }, []);

  function selectService(s: BookingService) {
    setService(s);
    setClinicId(s.clinics.length === 1 ? s.clinics[0].id : "");
    setDate(null);
    setSlot(null);
    setSlots([]);
    setStep(1);
  }

  function loadSlots(d: Date, cid: string) {
    if (!service || !cid) return;
    startSlots(async () => {
      const result = await getSlotsAction({
        practitionerId: service.practitionerId,
        clinicId: cid,
        durationMin: service.durationMin,
        dateISO: isoDate(d),
      });
      setSlots(result);
    });
  }

  function pickDate(d: Date) {
    setDate(d);
    setSlot(null);
    setSlots([]);
    loadSlots(d, clinicId);
  }

  function pickClinic(cid: string) {
    setClinicId(cid);
    setSlot(null);
    if (date) {
      setSlots([]);
      loadSlots(date, cid);
    }
  }

  const discountedPrice =
    service && firstVisitDiscount
      ? Math.round(service.price * 0.8)
      : service?.price ?? 0;

  // success screen
  if (state?.ok) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-3 font-serif text-2xl text-ink">
          {t("successTitle")}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{t("successText")}</p>
        <Link
          href="/account/bookings"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-gold px-7 text-sm font-medium text-white hover:bg-gold-dark"
        >
          {t("viewBookings")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Stepper step={step} labels={[t("stepService"), t("stepTime"), t("stepConfirm")]} />

      {/* STEP 0 — choose treatment */}
      {step === 0 && (
        <div className="mt-6 space-y-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectService(s)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 text-start transition hover:border-gold hover:bg-cream-50"
            >
              <span>
                <span className="block font-medium text-ink">{s.name}</span>
                <span className="block text-xs text-ink-muted">
                  {s.categoryLabel} · {s.practitionerName} · {s.durationMin}{" "}
                  min
                </span>
              </span>
              <span className="font-semibold text-gold-dark">
                {money.format(s.price)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* STEP 1 — clinic, date, time */}
      {step === 1 && service && (
        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <MapPin className="h-4 w-4 text-gold" />
              {t("chooseClinic")}
            </p>
            <div className="flex flex-wrap gap-2">
              {service.clinics.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickClinic(c.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition",
                    clinicId === c.id
                      ? "border-gold bg-gold text-white"
                      : "border-line bg-white text-ink hover:border-gold",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {clinicId && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <CalendarDays className="h-4 w-4 text-gold" />
                {t("chooseDate")}
              </p>
              <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {dates.map((d) => {
                  const selected = date && isoDate(d) === isoDate(date);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => pickDate(d)}
                      className={cn(
                        "flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 text-sm transition",
                        selected
                          ? "border-gold bg-gold text-white"
                          : "border-line bg-white text-ink hover:border-gold",
                      )}
                    >
                      <span className="text-xs">
                        {new Intl.DateTimeFormat(locale, {
                          weekday: "short",
                        }).format(d)}
                      </span>
                      <span className="text-lg font-semibold">
                        {d.getDate()}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {new Intl.DateTimeFormat(locale, {
                          month: "short",
                        }).format(d)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {clinicId && date && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Clock className="h-4 w-4 text-gold" />
                {t("chooseTime")}
              </p>
              {loadingSlots ? (
                <p className="py-4 text-sm text-ink-muted">…</p>
              ) : slots.length === 0 ? (
                <p className="rounded-xl bg-cream-100 px-4 py-3 text-sm text-ink-muted">
                  {t("noSlots")}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-lg border py-2 text-sm transition",
                        slot?.start === s.start
                          ? "border-gold bg-gold text-white"
                          : "border-line bg-white text-ink hover:border-gold",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              {t("back")}
            </Button>
            <Button disabled={!clinicId || !date || !slot} onClick={() => setStep(2)}>
              {t("next")}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — confirm */}
      {step === 2 && service && slot && date && (
        <form action={formAction} className="mt-6">
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="clinicId" value={clinicId} />
          <input type="hidden" name="start" value={slot.start} />

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h3 className="mb-3 font-serif text-lg text-ink">
              {t("summary")}
            </h3>
            <SummaryRow label={t("service")} value={service.name} />
            <SummaryRow
              label={t("practitioner")}
              value={service.practitionerName}
            />
            <SummaryRow
              label={t("clinic")}
              value={
                service.clinics.find((c) => c.id === clinicId)?.name ?? ""
              }
            />
            <SummaryRow
              label={t("dateTime")}
              value={`${new Intl.DateTimeFormat(locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(date)} · ${slot.label}`}
            />
            <SummaryRow
              label={t("price")}
              value={
                firstVisitDiscount
                  ? `${money.format(discountedPrice)}`
                  : money.format(service.price)
              }
            />
            {firstVisitDiscount && (
              <p className="mt-1 text-xs text-emerald-600">
                {t("discountApplied")}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label
              htmlFor="notes"
              className="mb-1.5 block text-sm font-medium text-ink-soft"
            >
              {t("notesLabel")}
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder={t("notesPlaceholder")}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
            />
          </div>

          <p className="mt-3 rounded-xl bg-cream-100 px-4 py-3 text-xs text-ink-soft">
            {t("paymentNote")}
          </p>

          {state && !state.ok && state.error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {t(
                state.error === "slotTaken"
                  ? "errorSlotTaken"
                  : state.error === "invalidTime"
                    ? "errorInvalidTime"
                    : state.error === "invalidClinic"
                      ? "errorInvalidClinic"
                      : state.error === "signInRequired"
                        ? "signInToBook"
                        : "errorGeneric",
              )}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              {t("back")}
            </Button>
            {isAuthed ? (
              <Button type="submit" disabled={pending}>
                {pending ? "…" : t("requestCta")}
              </Button>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-medium text-white hover:bg-gold-dark"
              >
                {t("signInToBook")}
              </Link>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-1 items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              i <= step ? "bg-gold text-white" : "bg-cream-200 text-ink-muted",
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "hidden text-sm sm:block",
              i <= step ? "text-ink" : "text-ink-muted",
            )}
          >
            {label}
          </span>
          {i < labels.length - 1 && (
            <span className="h-px flex-1 bg-line" />
          )}
        </div>
      ))}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1.5 text-sm last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className="text-end font-medium text-ink">{value}</span>
    </div>
  );
}

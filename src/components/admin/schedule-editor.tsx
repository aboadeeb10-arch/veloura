"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { saveWorkingHoursAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

type DayRow = {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export type InitialHour = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function ScheduleEditor({
  practitionerId,
  clinicId,
  title,
  initialHours,
}: {
  practitionerId: string;
  clinicId: string;
  title: string;
  initialHours: InitialHour[];
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const [rows, setRows] = useState<DayRow[]>(() =>
    [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const existing = initialHours.find((h) => h.dayOfWeek === d);
      return {
        dayOfWeek: d,
        enabled: Boolean(existing),
        startTime: existing?.startTime ?? "09:00",
        endTime: existing?.endTime ?? "17:00",
      };
    }),
  );

  function update(day: number, patch: Partial<DayRow>) {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === day ? { ...r, ...patch } : r)),
    );
    setSaved(false);
  }

  function dayName(d: number) {
    return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
      new Date(2024, 0, 7 + d),
    );
  }

  function save() {
    start(async () => {
      setSaved(false);
      const hours = rows
        .filter((r) => r.enabled)
        .map((r) => ({
          dayOfWeek: r.dayOfWeek,
          startTime: r.startTime,
          endTime: r.endTime,
        }));
      const result = await saveWorkingHoursAction({
        practitionerId,
        clinicId,
        hours,
      });
      if (result.ok) setSaved(true);
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <h3 className="font-serif text-lg text-ink">{title}</h3>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.dayOfWeek} className="flex flex-wrap items-center gap-3">
            <label className="flex w-36 items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={r.enabled}
                onChange={(e) =>
                  update(r.dayOfWeek, { enabled: e.target.checked })
                }
                className="h-4 w-4 accent-gold"
              />
              {dayName(r.dayOfWeek)}
            </label>
            <input
              type="time"
              value={r.startTime}
              disabled={!r.enabled}
              onChange={(e) =>
                update(r.dayOfWeek, { startTime: e.target.value })
              }
              className="h-9 rounded-lg border border-line px-2 text-sm disabled:opacity-40"
            />
            <span className="text-ink-muted">–</span>
            <input
              type="time"
              value={r.endTime}
              disabled={!r.enabled}
              onChange={(e) =>
                update(r.dayOfWeek, { endTime: e.target.value })
              }
              className="h-9 rounded-lg border border-line px-2 text-sm disabled:opacity-40"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? "…" : t("save")}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-4 w-4" />
            {t("saved")}
          </span>
        )}
      </div>
    </div>
  );
}

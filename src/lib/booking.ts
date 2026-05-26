import { prisma } from "@/lib/prisma";

/**
 * Booking availability logic.
 *
 * NOTE ON TIME ZONE: slot math runs in the server's local time. For correct
 * clinic-local times, run the app with TZ=Asia/Jerusalem (set TZ in the
 * environment / Vercel project settings).
 */

export const BUFFER_MINUTES = 15;
const SLOT_STEP_MINUTES = 15;
export const MAX_DAYS_AHEAD = 90;

export type Slot = { start: string; label: string };

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Available start times for a practitioner at a clinic on a given date. */
export async function getAvailableSlots(
  practitionerId: string,
  clinicId: string,
  durationMin: number,
  dateISO: string,
): Promise<Slot[]> {
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const dayOfWeek = date.getDay();
  const workingHours = await prisma.workingHours.findFirst({
    where: { practitionerId, clinicId, dayOfWeek },
  });
  if (!workingHours) return [];

  const [startH, startM] = workingHours.startTime.split(":").map(Number);
  const [endH, endM] = workingHours.endTime.split(":").map(Number);

  const dayStart = new Date(date);
  dayStart.setHours(startH, startM, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(endH, endM, 0, 0);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // The practitioner cannot be in two places at once → check across clinics.
  const [bookings, timeOff] = await Promise.all([
    prisma.booking.findMany({
      where: {
        practitionerId,
        status: { in: ["REQUESTED", "APPROVED"] },
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.timeOff.findMany({
      where: {
        practitionerId,
        startsAt: { lte: endOfDay },
        endsAt: { gte: startOfDay },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  const busy = [...bookings, ...timeOff].map((b) => ({
    start: new Date(b.startsAt).getTime() - BUFFER_MINUTES * 60000,
    end: new Date(b.endsAt).getTime() + BUFFER_MINUTES * 60000,
  }));

  const slots: Slot[] = [];
  const now = Date.now();

  for (
    let t = dayStart.getTime();
    t + durationMin * 60000 <= dayEnd.getTime();
    t += SLOT_STEP_MINUTES * 60000
  ) {
    const slotStart = t;
    const slotEnd = t + durationMin * 60000;
    if (slotStart < now) continue;

    const overlaps = busy.some(
      (b) => slotStart < b.end && slotEnd > b.start,
    );
    if (overlaps) continue;

    const d = new Date(slotStart);
    slots.push({
      start: d.toISOString(),
      label: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    });
  }

  return slots;
}

/** True if a specific start time is still bookable (re-checked at confirm). */
export async function isSlotAvailable(
  practitionerId: string,
  clinicId: string,
  durationMin: number,
  startISO: string,
): Promise<boolean> {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return false;

  const dateISO = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
    start.getDate(),
  )}`;
  const slots = await getAvailableSlots(
    practitionerId,
    clinicId,
    durationMin,
    dateISO,
  );
  return slots.some((s) => new Date(s.start).getTime() === start.getTime());
}

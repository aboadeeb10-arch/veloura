"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAvailableSlots,
  isSlotAvailable,
  MAX_DAYS_AHEAD,
  type Slot,
} from "@/lib/booking";
import { sendEmail, emailLayout } from "@/lib/mail";

export type BookingState = {
  ok: boolean;
  error?: string;
  bookingId?: string;
} | null;

/** Called imperatively from the booking flow to fetch a day's free slots. */
export async function getSlotsAction(input: {
  practitionerId: string;
  clinicId: string;
  durationMin: number;
  dateISO: string;
}): Promise<Slot[]> {
  try {
    return await getAvailableSlots(
      input.practitionerId,
      input.clinicId,
      input.durationMin,
      input.dateISO,
    );
  } catch {
    return [];
  }
}

export async function createBookingAction(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "signInRequired" };

  const serviceId = String(formData.get("serviceId") ?? "");
  const clinicId = String(formData.get("clinicId") ?? "");
  const startISO = String(formData.get("start") ?? "");
  const notes = String(formData.get("notes") ?? "")
    .trim()
    .slice(0, 500);

  if (!serviceId || !clinicId || !startISO) {
    return { ok: false, error: "generic" };
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { practitioner: { include: { clinics: true } } },
    });
    if (!service || !service.isActive) {
      return { ok: false, error: "generic" };
    }

    const validClinic = service.practitioner.clinics.some(
      (c) => c.clinicId === clinicId,
    );
    if (!validClinic) return { ok: false, error: "invalidClinic" };

    const start = new Date(startISO);
    const now = Date.now();
    if (
      Number.isNaN(start.getTime()) ||
      start.getTime() < now ||
      start.getTime() > now + MAX_DAYS_AHEAD * 86400000
    ) {
      return { ok: false, error: "invalidTime" };
    }

    const available = await isSlotAvailable(
      service.practitionerId,
      clinicId,
      service.durationMin,
      startISO,
    );
    if (!available) return { ok: false, error: "slotTaken" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return { ok: false, error: "generic" };

    const basePrice = Number(service.price);
    // First-signup 20% discount applies to treatments only, once.
    const applyDiscount = !user.firstSignupDiscountUsed;
    const priceAtBooking = applyDiscount
      ? Math.round(basePrice * 0.8)
      : basePrice;

    const end = new Date(start.getTime() + service.durationMin * 60000);

    const booking = await prisma.booking.create({
      data: {
        customerId: user.id,
        serviceId: service.id,
        practitionerId: service.practitionerId,
        clinicId,
        startsAt: start,
        endsAt: end,
        status: "REQUESTED",
        priceAtBooking,
        firstSignupDiscountApplied: applyDiscount,
        notes: notes || null,
      },
    });

    if (applyDiscount) {
      await prisma.user.update({
        where: { id: user.id },
        data: { firstSignupDiscountUsed: true },
      });
    }

    await sendEmail({
      to: user.email,
      subject: "Appointment request received — Veloura",
      html: emailLayout(
        "Appointment request received",
        `<p>Thank you, ${user.name}.</p>
         <p>We've received your appointment request. The practitioner will review and confirm it shortly — you'll get another email once it's approved.</p>
         <p style="color:#8A8073">Payment is made in person at the clinic (cash or card) after your treatment.</p>`,
      ),
    }).catch(() => undefined);

    return { ok: true, bookingId: booking.id };
  } catch (error) {
    console.error("[createBooking]", error);
    return { ok: false, error: "generic" };
  }
}

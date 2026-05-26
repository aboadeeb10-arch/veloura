"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Customer cancels their own booking — allowed up to 24h before the start. */
export async function cancelBookingAction(
  bookingId: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "auth" };

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.customerId !== session.user.id) {
      return { ok: false, error: "notFound" };
    }
    if (booking.status !== "REQUESTED" && booking.status !== "APPROVED") {
      return { ok: false, error: "status" };
    }
    if (new Date(booking.startsAt).getTime() < Date.now() + DAY_MS) {
      return { ok: false, error: "tooLate" };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    // Restore the one-time first-visit discount if it was applied here.
    if (booking.firstSignupDiscountApplied) {
      await prisma.user.update({
        where: { id: booking.customerId },
        data: { firstSignupDiscountUsed: false },
      });
    }

    return { ok: true };
  } catch (error) {
    console.error("[cancelBooking]", error);
    return { ok: false, error: "generic" };
  }
}

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/rewards";
import { sendEmail, emailLayout } from "@/lib/mail";

type Result = { ok: boolean; error?: string };

async function staffSession() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")
  ) {
    return null;
  }
  return session;
}

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

async function practitionerForUser(userId: string) {
  return prisma.practitioner.findUnique({ where: { userId } });
}

// ---------------------------------------------------------------- bookings

async function canActOnBooking(
  session: NonNullable<Awaited<ReturnType<typeof staffSession>>>,
  practitionerId: string,
) {
  if (session.user.role === "ADMIN") return true;
  const practitioner = await practitionerForUser(session.user.id);
  return practitioner?.id === practitionerId;
}

export async function setBookingStatusAction(
  bookingId: string,
  status: "APPROVED" | "DECLINED" | "COMPLETED",
): Promise<Result> {
  const session = await staffSession();
  if (!session) return { ok: false, error: "auth" };

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, service: true },
    });
    if (!booking) return { ok: false, error: "notFound" };
    if (!(await canActOnBooking(session, booking.practitionerId))) {
      return { ok: false, error: "forbidden" };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (status === "COMPLETED") {
      await awardPoints({
        userId: booking.customerId,
        amount: Number(booking.priceAtBooking),
        bookingId: booking.id,
        description: "Treatment completed",
      });
    }

    if (status === "DECLINED" && booking.firstSignupDiscountApplied) {
      await prisma.user.update({
        where: { id: booking.customerId },
        data: { firstSignupDiscountUsed: false },
      });
    }

    if (status === "APPROVED" || status === "DECLINED") {
      await sendEmail({
        to: booking.customer.email,
        subject:
          status === "APPROVED"
            ? "Your appointment is confirmed — Veloura"
            : "Update on your appointment request — Veloura",
        html: emailLayout(
          status === "APPROVED"
            ? "Appointment confirmed"
            : "Appointment request declined",
          status === "APPROVED"
            ? `<p>Good news — your appointment has been confirmed. We look forward to seeing you.</p>`
            : `<p>Unfortunately we couldn't confirm your requested time. Please book another slot — we'd love to see you.</p>`,
        ),
      }).catch(() => undefined);
    }

    return { ok: true };
  } catch (error) {
    console.error("[setBookingStatus]", error);
    return { ok: false, error: "generic" };
  }
}

// ------------------------------------------------------------------ orders

export async function setOrderStatusAction(
  orderId: string,
  status: "NEW" | "DONE" | "CANCELLED" | "REFUNDED",
): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: "forbidden" };

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { ok: false, error: "notFound" };

    await prisma.order.update({ where: { id: orderId }, data: { status } });

    // Award loyalty points when an order is completed (registered customers).
    if (status === "DONE" && order.status !== "DONE" && order.customerId) {
      await awardPoints({
        userId: order.customerId,
        amount: Number(order.total),
        orderId: order.id,
        description: "Order completed",
      });
    }

    return { ok: true };
  } catch (error) {
    console.error("[setOrderStatus]", error);
    return { ok: false, error: "generic" };
  }
}

// ---------------------------------------------------------------- products

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return `${base || "product"}-${Math.random().toString(36).slice(2, 7)}`;
}

function readLocalized(formData: FormData, prefix: string) {
  return {
    he: String(formData.get(`${prefix}He`) ?? "").trim(),
    ar: String(formData.get(`${prefix}Ar`) ?? "").trim(),
    ru: String(formData.get(`${prefix}Ru`) ?? "").trim(),
    en: String(formData.get(`${prefix}En`) ?? "").trim(),
  };
}

export async function saveProductAction(formData: FormData): Promise<Result> {
  const session = await staffSession();
  if (!session) return { ok: false, error: "auth" };

  try {
    const id = String(formData.get("id") ?? "");
    const name = readLocalized(formData, "name");
    const description = readLocalized(formData, "desc");
    const categoryId = String(formData.get("categoryId") ?? "");
    const regularPrice = Number(formData.get("regularPrice") ?? 0);
    const discountedPrice = Number(formData.get("discountedPrice") ?? 0);
    const stock = Math.max(0, Math.floor(Number(formData.get("stock") ?? 0)));
    const image = String(formData.get("image") ?? "").trim();
    const isFeatured = formData.get("isFeatured") === "on";
    const isActive = formData.get("isActive") === "on";

    if (!name.en && !name.he) return { ok: false, error: "name" };
    if (!categoryId || regularPrice <= 0 || discountedPrice <= 0) {
      return { ok: false, error: "fields" };
    }

    const data = {
      name,
      description,
      categoryId,
      regularPrice,
      discountedPrice,
      stock,
      images: image ? [image] : [],
      isFeatured,
      isActive,
    };

    if (id) {
      await prisma.product.update({ where: { id }, data });
    } else {
      await prisma.product.create({
        data: {
          ...data,
          slug: slugify(name.en || name.he),
          createdById: session.user.id,
        },
      });
    }
    return { ok: true };
  } catch (error) {
    console.error("[saveProduct]", error);
    return { ok: false, error: "generic" };
  }
}

export async function deleteProductAction(
  productId: string,
): Promise<Result> {
  const session = await staffSession();
  if (!session) return { ok: false, error: "auth" };
  try {
    await prisma.product.delete({ where: { id: productId } });
    return { ok: true };
  } catch (error) {
    console.error("[deleteProduct]", error);
    return { ok: false, error: "generic" };
  }
}

// --------------------------------------------------------------- schedule

export async function saveWorkingHoursAction(input: {
  practitionerId: string;
  clinicId: string;
  hours: { dayOfWeek: number; startTime: string; endTime: string }[];
}): Promise<Result> {
  const session = await staffSession();
  if (!session) return { ok: false, error: "auth" };

  try {
    if (session.user.role === "EDITOR") {
      const practitioner = await practitionerForUser(session.user.id);
      if (!practitioner || practitioner.id !== input.practitionerId) {
        return { ok: false, error: "forbidden" };
      }
    }

    await prisma.workingHours.deleteMany({
      where: {
        practitionerId: input.practitionerId,
        clinicId: input.clinicId,
      },
    });

    const valid = input.hours.filter(
      (h) => h.startTime && h.endTime && h.startTime < h.endTime,
    );
    if (valid.length) {
      await prisma.workingHours.createMany({
        data: valid.map((h) => ({
          practitionerId: input.practitionerId,
          clinicId: input.clinicId,
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
        })),
      });
    }
    return { ok: true };
  } catch (error) {
    console.error("[saveWorkingHours]", error);
    return { ok: false, error: "generic" };
  }
}

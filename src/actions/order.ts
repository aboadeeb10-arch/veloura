"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/mail";

export type OrderInput = {
  items: { productId: string; variantId: string | null; qty: number }[];
  pickupClinicId: string;
  contact: { name: string; email: string; phone: string };
  promoCode?: string;
  usePoints?: boolean;
};

export type OrderResult = {
  ok: boolean;
  error?: string;
  orderId?: string;
  orderRef?: string;
};

function orderRef(id: string): string {
  return id.slice(-8).toUpperCase();
}

/** Validate a promo code for product orders (preview for the checkout UI). */
export async function checkPromoAction(
  code: string,
): Promise<{ ok: boolean; kind?: "PERCENT" | "FIXED"; value?: number }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false };
  try {
    const promo = await prisma.promoCode.findUnique({
      where: { code: normalized },
    });
    if (
      !promo ||
      !promo.isActive ||
      promo.scope === "TREATMENTS" ||
      (promo.expiresAt && promo.expiresAt < new Date()) ||
      (promo.maxUses != null && promo.usedCount >= promo.maxUses)
    ) {
      return { ok: false };
    }
    return {
      ok: true,
      kind: promo.kind as "PERCENT" | "FIXED",
      value: Number(promo.value),
    };
  } catch {
    return { ok: false };
  }
}

export async function placeOrderAction(
  input: OrderInput,
): Promise<OrderResult> {
  if (!input.items?.length) return { ok: false, error: "errorEmpty" };
  if (!input.pickupClinicId) return { ok: false, error: "errorGeneric" };

  try {
    const session = await auth().catch(() => null);
    const userId = session?.user?.id ?? null;

    const productIds = [...new Set(input.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });

    type Line = {
      productId: string;
      variantId: string | null;
      nameSnapshot: unknown;
      qty: number;
      unitPrice: number;
    };
    const lines: Line[] = [];

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return { ok: false, error: "errorStock" };
      const qty = Math.max(1, Math.min(99, Math.floor(item.qty)));

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant || variant.stock < qty) {
          return { ok: false, error: "errorStock" };
        }
        lines.push({
          productId: product.id,
          variantId: variant.id,
          nameSnapshot: product.name,
          qty,
          unitPrice:
            variant.priceOverride != null
              ? Number(variant.priceOverride)
              : Number(product.discountedPrice),
        });
      } else {
        if (product.stock < qty) return { ok: false, error: "errorStock" };
        lines.push({
          productId: product.id,
          variantId: null,
          nameSnapshot: product.name,
          qty,
          unitPrice: Number(product.discountedPrice),
        });
      }
    }

    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

    // ---- Promo code ----
    let discountTotal = 0;
    let promoCodeId: string | null = null;
    if (input.promoCode) {
      const code = input.promoCode.trim().toUpperCase();
      const promo = await prisma.promoCode.findUnique({ where: { code } });
      if (
        promo &&
        promo.isActive &&
        promo.scope !== "TREATMENTS" &&
        (!promo.expiresAt || promo.expiresAt >= new Date()) &&
        (promo.maxUses == null || promo.usedCount < promo.maxUses)
      ) {
        promoCodeId = promo.id;
        discountTotal =
          promo.kind === "PERCENT"
            ? Math.round((subtotal * Number(promo.value)) / 100)
            : Math.min(subtotal, Number(promo.value));
      }
    }

    // ---- Loyalty points redemption ----
    let pointsRedeemed = 0;
    let pointsDiscount = 0;
    if (input.usePoints && userId) {
      const [account, config] = await Promise.all([
        prisma.rewardAccount.findUnique({ where: { userId } }),
        prisma.rewardConfig.findUnique({ where: { id: 1 } }),
      ]);
      const per = config?.redeemPointsPerUnit ?? 100;
      const unitValue = config ? Number(config.redeemUnitValue) : 10;
      const balance = account?.pointsBalance ?? 0;
      const remaining = Math.max(0, subtotal - discountTotal);
      const maxValue = Math.floor(balance / per) * unitValue;
      pointsDiscount = Math.min(maxValue, remaining);
      pointsRedeemed = unitValue > 0 ? (pointsDiscount / unitValue) * per : 0;
    }

    const total = Math.max(0, subtotal - discountTotal - pointsDiscount);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId: userId,
          guestName: userId ? null : input.contact.name,
          guestEmail: userId ? null : input.contact.email,
          guestPhone: userId ? null : input.contact.phone,
          pickupClinicId: input.pickupClinicId,
          status: "NEW",
          paymentMethod: "CASH",
          subtotal,
          discountTotal: discountTotal + pointsDiscount,
          pointsRedeemed,
          total,
          promoCodeId,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              nameSnapshot: l.nameSnapshot as object,
              quantity: l.qty,
              unitPrice: l.unitPrice,
              lineTotal: l.unitPrice * l.qty,
            })),
          },
        },
      });

      for (const l of lines) {
        if (l.variantId) {
          await tx.productVariant.update({
            where: { id: l.variantId },
            data: { stock: { decrement: l.qty } },
          });
        } else {
          await tx.product.update({
            where: { id: l.productId },
            data: { stock: { decrement: l.qty } },
          });
        }
      }

      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (pointsRedeemed > 0 && userId) {
        const account = await tx.rewardAccount.findUnique({
          where: { userId },
        });
        if (account && account.pointsBalance >= pointsRedeemed) {
          await tx.rewardAccount.update({
            where: { id: account.id },
            data: {
              pointsBalance: { decrement: pointsRedeemed },
              lastActivityAt: new Date(),
            },
          });
          await tx.rewardTransaction.create({
            data: {
              accountId: account.id,
              type: "REDEEM",
              points: -pointsRedeemed,
              description: "Points redeemed on order",
              orderId: created.id,
            },
          });
        }
      }

      return created;
    });

    const email = userId
      ? (await prisma.user.findUnique({ where: { id: userId } }))?.email
      : input.contact.email;
    if (email) {
      await sendEmail({
        to: email,
        subject: "Order received — Veloura",
        html: emailLayout(
          "Order received",
          `<p>Thank you! Your order <strong>#${orderRef(order.id)}</strong> has been received.</p>
           <p>It will be prepared for pickup at the clinic. Payment is made in person at pickup — cash or card.</p>`,
        ),
      }).catch(() => undefined);
    }

    return { ok: true, orderId: order.id, orderRef: orderRef(order.id) };
  } catch (error) {
    console.error("[placeOrder]", error);
    return { ok: false, error: "errorGeneric" };
  }
}

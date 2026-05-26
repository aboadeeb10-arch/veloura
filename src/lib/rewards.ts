import { prisma } from "@/lib/prisma";

/**
 * Loyalty rewards engine.
 * Earn rule: earnRatePercent% of the amount spent → whole points.
 * Redeem rule: redeemPointsPerUnit points → redeemUnitValue (₪).
 * Both values are admin-configurable via the RewardConfig singleton.
 */

async function getConfig() {
  const config = await prisma.rewardConfig.findUnique({ where: { id: 1 } });
  return {
    earnRatePercent: config ? Number(config.earnRatePercent) : 5,
    redeemPointsPerUnit: config?.redeemPointsPerUnit ?? 100,
    redeemUnitValue: config ? Number(config.redeemUnitValue) : 10,
  };
}

/** Award loyalty points to a customer for a completed booking or order. */
export async function awardPoints(opts: {
  userId: string;
  amount: number;
  bookingId?: string;
  orderId?: string;
  description?: string;
}): Promise<number> {
  const { earnRatePercent } = await getConfig();
  const points = Math.floor((opts.amount * earnRatePercent) / 100);
  if (points <= 0) return 0;

  const account = await prisma.rewardAccount.upsert({
    where: { userId: opts.userId },
    update: {},
    create: { userId: opts.userId },
  });

  await prisma.$transaction([
    prisma.rewardTransaction.create({
      data: {
        accountId: account.id,
        type: "EARN",
        points,
        description: opts.description ?? "Points earned",
        bookingId: opts.bookingId,
        orderId: opts.orderId,
      },
    }),
    prisma.rewardAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: { increment: points },
        lastActivityAt: new Date(),
      },
    }),
  ]);

  return points;
}

/** The ₪ discount value obtainable from a points balance. */
export async function maxPointsDiscount(balance: number): Promise<number> {
  const { redeemPointsPerUnit, redeemUnitValue } = await getConfig();
  return Math.floor(balance / redeemPointsPerUnit) * redeemUnitValue;
}

/** Points consumed for a given ₪ discount value. */
export async function pointsForDiscount(discountValue: number): Promise<number> {
  const { redeemPointsPerUnit, redeemUnitValue } = await getConfig();
  if (redeemUnitValue <= 0) return 0;
  return Math.round((discountValue / redeemUnitValue) * redeemPointsPerUnit);
}

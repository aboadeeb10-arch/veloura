import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

function newToken(): string {
  return randomBytes(32).toString("hex");
}

const HOUR = 1000 * 60 * 60;

/** Create (replacing any existing) an email verification token, valid 24h. */
export async function createVerificationToken(email: string): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { email } });
  const token = newToken();
  await prisma.verificationToken.create({
    data: { email, token, expiresAt: new Date(Date.now() + 24 * HOUR) },
  });
  return token;
}

/** Consume a verification token, marking the user's email as verified. */
export async function consumeVerificationToken(
  token: string,
): Promise<{ ok: boolean }> {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!record || record.expiresAt < new Date()) return { ok: false };

  await prisma.user.updateMany({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({
    where: { email: record.email },
  });
  return { ok: true };
}

/** Create (replacing any existing) a password-reset token, valid 1h. */
export async function createPasswordResetToken(
  email: string,
): Promise<string> {
  await prisma.passwordResetToken.deleteMany({ where: { email } });
  const token = newToken();
  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt: new Date(Date.now() + HOUR) },
  });
  return token;
}

/** Look up a valid password-reset token; returns the email or null. */
export async function readPasswordResetToken(
  token: string,
): Promise<string | null> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });
  if (!record || record.expiresAt < new Date()) return null;
  return record.email;
}

export async function clearPasswordResetTokens(email: string): Promise<void> {
  await prisma.passwordResetToken.deleteMany({ where: { email } });
}

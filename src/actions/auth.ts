"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import {
  createVerificationToken,
  createPasswordResetToken,
  readPasswordResetToken,
  clearPasswordResetTokens,
} from "@/lib/tokens";
import { sendEmail, emailLayout, siteUrl } from "@/lib/mail";

export type ActionState = { ok: boolean; error?: string } | null;

const signUpSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(6),
  password: z.string().min(8),
});

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "")
      .toLowerCase()
      .trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const confirm = String(formData.get("confirmPassword") ?? "");

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ok: false, error: field === "password" ? "errorWeak" : "errorGeneric" };
  }
  if (parsed.data.password !== confirm) {
    return { ok: false, error: "errorMismatch" };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) return { ok: false, error: "errorEmailExists" };

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        passwordHash,
        rewardAccount: { create: {} },
      },
    });

    const token = await createVerificationToken(user.email);
    const url = `${siteUrl()}/verify-email?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your email — Veloura",
      html: emailLayout(
        "Verify your email",
        `<p>Welcome to Veloura!</p>
         <p>Please confirm your email address to activate your account:</p>
         <p><a href="${url}" style="color:#9A7E56;font-weight:bold">Verify my email</a></p>
         <p style="color:#8A8073">Or paste this link into your browser:<br>${url}</p>`,
      ),
    });

    return { ok: true };
  } catch (error) {
    console.error("[signUp]", error);
    return { ok: false, error: "errorGeneric" };
  }
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "errorInvalid" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerified) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (valid) return { ok: false, error: "errorNotVerified" };
    }

    await signIn("credentials", { email, password, redirect: false });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "errorInvalid" };
    }
    console.error("[signIn]", error);
    return { ok: false, error: "errorGeneric" };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  if (email) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const token = await createPasswordResetToken(email);
        const url = `${siteUrl()}/reset-password?token=${token}`;
        await sendEmail({
          to: email,
          subject: "Reset your password — Veloura",
          html: emailLayout(
            "Reset your password",
            `<p>We received a request to reset your password.</p>
             <p><a href="${url}" style="color:#9A7E56;font-weight:bold">Choose a new password</a></p>
             <p style="color:#8A8073">If you didn't request this, you can ignore this email.</p>`,
          ),
        });
      }
    } catch (error) {
      console.error("[requestPasswordReset]", error);
    }
  }
  // Always report success so account existence is not revealed.
  return { ok: true };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) return { ok: false, error: "errorWeak" };
  if (password !== confirm) return { ok: false, error: "errorMismatch" };

  try {
    const email = await readPasswordResetToken(token);
    if (!email) return { ok: false, error: "verifyError" };

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.updateMany({ where: { email }, data: { passwordHash } });
    await clearPasswordResetTokens(email);
    return { ok: true };
  } catch (error) {
    console.error("[resetPassword]", error);
    return { ok: false, error: "errorGeneric" };
  }
}

import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Veloura <onboarding@resend.dev>";

/**
 * Send a transactional email. If RESEND_API_KEY is not configured the email
 * is logged to the server console instead (handy in local development).
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; dev?: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(
      `\n[mail:dev] (no RESEND_API_KEY set)\n  To: ${to}\n  Subject: ${subject}\n  ${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`,
    );
    return { ok: true, dev: true };
  }
  try {
    const resend = new Resend(key);
    await resend.emails.send({ from: FROM, to, subject, html });
    return { ok: true };
  } catch (error) {
    console.error("[mail] send failed:", error);
    return { ok: false };
  }
}

/** Wrap email body content in the Veloura branded layout. */
export function emailLayout(title: string, body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#FAF6EF;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #EAE0CF">
    <p style="font-size:22px;color:#2E2A24;margin:0 0 4px;letter-spacing:1px">Veloura</p>
    <h2 style="font-size:18px;color:#2E2A24;margin:16px 0 12px">${title}</h2>
    <div style="color:#5B5347;font-size:14px;line-height:1.7">${body}</div>
    <p style="color:#8A8073;font-size:12px;margin-top:28px">Veloura — Haifa &amp; Umm al-Fahem</p>
  </div>
</div>`;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

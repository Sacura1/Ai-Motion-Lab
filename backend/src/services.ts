import type pg from "pg";
import { z } from "zod";
import { catalog, env, emailConfigured } from "./config.js";
import { transaction, type Order } from "./db.js";
import { hashToken, newToken } from "./security.js";
import { grantsAccess } from "./payment.js";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function paystack(path: string, body?: unknown) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const payload = (await response.json()) as { status: boolean; data: unknown };
  if (!response.ok || !payload.status)
    throw new HttpError(
      502,
      "Unable to reach Paystack. Please try again shortly.",
    );
  return payload.data;
}
export const paymentSchema = z.object({
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  reference: z.string(),
});
export async function enqueueAccess(
  client: pg.PoolClient,
  order: Order,
  confirmation: boolean,
) {
  if (!emailConfigured()) return;
  const dedupe = confirmation
    ? `confirmation-${order.reference}`
    : `recovery-${newToken()}`;
  if (
    confirmation &&
    (
      await client.query("SELECT id FROM email_outbox WHERE dedupe_key=$1", [
        dedupe,
      ])
    ).rowCount
  )
    return;
  const token = newToken();
  const expiry = new Date(Date.now() + (confirmation ? 24 * 60 : 30) * 60000);
  await client.query(
    "INSERT INTO access_tokens(token_hash,reference,expires_at) VALUES($1,$2,$3)",
    [hashToken(token), order.reference, expiry],
  );
  const url = new URL("/access", env.FRONTEND_URL);
  url.hash = `token=${token}`;
  const text = `${confirmation ? "Your payment is confirmed." : "Here is your requested access link."}\n\nProgram: ${catalog[order.track].name}\n\nGet your Telegram invitation: ${url.href}\n\nThis link can be used once and expires in ${confirmation ? "24 hours" : "30 minutes"}. You can request another at ${new URL("/access", env.FRONTEND_URL).href}.\n\nAI Motion Lab`;
  await client.query(
    "INSERT INTO email_outbox(dedupe_key,recipient,subject,body,expires_at) VALUES($1,$2,$3,$4,$5)",
    [
      dedupe,
      order.email,
      `${confirmation ? "You’re enrolled" : "Your access link"} — AI Motion Lab ${catalog[order.track].name}`,
      text,
      expiry,
    ],
  );
}
export async function confirmPayment(data: z.infer<typeof paymentSchema>) {
  return transaction(async (client) => {
    const order = (
      await client.query<Order>(
        "SELECT * FROM enrollments WHERE reference=$1 FOR UPDATE",
        [data.reference],
      )
    ).rows[0];
    if (!order)
      throw new HttpError(
        404,
        "Enrollment not found. Please contact the program organizer with your payment details.",
      );
    if (!grantsAccess(data, order))
      throw new HttpError(
        409,
        "Payment is not confirmed for this enrollment. If you just paid, wait a moment and check again.",
      );
    await client.query(
      "UPDATE enrollments SET status='paid',paid_at=COALESCE(paid_at,now()) WHERE reference=$1",
      [order.reference],
    );
    await enqueueAccess(client, order, true);
    return order.reference;
  });
}
async function invitation(client: pg.PoolClient, reference: string) {
  const order = (
    await client.query<Order>(
      "SELECT * FROM enrollments WHERE reference=$1 FOR UPDATE",
      [reference],
    )
  ).rows[0];
  if (!order || order.status !== "paid")
    throw new HttpError(403, "A confirmed enrollment is required.");
  if (
    order.invite_url &&
    order.invite_expires_at &&
    order.invite_expires_at.getTime() > Date.now() + 60000
  )
    return { telegramUrl: order.invite_url, track: catalog[order.track].name };
  const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/createChatInviteLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: order.chat_id,
        name: `AML ${reference.slice(0, 20)}`,
        expire_date: expires,
        member_limit: 1,
      }),
      signal: AbortSignal.timeout(15000),
    },
  );
  const data = (await response.json()) as {
    ok: boolean;
    result?: { invite_link: string };
  };
  if (!response.ok || !data.ok || !data.result)
    throw new HttpError(
      503,
      "Your payment is confirmed, but Telegram is temporarily unavailable. Please keep this page open and retry shortly.",
    );
  const url = new URL(data.result.invite_link);
  if (url.protocol !== "https:" || url.hostname !== "t.me")
    throw new Error("Invalid Telegram response");
  await client.query(
    "UPDATE enrollments SET invite_url=$2,invite_expires_at=$3 WHERE reference=$1",
    [reference, url.href, new Date(expires * 1000)],
  );
  return { telegramUrl: url.href, track: catalog[order.track].name };
}
export const getInvitation = (reference: string) =>
  transaction((client) => invitation(client, reference));
export const redeemAccess = (token: string) =>
  transaction(async (client) => {
    const result = await client.query<{ reference: string }>(
      "SELECT reference FROM access_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE",
      [hashToken(token)],
    );
    if (!result.rows[0])
      throw new HttpError(
        410,
        "This link has expired or has already been used. Use the access help option below.",
      );
    const resultInvite = await invitation(client, result.rows[0].reference);
    await client.query(
      "UPDATE access_tokens SET used_at=now() WHERE token_hash=$1",
      [hashToken(token)],
    );
    return resultInvite;
  });
export async function deliverEmailBatch() {
  if (!env.DATABASE_URL || !emailConfigured()) return;
  for (let i = 0; i < 5; i++) {
    const processed = await transaction(async (client) => {
      const job = (
        await client.query<{
          id: string;
          dedupe_key: string;
          recipient: string;
          subject: string;
          body: string;
        }>(
          "SELECT * FROM email_outbox WHERE sent_at IS NULL AND body IS NOT NULL AND next_attempt_at<=now() AND expires_at>now()+interval '2 minutes' AND attempts<12 ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1",
        )
      ).rows[0];
      if (!job) return false;
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
            "Idempotency-Key": job.dedupe_key,
          },
          body: JSON.stringify({
            from: env.EMAIL_FROM,
            to: [job.recipient],
            subject: job.subject,
            text: job.body,
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error("Email provider failed");
        await client.query(
          "UPDATE email_outbox SET sent_at=now(),body=NULL WHERE id=$1",
          [job.id],
        );
      } catch {
        await client.query(
          "UPDATE email_outbox SET attempts=attempts+1,next_attempt_at=now()+interval '2 minutes' WHERE id=$1",
          [job.id],
        );
        console.error("Email queued for retry.");
      }
      return true;
    });
    if (!processed) break;
  }
}

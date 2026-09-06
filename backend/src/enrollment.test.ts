import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { pool } from "./db.js";
import { schema } from "./schema.js";
import { confirmPayment, getInvitation, redeemAccess } from "./services.js";
import { hashToken } from "./security.js";
import { env, serviceCapabilities } from "./config.js";

test("checkout configuration does not require email delivery", () => {
  const config = {
    ...env,
    DATABASE_URL: "postgres://test",
    PAYSTACK_SECRET_KEY: "test",
    TELEGRAM_BOT_TOKEN: "test",
    TELEGRAM_CREATOR_CHAT_ID: "creator",
    TELEGRAM_MASTERCLASS_CHAT_ID: "masterclass",
    RESEND_API_KEY: "",
    EMAIL_FROM: "",
  };
  assert.deepEqual(serviceCapabilities(config), {
    checkout: true,
    email: false,
  });
  assert.equal(
    serviceCapabilities({ ...config, RESEND_API_KEY: "test" }).email,
    false,
  );
  assert.equal(
    serviceCapabilities({
      ...config,
      RESEND_API_KEY: "test",
      EMAIL_FROM: "test@example.com",
    }).email,
    true,
  );
  assert.equal(
    serviceCapabilities({ ...config, PAYSTACK_SECRET_KEY: "" }).checkout,
    false,
  );
});

test("PostgreSQL enrollment flow: payment guards, deduplication, invites and single-use recovery", async () => {
  const db = new PGlite();
  await db.exec(schema);
  // Execute the production SQL in an isolated PostgreSQL engine. External
  // network services are mocked; no Railway data, payments or emails are used.
  const originalConnect = pool.connect;
  Object.defineProperty(pool, "connect", {
    configurable: true,
    value: async () => ({
      query: async (sql: string, params?: unknown[]) => {
        const result = await db.query(sql, params);
        return {
          ...result,
          rowCount: result.rows.length || result.affectedRows || 0,
        };
      },
      release: () => {},
    }),
  });
  const originalFetch = globalThis.fetch;
  const originalEmail = {
    RESEND_API_KEY: env.RESEND_API_KEY,
    EMAIL_FROM: env.EMAIL_FROM,
  };
  env.RESEND_API_KEY = "";
  env.EMAIL_FROM = "";
  let inviteCalls = 0;
  globalThis.fetch = async () => {
    inviteCalls++;
    return new Response(
      JSON.stringify({
        ok: true,
        result: { invite_link: "https://t.me/+test-invitation" },
      }),
      { status: 200 },
    );
  };
  try {
    await db.query(
      "INSERT INTO enrollments(reference,name,email,track,amount,currency,chat_id) VALUES('test-reference','Test Buyer','buyer@example.com','creator',2000000,'NGN','test-chat')",
    );
    const paid = {
      reference: "test-reference",
      status: "success",
      amount: 2000000,
      currency: "NGN",
    };
    await assert.rejects(
      () => getInvitation("test-reference"),
      /confirmed enrollment/,
    );
    for (const change of [
      { amount: 1 },
      { currency: "USD" },
      { status: "pending" },
    ])
      await assert.rejects(
        () => confirmPayment({ ...paid, ...change }),
        /not confirmed/,
      );
    assert.equal(
      (await db.query<{ status: string }>("SELECT status FROM enrollments"))
        .rows[0].status,
      "pending",
    );
    await confirmPayment(paid);
    await confirmPayment(paid);
    assert.equal((await db.query("SELECT * FROM email_outbox")).rows.length, 0);
    assert.equal(
      (await db.query("SELECT * FROM access_tokens")).rows.length,
      0,
    );
    const withoutEmail = await getInvitation("test-reference");
    assert.equal(withoutEmail.telegramUrl, "https://t.me/+test-invitation");
    assert.equal(
      (await db.query<{ status: string }>("SELECT status FROM enrollments"))
        .rows[0].status,
      "paid",
    );
    // Enable email and repeat confirmation to cover optional delivery as well.
    env.RESEND_API_KEY = "test-only";
    env.EMAIL_FROM = "test@example.com";
    await confirmPayment(paid);
    await confirmPayment(paid);
    assert.equal((await db.query("SELECT * FROM email_outbox")).rows.length, 1);
    assert.equal(
      (await db.query("SELECT * FROM access_tokens")).rows.length,
      1,
    );
    const invitation = await getInvitation("test-reference");
    assert.equal(invitation.track, "Creator");
    assert.equal(invitation.telegramUrl, "https://t.me/+test-invitation");
    await getInvitation("test-reference");
    assert.equal(inviteCalls, 1);
    const token = "a".repeat(64);
    await db.query(
      "INSERT INTO access_tokens(token_hash,reference,expires_at) VALUES($1,'test-reference',now()+interval '30 minutes')",
      [hashToken(token)],
    );
    assert.equal(
      (await redeemAccess(token)).telegramUrl,
      invitation.telegramUrl,
    );
    await assert.rejects(
      () => redeemAccess(token),
      /expired or has already been used/,
    );
    await db.query(
      "INSERT INTO access_tokens(token_hash,reference,expires_at) VALUES($1,'test-reference',now()-interval '1 minute')",
      [hashToken("expired")],
    );
    await assert.rejects(() => redeemAccess("expired"), /expired/);
    await db.query(
      "UPDATE enrollments SET invite_expires_at=now()-interval '1 minute'",
    );
    await getInvitation("test-reference");
    assert.equal(inviteCalls, 2);
  } finally {
    Object.defineProperty(pool, "connect", {
      configurable: true,
      value: originalConnect,
    });
    globalThis.fetch = originalFetch;
    Object.assign(env, originalEmail);
    await db.close();
    await pool.end();
  }
});

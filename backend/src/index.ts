import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { fileURLToPath } from "node:url";
import { catalog, configured, env, emailConfigured } from "./config.js";
import { sameOrigin } from "./cors.js";
import { pool, transaction, type Order } from "./db.js";
import { newToken, validWebhook } from "./security.js";
import {
  confirmPayment,
  deliverEmailBatch,
  enqueueAccess,
  getInvitation,
  HttpError,
  paymentSchema,
  paystack,
  redeemAccess,
} from "./services.js";
export const app = express();
if (env.TRUST_PROXY_HOPS) app.set("trust proxy", env.TRUST_PROXY_HOPS);
app.use(helmet());
app.use("/api", (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !sameOrigin(origin, env.FRONTEND_URL)) {
    res.status(403).json({ error: "This website is not allowed to use the payment API." });
    return;
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.vary("Origin");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/offer", async (_req, res) => {
  let ready = configured;
  if (ready) {
    try {
      await pool.query("SELECT reference FROM enrollments LIMIT 0");
    } catch {
      ready = false;
    }
  }
  res.json({
    ready,
    emailEnabled: emailConfigured(),
    tracks: Object.entries(catalog).map(([id, t]) => ({
      id,
      name: t.name,
      amount: t.amount,
      currency: t.currency,
    })),
  });
});
app.post(
  "/api/paystack/webhook",
  express.raw({ type: "application/json", limit: "256kb" }),
  async (req, res) => {
    if (
      !Buffer.isBuffer(req.body) ||
      !validWebhook(
        req.body,
        req.headers["x-paystack-signature"],
        env.PAYSTACK_SECRET_KEY,
      )
    ) {
      res.sendStatus(401);
      return;
    }
    const event = z
      .object({ event: z.string(), data: z.unknown() })
      .parse(JSON.parse(req.body.toString()));
    if (event.event === "charge.success") {
      const data = paymentSchema.parse(event.data);
      const known = await pool.query(
        "SELECT reference FROM enrollments WHERE reference=$1",
        [data.reference],
      );
      if (known.rowCount) await confirmPayment(data);
    }
    res.sendStatus(200);
  },
);
app.use(express.json({ limit: "10kb" }));
app.use(
  ["/api/payments", "/api/access"],
  rateLimit({
    windowMs: 60000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many attempts. Please try again in a minute." },
  }),
);
app.use(["/api/payments", "/api/access"], (_req, _res, next) => {
  if (!configured)
    throw new HttpError(
      503,
      "Enrollment is not open yet. Please check back shortly.",
    );
  next();
});
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
app.post("/api/payments/initialize", async (req, res) => {
  const input = z
    .object({
      name: z.string().trim().min(1).max(100),
      email,
      track: z.enum(["creator", "masterclass"]),
    })
    .parse(req.body);
  const t = catalog[input.track];
  const reference = newToken();
  await pool.query(
    "INSERT INTO enrollments(reference,name,email,track,amount,currency,chat_id) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [
      reference,
      input.name,
      input.email,
      input.track,
      t.amount,
      t.currency,
      t.chatId,
    ],
  );
  const data = z.object({ authorization_url: z.string().url() }).parse(
    await paystack("/transaction/initialize", {
      email: input.email,
      amount: t.amount,
      currency: t.currency,
      reference,
      callback_url: new URL("/payment/callback", env.FRONTEND_URL).href,
      metadata: { track: input.track },
    }),
  );
  const url = new URL(data.authorization_url);
  if (url.protocol !== "https:" || url.hostname !== "checkout.paystack.com")
    throw new Error("Invalid checkout URL");
  res.json({ authorizationUrl: url.href });
});
app.post("/api/payments/verify", async (req, res) => {
  const { reference } = z
    .object({ reference: z.string().regex(/^[a-f0-9]{64}$/) })
    .parse(req.body);
  const order = await pool.query(
    "SELECT reference FROM enrollments WHERE reference=$1",
    [reference],
  );
  if (!order.rowCount)
    throw new HttpError(
      404,
      "Enrollment not found. Please contact the program organizer with your payment details.",
    );
  const data = paymentSchema.parse(
    await paystack(`/transaction/verify/${reference}`),
  );
  if (data.reference !== reference)
    throw new HttpError(409, "Payment reference did not match.");
  await confirmPayment(data);
  res.json(await getInvitation(reference));
});
app.post("/api/access/request", async (req, res) => {
  if (!emailConfigured())
    throw new HttpError(
      503,
      "Email recovery is unavailable. Please contact the program organizer with your checkout email and payment reference.",
    );
  const input = z.object({ email }).parse(req.body);
  await transaction(async (client) => {
    const allowed = await client.query(
      "INSERT INTO recovery_requests(email) VALUES($1) ON CONFLICT(email) DO UPDATE SET requested_at=now() WHERE recovery_requests.requested_at<now()-interval '5 minutes' RETURNING email",
      [input.email],
    );
    if (!allowed.rowCount) return;
    const orders = await client.query<Order>(
      "SELECT * FROM enrollments WHERE email=$1 AND status='paid' ORDER BY paid_at DESC LIMIT 10",
      [input.email],
    );
    for (const order of orders.rows) await enqueueAccess(client, order, false);
  });
  res.json({
    message:
      "If a paid enrollment matches, an access email will arrive shortly.",
  });
});
app.post("/api/access/redeem", async (req, res) => {
  const { token } = z
    .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
    .parse(req.body);
  res.json(await redeemAccess(token));
});
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});
const frontendDist = fileURLToPath(
  new URL("../../frontend/dist/", import.meta.url),
);
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.method !== "GET") {
    next();
    return;
  }
  res.sendFile("index.html", { root: frontendDist }, (error) => {
    if (error) next(error);
  });
});
const onError: express.ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof z.ZodError || error instanceof SyntaxError) {
    res.status(400).json({ error: "Please check your details and try again." });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error("API request failed.");
  res.status(503).json({
    error: "The service is temporarily unavailable. Please try again shortly.",
  });
};
app.use(onError);
const server = app.listen(env.PORT, () =>
  console.log(
    `API listening on port ${env.PORT}. Enrollment ${configured ? "configured" : "awaiting configuration"}.`,
  ),
);
let processing = false;
const worker = setInterval(() => {
  if (processing) return;
  processing = true;
  void deliverEmailBatch()
    .catch(() => console.error("Email worker failed."))
    .finally(() => {
      processing = false;
    });
}, 15000);
worker.unref();
function shutdown() {
  clearInterval(worker);
  server.close(() => {
    void pool.end();
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

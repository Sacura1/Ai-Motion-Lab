import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
export const newToken = () => randomBytes(32).toString("hex");
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function validWebhook(body: Buffer, header: unknown, secret: string) {
  if (!secret || typeof header !== "string" || !/^[a-f0-9]{128}$/.test(header))
    return false;
  const hash = createHmac("sha512", secret).update(body).digest("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(header));
}

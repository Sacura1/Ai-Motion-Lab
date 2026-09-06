import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

function signature(id: string, secret: string) {
  return createHmac("sha256", secret).update(`community:${id}`).digest("hex");
}
export function createReference(secret: string) {
  const id = randomUUID();
  return `${id}.${signature(id, secret)}`;
}
export function validReference(reference: string, secret: string) {
  const [id, hash, extra] = reference.split(".");
  if (!id || !hash || extra || !/^[a-f0-9]{64}$/.test(hash)) return false;
  return timingSafeEqual(Buffer.from(hash), Buffer.from(signature(id, secret)));
}
export function grantsAccess(
  data: { status: string; amount: number; currency: string; reference: string },
  expected: { amount: number; currency: string; reference: string },
) {
  return (
    data.status === "success" &&
    data.amount === expected.amount &&
    data.currency === expected.currency &&
    data.reference === expected.reference
  );
}

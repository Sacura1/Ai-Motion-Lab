import type { Track } from "../content";

const STORAGE_KEY = "ai-motion-lab.pending-checkout";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export type PendingCheckout = {
  reference: string;
  authorizationUrl: string;
  track: Track;
  createdAt: number;
};

export function readPendingCheckout(): PendingCheckout | undefined {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as
      | PendingCheckout
      | null;
    if (
      !value ||
      !/^[a-f0-9]{64}$/.test(value.reference) ||
      !["creator", "masterclass"].includes(value.track) ||
      Date.now() - value.createdAt > MAX_AGE
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    const checkout = new URL(value.authorizationUrl);
    if (checkout.protocol !== "https:" || checkout.hostname !== "checkout.paystack.com")
      throw new Error("Invalid stored checkout URL");
    return value;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

export function savePendingCheckout(value: PendingCheckout) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Checkout must still open when storage is blocked or unavailable.
  }
}

export function clearPendingCheckout(reference?: string | null) {
  const pending = readPendingCheckout();
  if (!reference || pending?.reference === reference)
    localStorage.removeItem(STORAGE_KEY);
}

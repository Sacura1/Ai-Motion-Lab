import "dotenv/config";
import { z } from "zod";
export const env = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    DATABASE_URL: z.string().default(""),
    PAYSTACK_SECRET_KEY: z.string().default(""),
    TELEGRAM_BOT_TOKEN: z.string().default(""),
    TELEGRAM_CREATOR_CHAT_ID: z.string().default(""),
    TELEGRAM_MASTERCLASS_CHAT_ID: z.string().default(""),
    RESEND_API_KEY: z.string().default(""),
    EMAIL_FROM: z.string().default(""),
    // Railway places one trusted reverse proxy in front of the service.
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
  })
  .parse(process.env);
export const catalog = {
  creator: {
    name: "Creator",
    amount: 2000000,
    currency: "NGN",
    chatId: env.TELEGRAM_CREATOR_CHAT_ID,
  },
  masterclass: {
    name: "Masterclass",
    amount: 5000000,
    currency: "NGN",
    chatId: env.TELEGRAM_MASTERCLASS_CHAT_ID,
  },
};
export function serviceCapabilities(config = env) {
  return {
    checkout: Boolean(
      config.DATABASE_URL &&
      config.PAYSTACK_SECRET_KEY &&
      config.TELEGRAM_BOT_TOKEN &&
      config.TELEGRAM_CREATOR_CHAT_ID &&
      config.TELEGRAM_MASTERCLASS_CHAT_ID,
    ),
    email: Boolean(config.RESEND_API_KEY.trim() && config.EMAIL_FROM.trim()),
  };
}
export const configured = serviceCapabilities().checkout;
export const emailConfigured = () => serviceCapabilities().email;

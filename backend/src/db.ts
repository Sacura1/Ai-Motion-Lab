import pg from "pg";
import { env } from "./config.js";
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL || undefined,
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});
pool.on("error", () => console.error("Database connection failed."));
export async function transaction<T>(
  work: (client: pg.PoolClient) => Promise<T>,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
export type Order = {
  reference: string;
  name: string;
  email: string;
  track: "creator" | "masterclass";
  amount: number;
  currency: string;
  status: string;
  invite_url: string | null;
  invite_expires_at: Date | null;
  chat_id: string;
};

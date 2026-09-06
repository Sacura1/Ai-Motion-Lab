import { env } from "./config.js";
import { pool, transaction } from "./db.js";
import { schema } from "./schema.js";
if (!env.DATABASE_URL)
  throw new Error("Set DATABASE_URL before running the migration.");
try {
  await transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(710429)");
    await client.query(schema);
  });
  console.log("Enrollment schema is ready.");
} finally {
  await pool.end();
}

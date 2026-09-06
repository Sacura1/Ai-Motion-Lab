export const schema = `
CREATE TABLE IF NOT EXISTS enrollments (
 reference text PRIMARY KEY, name text NOT NULL, email text NOT NULL,
 track text NOT NULL CHECK (track IN ('creator','masterclass')),
 amount integer NOT NULL CHECK (amount > 0), currency text NOT NULL, chat_id text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
 invite_url text, invite_expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);
CREATE INDEX IF NOT EXISTS enrollments_email_idx ON enrollments(email);
CREATE TABLE IF NOT EXISTS access_tokens (
 token_hash text PRIMARY KEY, reference text NOT NULL REFERENCES enrollments(reference),
 expires_at timestamptz NOT NULL, used_at timestamptz
);
CREATE TABLE IF NOT EXISTS email_outbox (
 id bigserial PRIMARY KEY, dedupe_key text NOT NULL UNIQUE, recipient text NOT NULL,
 subject text NOT NULL, body text, expires_at timestamptz NOT NULL,
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 sent_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS outbox_pending_idx ON email_outbox(next_attempt_at) WHERE sent_at IS NULL;
CREATE TABLE IF NOT EXISTS recovery_requests (email text PRIMARY KEY, requested_at timestamptz NOT NULL DEFAULT now());
`;

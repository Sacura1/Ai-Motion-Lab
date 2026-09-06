import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { validWebhook, newToken, hashToken } from "./security.js";
test("webhook validation rejects tampered bytes and malformed signatures", () => {
  const body = Buffer.from('{"event":"charge.success"}');
  const signature = createHmac("sha512", "secret").update(body).digest("hex");
  assert.equal(validWebhook(body, signature, "secret"), true);
  assert.equal(validWebhook(Buffer.from("{}"), signature, "secret"), false);
  for (const header of [undefined, "bad", [], signature])
    assert.equal(validWebhook(body, header, "wrong"), false);
});
test("access tokens are high-entropy and stored as hashes", () => {
  const token = newToken();
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.notEqual(token, newToken());
  assert.notEqual(hashToken(token), token);
  assert.equal(hashToken(token), hashToken(token));
});

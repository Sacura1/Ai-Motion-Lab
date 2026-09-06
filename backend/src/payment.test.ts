import { test } from "node:test";
import assert from "node:assert/strict";
import { createReference, grantsAccess, validReference } from "./payment.js";

test("references belong to this app and reject tampering", () => {
  const ref = createReference("test-secret");
  assert.equal(validReference(ref, "test-secret"), true);
  assert.equal(validReference(ref, "other-secret"), false);
  assert.equal(validReference(`changed-${ref}`, "test-secret"), false);
  assert.equal(validReference("invalid", "test-secret"), false);
});
test("access requires successful payment with matching amount, currency and reference", () => {
  const expected = { amount: 500000, currency: "NGN", reference: "reference" };
  const paid = { ...expected, status: "success" };
  assert.equal(grantsAccess(paid, expected), true);
  for (const change of [
    { status: "pending" },
    { status: "failed" },
    { amount: 1 },
    { currency: "USD" },
    { reference: "other" },
  ]) {
    assert.equal(grantsAccess({ ...paid, ...change }, expected), false);
  }
});

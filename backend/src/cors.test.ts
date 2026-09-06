import { test } from "node:test";
import assert from "node:assert/strict";
import { sameOrigin } from "./cors.js";

test("CORS allows only the configured frontend origin", () => {
  const site = "https://motion.example.com/path";
  assert.equal(sameOrigin("https://motion.example.com", site), true);
  assert.equal(sameOrigin("https://motion.example.com/", site), true);
  assert.equal(sameOrigin("https://api.example.com", site), false);
  assert.equal(sameOrigin("https://motion.example.com.evil.test", site), false);
  assert.equal(sameOrigin("not-a-url", site), false);
});

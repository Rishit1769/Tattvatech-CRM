import assert from "node:assert/strict";
const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:3100";
if (!["127.0.0.1", "localhost", "::1", "[::1]"].includes(new URL(baseUrl).hostname)) throw new Error("Use a local test server for this smoke test.");
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;
if (!email || !password) throw new Error("SMOKE_EMAIL and SMOKE_PASSWORD are required. Use a test account.");
const login = await fetch(baseUrl + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
assert.equal(login.status, 200, "test account sign-in");
assert.equal((await login.json()).forcePasswordChange, false, "test account must already have a permanent password");
const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
assert.ok(cookie, "session cookie");
try {
  for (const path of ["/dashboard", "/leads", "/clients", "/projects", "/finance", "/meetings", "/follow-ups", "/infrastructure", "/infrastructure/demos", "/workspace/search"]) {
    const response = await fetch(baseUrl + path, { headers: { cookie }, redirect: "manual" });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /id="main-content"/, path + " workspace");
    assert.doesNotMatch(html, /passwordHash|sessionTokenHash/, path + " sensitive serialization");
    console.log("PASS authenticated page", path);
  }
  for (const [path, key] of [["/api/leads", "leads"], ["/api/clients", "clients"], ["/api/projects", "projects"], ["/api/finance/transactions", "transactions"], ["/api/meetings", "meetings"], ["/api/follow-ups", "followUps"], ["/api/infrastructure/servers", "servers"], ["/api/infrastructure/demos", "demos"], ["/api/search?q=UI", "results"]]) {
    const response = await fetch(baseUrl + path, { headers: { cookie } });
    assert.equal(response.status, 200, path);
    assert.ok(Array.isArray((await response.json())[key]), path + " records");
    console.log("PASS authenticated API", path);
  }
  const summary = await fetch(baseUrl + "/api/dashboard/summary", { headers: { cookie } });
  assert.equal(summary.status, 200);
  assert.equal(typeof (await summary.json()).activeLeads, "number");
  const health = await (await fetch(baseUrl + "/api/health")).json();
  assert.equal(health.database, "ok");
  console.log("PASS dashboard metrics and database health");
} finally {
  const logout = await fetch(baseUrl + "/api/auth/logout", { method: "POST", headers: { cookie } });
  assert.equal(logout.status, 200, "logout");
}
const protectedResponse = await fetch(baseUrl + "/api/leads", { headers: { cookie } });
assert.equal(protectedResponse.status, 401, "revoked session");
console.log("PASS sign-out revokes session");

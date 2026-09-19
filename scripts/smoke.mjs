const baseUrl = process.env.SMOKE_URL ?? "http://127.0.0.1:3100";
const checks = [
  ["login page", "/login", 200],
  ["leads page auth redirect", "/leads", 307],
  ["clients page auth redirect", "/clients", 307],
  ["projects page auth redirect", "/projects", 307],
  ["finance page auth redirect", "/finance", 307],
  ["infrastructure page auth redirect", "/infrastructure", 307],
  ["leads API auth", "/api/leads", 401],
  ["search API auth", "/api/search?q=crm", 401],
];
let failed = 0;
for (const [name, path, expected] of checks) { const response = await fetch(`${baseUrl}${path}`); const result = response.status === expected ? "PASS" : "FAIL"; console.log(`${result} ${name}: expected ${expected}, got ${response.status}`); if (result === "FAIL") failed++; }
if (failed) process.exit(1);

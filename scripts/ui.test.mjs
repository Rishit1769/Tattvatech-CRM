import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Compile the actual dependency-free primitives; no duplicate test implementations.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../src/components/ui/primitives.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
new Function("require", "module", "exports", compiled)(require, module, module.exports);
const ui = module.exports;
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));

test("page headers have one primary heading and technical context", () => {
  const html = render(ui.PageHeader, { eyebrow: "02 / Leads", title: "Pipeline", description: "Opportunities" });
  assert.match(html, /<h1>Pipeline<\/h1>/);
  assert.match(html, /02 \/ Leads/);
});
test("status badges distinguish success, warning, danger and unknown", () => {
  for (const [status, tone] of [["RUNNING", "success"], ["PENDING", "warning"], ["OFFLINE", "danger"], ["UNKNOWN", "neutral"]]) {
    assert.match(render(ui.StatusBadge, { status }), new RegExp("badge-" + tone));
  }
  assert.equal(ui.humanize("WAITING_CLIENT"), "Waiting Client");
});
test("tables retain accessible column headings and mobile cell labels", () => {
  const html = render(ui.DataTable, { rows: [{ id: "1", name: "Acme" }], caption: "Clients", columns: [{ label: "Organization", render: (row) => row.name }] });
  assert.match(html, /<caption class="sr-only">Clients<\/caption>/);
  assert.match(html, /scope="col"/);
  assert.match(html, /data-label="Organization"/);
  assert.match(html, /Acme/);
});
test("buttons default to non-submit and preserve disabled state", () => {
  const html = render(ui.Button, { disabled: true, variant: "danger", children: "Stop" });
  assert.match(html, /type="button"/);
  assert.match(html, /disabled/);
  assert.match(html, /button-danger/);
});
test("feedback has appropriate live roles", () => {
  assert.match(render(ui.Notice, { children: "Failed" }), /role="alert"/);
  assert.match(render(ui.Notice, { success: true, children: "Saved" }), /role="status"/);
  assert.match(render(ui.LoadingSkeleton, { rows: 3 }), /aria-busy="true"/);
});
test("currency formatting preserves zero and decimal values", () => {
  assert.equal(ui.money(null), "₹0.00");
  assert.equal(ui.money(1234.5), "₹1,234.50");
});

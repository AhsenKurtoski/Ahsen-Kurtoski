#!/usr/bin/env node
/**
 * Riepilogo dei report Lighthouse salvati in audit/lighthouse/*.report.json.
 * Uso: node scripts/audit-lh-summary.mjs
 * Scrive audit/raw/lighthouse-summary.json e stampa una tabella.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "audit", "lighthouse");
const files = readdirSync(DIR).filter((f) => f.endsWith(".report.json"));
if (!files.length) {
  console.error("Nessun report in audit/lighthouse. Lancia prima Lighthouse.");
  process.exit(1);
}

const rows = [];
for (const file of files.sort()) {
  const r = JSON.parse(readFileSync(path.join(DIR, file), "utf8"));
  const a = r.audits;
  const c = r.categories;
  const score = (x) => (x?.score ?? null) === null ? null : Math.round(x.score * 100);
  const num = (id) => a[id]?.numericValue ?? null;

  const resourceSummary = a["resource-summary"]?.details?.items ?? [];
  const totalTransfer = resourceSummary.find((i) => i.resourceType === "total")?.transferSize ?? null;
  const jsTransfer = resourceSummary.find((i) => i.resourceType === "script")?.transferSize ?? null;
  const unusedJs = a["unused-javascript"]?.details?.overallSavingsBytes ?? null;

  const opportunities = Object.values(a)
    .filter((x) => x?.score != null && x.score < 0.9 && x.scoreDisplayMode === "binary")
    .map((x) => ({ id: x.id, title: x.title, score: Math.round(x.score * 100) }));

  rows.push({
    name: file.replace(".report.json", ""),
    url: r.finalDisplayedUrl ?? r.finalUrl ?? r.requestedUrl,
    formFactor: r.configSettings?.formFactor ?? "mobile",
    throttling: r.configSettings?.throttlingMethod ?? "simulate",
    scores: {
      performance: score(c.performance),
      accessibility: score(c.accessibility),
      bestPractices: score(c["best-practices"]),
      seo: score(c.seo),
    },
    metrics: {
      fcpMs: num("first-contentful-paint"),
      lcpMs: num("largest-contentful-paint"),
      tbtMs: num("total-blocking-time"),
      cls: num("cumulative-layout-shift"),
      speedIndexMs: num("speed-index"),
      ttfbMs: num("server-response-time"),
      mainThreadMs: num("mainthread-work-breakdown"),
      bootupMs: num("bootup-time"),
    },
    bytes: { totalTransfer, jsTransfer, unusedJs },
    opportunities,
  });
}

writeFileSync(
  path.join(process.cwd(), "audit", "raw", "lighthouse-summary.json"),
  JSON.stringify(rows, null, 2),
);

const ms = (v) => (v == null ? "—" : `${Math.round(v)} ms`);
const kb = (v) => (v == null ? "—" : `${Math.round(v / 1024)} KB`);

console.log(
  "\n" +
    [
      "report".padEnd(24),
      "perf".padStart(4),
      "a11y".padStart(4),
      "bp".padStart(3),
      "seo".padStart(4),
      "LCP".padStart(8),
      "TBT".padStart(8),
      "CLS".padStart(5),
      "TTFB".padStart(8),
      "JS".padStart(7),
    ].join(" "),
);
for (const r of rows) {
  console.log(
    [
      r.name.padEnd(24),
      String(r.scores.performance).padStart(4),
      String(r.scores.accessibility).padStart(4),
      String(r.scores.bestPractices).padStart(3),
      String(r.scores.seo).padStart(4),
      ms(r.metrics.lcpMs).padStart(8),
      ms(r.metrics.tbtMs).padStart(8),
      String(r.metrics.cls ?? "—").padStart(5),
      ms(r.metrics.ttfbMs).padStart(8),
      kb(r.bytes.jsTransfer).padStart(7),
    ].join(" "),
  );
}
console.log(`\n→ riepilogo: audit/raw/lighthouse-summary.json (${rows.length} report)\n`);

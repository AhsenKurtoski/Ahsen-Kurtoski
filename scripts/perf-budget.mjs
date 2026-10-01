#!/usr/bin/env node
/**
 * Guardia di performance sul sito servito in locale.
 *
 * Uso:
 *   node scripts/perf-budget.mjs [http://127.0.0.1:3000]
 *   npm run perf:budget -- http://127.0.0.1:3000
 *
 * Va eseguita **mentre il server è acceso** (in CI è lo stesso step dell'audit
 * link, che è l'unico punto in cui il processo è già in ascolto).
 *
 * Non usa un browser: legge l'HTML servito e scarica le risorse che l'HTML
 * dichiara, quindi è deterministica e veloce — può quindi girare a ogni push.
 * Le metriche Lighthouse (LCP, TBT) non si possono misurare così, ma tutte le
 * decisioni prese in questo progetto si vedono a occhio nudo nei byte e nella
 * struttura della pagina, e quelle sì.
 *
 * Cosa verifica:
 *  1. **nessun CSS che blocca il rendering** — è la decisione presa in
 *     `audit/performance-report.md` §0d: con `experimental.inlineCss` il foglio
 *     di stile è dentro la pagina. Se qualcuno lo disattiva, la verifica fallisce
 *     e gli dice dove sta scritto il perché;
 *  2. il **peso della prima visita** (documento + script + font, gzip) entro il
 *     budget, per pagina;
 *  3. il **font mono non precaricato** (fix M3: su una pagina senza codice non
 *     deve partire la seconda richiesta di font);
 *  4. il **numero di file JS** entro il budget, per accorgersi di un componente
 *     client che rientra da una porta di servizio.
 *
 * I budget sono tarati sui valori misurati il 01/10/2026 con un margine del
 * ~15%: abbastanza per un contenuto nuovo, non abbastanza per nascondere una
 * regressione strutturale. Se il budget non basta più, si aggiorna qui — con un
 * commit in cui si spiega perché è cresciuto.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/+$/, "");

/**
 * Valori di riferimento misurati il 01/10/2026 (primo deploy con inlineCss,
 * commit f480b5e) + ~15%:
 *   home: documento 40,9 KB gzip · prima visita 248,5 KB gzip · CSS inline 36,6 KB
 *   pagine interne: 36,8–38,9 KB gzip · 243,7–246,3 KB gzip
 */
const BUDGETS = {
  // Peso del documento HTML da solo (gzip). Con inlineCss il CSS sta qui dentro.
  docGzipKb: 48,
  // Prima visita completa: documento + script + font, tutti gzip, deduplicati.
  totalGzipKb: 290,
  // CSS dentro la pagina (non compresso): oggi ~36,6 KB. Oltre, sospetta doppioni.
  inlineCssKb: 44,
  // File JS caricati dall'HTML.
  scriptFiles: 10,
  // Preload di font: il mono non deve tornare a essere precaricato ovunque.
  fontPreloads: 1,
};

const PAGES = [
  { path: "/", name: "home" },
  { path: "/blog", name: "blog" },
  { path: "/contatti", name: "contatti" },
  {
    path: "/blog/seo-per-le-persone-come-farsi-trovare-su-google",
    name: "articolo",
  },
];

const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const br = (buf) => zlib.brotliCompressSync(buf).length;
const kb = (n) => Math.round((n / 1024) * 10) / 10;

async function get(url) {
  const res = await fetch(url, { headers: { "accept-encoding": "identity" } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Un foglio di stile esterno blocca il rendering a meno che non sia dichiarato
 * non bloccante (`media="print"` + `onload`, il trucco classico del CSS critico).
 */
const isRenderBlocking = (tag) => !/media\s*=\s*["']print["']/.test(tag) && !/onload\s*=/.test(tag);

const local = (href) => href && (href.startsWith("/") || href.startsWith(BASE));

function analyze(html) {
  const stylesheetTags = [...html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi)].map((m) => m[0]);
  const styleHrefs = stylesheetTags.map((tag) => tag.match(/href=["']([^"']+)["']/)?.[1]).filter(local);
  const blocking = stylesheetTags.filter((tag) => isRenderBlocking(tag) && local(tag.match(/href=["']([^"']+)["']/)?.[1]));

  const scripts = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]).filter(local);
  const preloads = [...html.matchAll(/<link[^>]*rel=["']preload["'][^>]*>/gi)].map((m) => m[0]);
  const fontPreloads = preloads
    .filter((tag) => /as=["']font["']/.test(tag))
    .map((tag) => tag.match(/href=["']([^"']+)["']/)?.[1])
    .filter(local);
  const scriptPreloads = preloads
    .filter((tag) => /as=["']script["']/.test(tag))
    .map((tag) => tag.match(/href=["']([^"']+)["']/)?.[1])
    .filter(local);

  const inlineCssKb = kb(
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].reduce((sum, m) => sum + Buffer.byteLength(m[1]), 0),
  );

  return {
    scriptUrls: [...new Set(scripts)],
    scriptPreloads: [...new Set(scriptPreloads)],
    styleHrefs: [...new Set(styleHrefs)],
    fontUrls: [...new Set(fontPreloads)],
    blocking,
    inlineCssKb,
  };
}

const problems = [];
const say = (ok, label, value, budget) =>
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(46)} ${String(value).padStart(8)}${budget ? `   budget ${budget}` : ""}`);

console.log(`\nGuardia di performance — ${BASE}\n`);
const report = { base: BASE, generatedAt: new Date().toISOString(), pages: [] };

for (const page of PAGES) {
  const html = await get(BASE + page.path);
  const doc = html.toString("utf8");
  const a = analyze(doc);

  // Scarica una volta sola ogni risorsa locale dichiarata dall'HTML.
  const assets = [...new Set([...a.scriptUrls, ...a.scriptPreloads, ...a.styleHrefs, ...a.fontUrls])];
  let assetsGzip = 0;
  let assetsRaw = 0;
  for (const url of assets) {
    const body = await get(url.startsWith("http") ? url : BASE + url);
    assetsGzip += gz(body);
    assetsRaw += body.length;
  }

  const docGzip = gz(html);
  const docBrotli = br(html);
  const totalGzip = docGzip + assetsGzip;

  console.log(`\n${page.name} (${page.path})`);

  const blockingOk = a.blocking.length === 0;
  if (!blockingOk) {
    problems.push(
      `${page.path}: ${a.blocking.length} foglio di stile esterno che blocca il rendering — con inlineCss non deve essercene nessuno (decisione motivata in audit/performance-report.md §0d)`,
    );
  }
  say(blockingOk, "CSS esterno che blocca il rendering", a.blocking.length, "0");
  say(a.inlineCssKb <= BUDGETS.inlineCssKb, "CSS inline nella pagina (KB, non compresso)", a.inlineCssKb, BUDGETS.inlineCssKb);
  say(
    a.fontUrls.length <= BUDGETS.fontPreloads,
    "font precaricati",
    a.fontUrls.length,
    BUDGETS.fontPreloads,
  );
  say(
    a.scriptUrls.length <= BUDGETS.scriptFiles,
    "file JS nell'HTML",
    a.scriptUrls.length,
    BUDGETS.scriptFiles,
  );
  say(kb(docGzip) <= BUDGETS.docGzipKb, "documento (gzip KB)", kb(docGzip), BUDGETS.docGzipKb);
  say(
    kb(totalGzip) <= BUDGETS.totalGzipKb,
    `prima visita totale (gzip KB, ${assets.length} risorse)`,
    kb(totalGzip),
    BUDGETS.totalGzipKb,
  );

  if (kb(docGzip) > BUDGETS.docGzipKb) problems.push(`${page.path}: documento gzip ${kb(docGzip)} KB (budget ${BUDGETS.docGzipKb})`);
  if (kb(totalGzip) > BUDGETS.totalGzipKb) problems.push(`${page.path}: prima visita ${kb(totalGzip)} KB gzip (budget ${BUDGETS.totalGzipKb})`);
  if (a.inlineCssKb > BUDGETS.inlineCssKb) problems.push(`${page.path}: CSS inline ${a.inlineCssKb} KB (budget ${BUDGETS.inlineCssKb}) — doppioni?`);
  if (a.fontUrls.length > BUDGETS.fontPreloads) problems.push(`${page.path}: ${a.fontUrls.length} font precaricati (budget ${BUDGETS.fontPreloads}) — il mono non va precaricato (M3, fix 2)`);
  if (a.scriptUrls.length > BUDGETS.scriptFiles) problems.push(`${page.path}: ${a.scriptUrls.length} file JS (budget ${BUDGETS.scriptFiles})`);

  report.pages.push({
    ...page,
    docGzipKb: kb(docGzip),
    docBrotliKb: kb(docBrotli),
    assetsRawKb: kb(assetsRaw),
    assetsGzipKb: kb(assetsGzip),
    totalGzipKb: kb(totalGzip),
    inlineCssKb: a.inlineCssKb,
    scriptFiles: a.scriptUrls.length,
    fontPreloads: a.fontUrls.length,
    renderBlockingCss: a.blocking.length,
    assets,
  });
}

console.log("\nRiepilogo");
if (problems.length) {
  for (const p of problems) console.log(`  ✗ ${p}`);
  console.log(`\n${problems.length} problemi: la verifica fallisce. Se il budget è cambiato apposta, aggiorna BUDGETS in scripts/perf-budget.mjs spiegando il perché.`);
} else {
  console.log("  ✓ peso e struttura della prima visita entro i budget, nessun CSS che blocca il rendering");
}

const out = path.join(process.cwd(), "audit", "raw", "perf-budget.json");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ ...report, problems }, null, 2));
console.log(`\n→ report: ${path.relative(process.cwd(), out)}`);

process.exit(problems.length ? 1 : 0);

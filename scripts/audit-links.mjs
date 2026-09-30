#!/usr/bin/env node
/**
 * Audit di link e scansionabilità di un sito pubblicato.
 *
 * Uso:
 *   node scripts/audit-links.mjs https://esempio.vercel.app
 *   npm run audit:links -- https://esempio.vercel.app
 *   npm run audit:links -- https://esempio.vercel.app --fail-on=internal
 *
 * Opzioni:
 *   --fail-on=all|internal|external   quali problemi fanno uscire con codice 1
 *                                     (default all). In CI conviene `internal`:
 *                                     i siti di terze parti rispondono 403/999 ai
 *                                     bot e non sono correggibili da questo repo,
 *                                     ma restano nel report e nel log.
 *
 * Cosa controlla:
 *  1. robots.txt e sitemap.xml raggiungibili e coerenti col dominio;
 *  2. ogni URL della sitemap: stato (seguendo i redirect), <title>, canonical,
 *     meta robots, JSON-LD valido, un solo <h1>, gerarchia dei titoli senza salti,
 *     contenuto presente nell'HTML servito;
 *  3. la stessa pagina richiesta con User-Agent Googlebot;
 *  4. tutti i link interni ed esterni trovati nell'HTML: stato e catena di redirect;
 *  5. comportamenti di base: pagina inesistente → 404, variante con slash,
 *     http → https.
 *
 * Scrive un JSON completo in audit/raw/link-audit.json e stampa un riepilogo.
 * Esce con codice 1 se trova problemi bloccanti (link interni rotti, sitemap
 * incoerente, pagine irraggiungibili).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const BASE = (args.find((a) => /^https?:\/\//.test(a)) ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(BASE)) {
  console.error("\n✗ Indica l'indirizzo del sito, es. node scripts/audit-links.mjs https://esempio.vercel.app\n");
  process.exit(1);
}

const FAIL_ON = (args.find((a) => a.startsWith("--fail-on="))?.split("=")[1] ?? "all").trim();
if (!["all", "internal", "external"].includes(FAIL_ON)) {
  console.error(`\n✗ --fail-on accetta all, internal o external (ricevuto: ${FAIL_ON})\n`);
  process.exit(1);
}
const HOST = new URL(BASE).host;

const UA_BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const UA_GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const OUT_DIR = path.join(process.cwd(), "audit", "raw");
mkdirSync(OUT_DIR, { recursive: true });

const report = {
  base: BASE,
  failOn: FAIL_ON,
  generatedAt: new Date().toISOString(),
  robots: null,
  sitemap: null,
  pages: [],
  links: { internal: [], external: [] },
  behaviours: {},
  findings: { errors: [], warnings: [] },
};
/**
 * Ogni problema è etichettato: `internal` = dipende da questo repo (link interni,
 * sitemap, robots, canonical, 404), `external` = sito di terze parti.
 */
const problems = [];
const problem = (m, kind = "internal") => {
  report.findings.errors.push(m);
  problems.push({ kind, message: m });
};
const warn = (m) => report.findings.warnings.push(m);

/**
 * fetch con un tentativo di recupero sugli errori di rete (DNS, connessione
 * chiusa, timeout): sono transitori e non devono trasformarsi in un problema
 * segnalato. Gli stati HTTP non vengono ritentati: quelli sono risposte reali.
 */
async function fetchWithRetry(target, options, attempts = 2) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetch(target, options);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
  throw lastError;
}

/** GET con redirect manuali: restituisce stato, catena e body. */
async function probe(url, { ua = UA_BROWSER, method = "GET", maxHops = 5 } = {}) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop <= maxHops; hop++) {
    let res;
    try {
      res = await fetchWithRetry(current, {
        method,
        redirect: "manual",
        headers: { "User-Agent": ua, Accept: method === "GET" ? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" : "*/*" },
      });
    } catch (error) {
      return { url, finalUrl: current, status: null, chain, body: "", error: String(error) };
    }
    chain.push({ url: current, status: res.status });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return { url, finalUrl: current, status: res.status, chain, body: "", error: "redirect senza Location" };
      current = new URL(location, current).toString();
      continue;
    }
    const body = method === "GET" ? await res.text() : "";
    return { url, finalUrl: current, status: res.status, chain, body, headers: res.headers, error: null };
  }
  return { url, finalUrl: current, status: null, chain, body: "", error: "troppi redirect" };
}

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

function extract(html) {
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const canonical = decode(html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1] ?? "");
  const metaRobots = html.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? "";
  const jsonLd = { types: [], broken: 0 };
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (node && typeof node === "object") {
          if (typeof node["@type"] === "string") jsonLd.types.push(node["@type"]);
          Object.values(node).forEach(walk);
        }
      };
      walk(JSON.parse(m[1]));
    } catch {
      jsonLd.broken++;
    }
  }
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]);

  // Gerarchia dei titoli: un solo <h1> e nessun salto di livello (h2 -> h3 sì, h1 -> h3 no).
  // È un controllo di struttura, non di stile: un salto confonde gli screen reader e i
  // motori che ricostruiscono l'outline della pagina.
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) => Number(m[1]));
  let headingSkip = null;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) {
      headingSkip = `h${headings[i - 1]} → h${headings[i]}`;
      break;
    }
  }

  return {
    title,
    canonical,
    metaRobots,
    jsonLd,
    textLength: text.length,
    links,
    h1Count: headings.filter((level) => level === 1).length,
    headingCount: headings.length,
    headingSkip,
  };
}

const isManualCheck = (status, finalUrl) =>
  status === 999 ||
  status === 403 ||
  status === 429 ||
  /linkedin\.com|instagram\.com|fiverr\.com/.test(finalUrl ?? "");

/* --------------------------------------------------- 1. robots + sitemap */

console.log(`\n\u001b[1mAudit link — ${BASE}\u001b[0m\n`);

const robots = await probe(`${BASE}/robots.txt`);
if (robots.status !== 200) {
  problem(`robots.txt: HTTP ${robots.status ?? robots.error}`);
} else {
  const sitemapLine = robots.body.match(/Sitemap:\s*(\S+)/i)?.[1] ?? null;
  const disallowAll = /^\s*Disallow:\s*\/\s*$/im.test(robots.body);
  report.robots = { status: robots.status, sitemapLine, disallowAll, body: robots.body };
  if (disallowAll) problem("robots.txt blocca tutto con Disallow: /");
  if (!sitemapLine) warn("robots.txt non dichiara la sitemap");
  else if (new URL(sitemapLine).host !== HOST) problem(`robots.txt dichiara la sitemap su un altro dominio: ${sitemapLine}`);
  console.log(`✓ robots.txt (200)${sitemapLine ? `, sitemap dichiarata: ${sitemapLine}` : ""}`);
}

const sitemap = await probe(`${BASE}/sitemap.xml`);
let sitemapUrls = [];
if (sitemap.status !== 200) {
  problem(`sitemap.xml: HTTP ${sitemap.status ?? sitemap.error}`);
} else {
  sitemapUrls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const foreign = sitemapUrls.filter((u) => {
    try {
      return new URL(u).host !== HOST;
    } catch {
      return true;
    }
  });
  if (!sitemapUrls.length) problem("sitemap.xml senza URL");
  if (foreign.length) problem(`sitemap contiene URL di altri domini: ${foreign.slice(0, 3).join(", ")}`);
  report.sitemap = { status: sitemap.status, urls: sitemapUrls };
  console.log(`✓ sitemap.xml (200) con ${sitemapUrls.length} URL`);
}

/* --------------------------------------- 2. ogni pagina: browser + Googlebot */

console.log(`\n\u001b[1mPagine della sitemap (${sitemapUrls.length})\u001b[0m`);

for (const url of sitemapUrls) {
  const page = { url, browser: null, googlebot: null, served: null, issues: [] };

  for (const [label, ua] of [["browser", UA_BROWSER], ["googlebot", UA_GOOGLEBOT]]) {
    const res = await probe(url, { ua });
    const info = {
      status: res.status,
      finalUrl: res.finalUrl,
      hops: res.chain.length - 1,
      chain: res.chain,
      error: res.error,
    };
    if (res.status === 200 && res.body) Object.assign(info, extract(res.body));
    page[label] = info;

    if (res.status !== 200) page.issues.push(`${label}: HTTP ${res.status ?? res.error}`);
    else {
      if (res.finalUrl.replace(/\/$/, "") !== url.replace(/\/$/, "")) page.issues.push(`${label}: reindirizza a ${res.finalUrl}`);
      if (info.canonical && info.canonical.replace(/\/$/, "") !== url.replace(/\/$/, ""))
        page.issues.push(`${label}: canonical diverso (${info.canonical})`);
      if (/noindex/i.test(info.metaRobots)) page.issues.push(`${label}: meta robots noindex`);
      if (info.h1Count !== 1) page.issues.push(`${label}: ${info.h1Count} titoli <h1> nella pagina (atteso 1)`);
      if (info.headingSkip) page.issues.push(`${label}: gerarchia titoli con salto ${info.headingSkip}`);
      if (info.textLength < 400) page.issues.push(`${label}: poco testo nell'HTML servito (${info.textLength} caratteri)`);
      if (info.jsonLd.broken) page.issues.push(`${label}: ${info.jsonLd.broken} blocchi JSON-LD non validi`);
      if (!info.jsonLd.types.length) page.issues.push(`${label}: nessun dato strutturato`);
      if (/noindex/i.test(res.headers?.get("x-robots-tag") ?? "")) page.issues.push(`${label}: X-Robots-Tag noindex`);
    }
  }

  // Se la sitemap dichiara un dominio diverso da quello in verifica, controlla
  // anche la pagina equivalente sul dominio attivo: sono due cose distinte
  // ("la pagina presa dalla sitemap" vs "la pagina servita all'utente").
  const u = new URL(url);
  if (u.origin !== new URL(BASE).origin) {
    const servedUrl = BASE + u.pathname + u.search;
    const res = await probe(servedUrl, { ua: UA_BROWSER });
    const info = {
      status: res.status,
      finalUrl: res.finalUrl,
      hops: res.chain.length - 1,
      chain: res.chain,
      error: res.error,
    };
    if (res.status === 200 && res.body) Object.assign(info, extract(res.body));
    page.served = info;
    if (res.status !== 200) page.issues.push(`servita su ${HOST}: HTTP ${res.status ?? res.error}`);
  }

  report.pages.push(page);
  const route = new URL(url).pathname || "/";
  const servedNote = page.served ? ` | su ${HOST}: ${page.served.status ?? page.served.error}` : "";
  if (page.issues.length) {
    problem(`${route}: ${page.issues.join("; ")}`);
    console.log(`✗ ${route.padEnd(55)} sitemap: ${page.browser.status ?? page.browser.error}${servedNote}`);
  } else {
    console.log(`✓ ${route.padEnd(55)} ${page.browser.status} · ${page.browser.jsonLd.types.length} tipi JSON-LD`);
  }
}

/* ----------------------------------------------------------- 3. i link */

const internal = new Map(); // path -> { from: Set, shows: Set }
const external = new Map(); // url -> from

for (const page of report.pages) {
  const links = [...(page.browser?.links ?? []), ...(page.served?.links ?? [])];
  // I link relativi vanno risolti contro il documento che li contiene davvero:
  // se la pagina è stata servita sul dominio attivo, è quello l'origine giusta.
  const docUrl = page.served ? BASE + new URL(page.url).pathname : page.url;
  for (const href of links) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    let abs;
    try {
      abs = new URL(href, docUrl);
    } catch {
      warn(`${new URL(page.url).pathname}: href non valido: ${href}`);
      continue;
    }
    if (abs.host === HOST) {
      const key = abs.pathname + abs.search;
      if (!internal.has(key)) internal.set(key, { url: abs.toString(), from: new Set(), status: null, hops: 0, finalUrl: null });
      internal.get(key).from.add(new URL(page.url).pathname);
    } else if (abs.protocol === "https:" || abs.protocol === "http:") {
      if (!external.has(abs.origin + abs.pathname)) external.set(abs.origin + abs.pathname, { url: abs.toString(), from: new Set() });
      external.get(abs.origin + abs.pathname).from.add(new URL(page.url).pathname);
    }
  }
}

console.log(`\n\u001b[1mLink interni (${internal.size} unici)\u001b[0m`);
for (const item of internal.values()) {
  const res = await probe(item.url, { method: "HEAD" });
  // Alcuni server non rispondono al HEAD: ricadi sul GET
  const final = res.status === 405 || res.status === 501 ? await probe(item.url) : res;
  item.status = final.status;
  item.hops = final.chain.length - 1;
  item.finalUrl = final.finalUrl;

  if (final.status !== 200) {
    problem(`link interno rotto: ${new URL(item.url).pathname} → HTTP ${final.status ?? final.error} (trovato in ${[...item.from].join(", ")})`);
    console.log(`✗ ${new URL(item.url).pathname.padEnd(55)} HTTP ${final.status ?? final.error}`);
  } else if (item.hops > 0) {
    warn(`link interno con redirect (${item.hops} hop): ${new URL(item.url).pathname}`);
    console.log(`! ${new URL(item.url).pathname.padEnd(55)} ${item.hops} redirect`);
  } else {
    console.log(`✓ ${new URL(item.url).pathname.padEnd(55)} 200`);
  }
}

console.log(`\n\u001b[1mLink esterni (${external.size} unici)\u001b[0m`);
for (const item of external.values()) {
  const res = await probe(item.url);
  const manual = isManualCheck(res.status, res.finalUrl);
  item.status = res.status;
  item.finalUrl = res.finalUrl;
  item.manualCheck = manual;
  report.links.external.push({ ...item, from: [...item.from] });

  const label = new URL(item.url).host;
  if (manual) console.log(`! ${label.padEnd(30)} HTTP ${res.status ?? res.error} — verifica manuale (anti-bot o login)`);
  else if (res.status !== 200) {
    problem(`link esterno non raggiungibile: ${item.url} → HTTP ${res.status ?? res.error}`, "external");
    console.log(`✗ ${label.padEnd(30)} HTTP ${res.status ?? res.error}`);
  } else console.log(`✓ ${label.padEnd(30)} 200`);
}
report.links.internal = [...internal.values()].map((i) => ({ ...i, from: [...i.from] }));

/* ------------------------------------------------------- 4. comportamenti */

console.log(`\n\u001b[1mComportamenti di base\u001b[0m`);

const notFound = await probe(`${BASE}/pagina-che-non-esiste-${Date.now()}`);
report.behaviours.notFound = { status: notFound.status };
if (notFound.status === 404) console.log("✓ pagina inesistente → 404");
else problem(`pagina inesistente → HTTP ${notFound.status ?? notFound.error} (atteso 404)`);

const slashPage = report.pages.find((p) => !p.url.replace(/^https?:\/\//, "").endsWith("/"));
if (slashPage) {
  const variant = await probe(`${slashPage.url}/`);
  const route = new URL(slashPage.url).pathname;
  report.behaviours.trailingSlash = { url: variant.url, status: variant.status, finalUrl: variant.finalUrl };
  if (variant.status === 200 && !variant.finalUrl.replace(/\/$/, "").endsWith(route)) {
    console.log(`✓ la variante con slash di ${route} → ${variant.status} ${variant.finalUrl !== variant.url ? "(redirect)" : ""}`);
  }
}

const httpVariant = await probe(BASE.replace(/^https:/, "http:") + "/");
report.behaviours.httpRedirect = { status: httpVariant.status, finalUrl: httpVariant.finalUrl };
if (httpVariant.status && httpVariant.finalUrl.startsWith("https://")) console.log(`✓ http → https (${httpVariant.chain.map((c) => c.status).join(" > ")})`);
else warn(`http → https non verificato (HTTP ${httpVariant.status ?? httpVariant.error})`);

/* ---------------------------------------------------------------- summary */

const bad = report.findings.errors.length;
const blocking = FAIL_ON === "all" ? problems : problems.filter((p) => p.kind === FAIL_ON);
report.findings.blocking = blocking.map((p) => p.message);
console.log(`\n\u001b[1mRiepilogo\u001b[0m`);
console.log(`  pagine verificate: ${report.pages.length}`);
console.log(`  link interni: ${report.links.internal.length} (rotti: ${report.links.internal.filter((l) => l.status !== 200).length})`);
console.log(`  link esterni: ${report.links.external.length} (da verificare a mano: ${report.links.external.filter((l) => l.manualCheck).length})`);
console.log(`  problemi: ${bad} (bloccanti con --fail-on ${FAIL_ON}: ${blocking.length}), avvisi: ${report.findings.warnings.length}`);
for (const w of report.findings.warnings) console.log(`  ! ${w}`);
for (const e of report.findings.errors) console.log(`  ✗ ${e}`);

const outFile = path.join(OUT_DIR, "link-audit.json");
writeFileSync(outFile, JSON.stringify(report, null, 2));
console.log(`\n→ JSON completo: ${path.relative(process.cwd(), outFile)}`);

if (blocking.length) {
  console.log(
    `\n\u001b[31mCi sono problemi da sistemare (${blocking.length} bloccanti con --fail-on ${FAIL_ON}).\u001b[0m\n`,
  );
  process.exit(1);
}
if (bad) {
  console.log(
    `\n\u001b[32mNessun problema bloccante con --fail-on ${FAIL_ON}.\u001b[0m\n\u001b[33mRestano ${bad} problemi non bloccanti nel report (vedi sopra e audit/raw/link-audit.json).\u001b[0m\n`,
  );
  process.exit(0);
}
console.log("\n\u001b[32mNessun problema bloccante trovato.\u001b[0m\n");

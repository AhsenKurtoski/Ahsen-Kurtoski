#!/usr/bin/env node
/**
 * Audit responsive + console + interazioni sul sito pubblicato.
 *
 * Uso:
 *   CHROME_PATH="..." node scripts/audit-responsive.mjs https://esempio.vercel.app
 *
 * Cosa fa (con Chrome for Testing in locale, puppeteer-core incluso in Lighthouse):
 *  - carica ogni pagina e raccoglie errori console, page error e richieste fallite;
 *  - per 5 pagine chiave controlla 7 larghezze (360/375/390/412/768/1024/1280):
 *    overflow orizzontale, elementi fuori viewport, tap target < 44px, input < 16px;
 *  - salva screenshot di controllo in audit/screenshots/;
 *  - prova le interazioni: menu mobile, avviso cookie, torna-su, validazione form.
 *
 * Scrive audit/raw/responsive.json e stampa un riepilogo.
 */
import { mkdirSync, readdirSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(BASE)) {
  console.error("\n✗ Indica l'indirizzo del sito: node scripts/audit-responsive.mjs https://esempio.vercel.app\n");
  process.exit(1);
}

/* ---------- trova Chrome for Testing scaricato in .chrome/ ---------- */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const root = path.join(process.cwd(), ".chrome");
  const wanted = process.platform === "win32" ? "chrome.exe" : process.platform === "darwin" ? "Google Chrome for Testing" : "chrome";
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (entry === wanted) {
        return full;
      }
    }
    return null;
  };
  try {
    return walk(root);
  } catch {
    return null;
  }
}

const executablePath = findChrome();
if (!executablePath) {
  console.error("\n✗ Chrome non trovato. Scaricalo con: npx @puppeteer/browsers install chrome@stable --path .chrome\n");
  process.exit(1);
}

const OUT_SNAP = path.join(process.cwd(), "audit", "screenshots");
mkdirSync(OUT_SNAP, { recursive: true });

const PAGES = [
  { slug: "home", path: "/" },
  { slug: "chi-sono", path: "/chi-sono" },
  { slug: "blog", path: "/blog" },
  { slug: "articolo-seo", path: "/blog/seo-per-le-persone-come-farsi-trovare-su-google" },
  { slug: "contatti", path: "/contatti" },
  { slug: "privacy", path: "/privacy" },
  { slug: "tag-web", path: "/blog/tag/web" },
  { slug: "404", path: "/pagina-in-esistente-audit" },
];

const WIDTHS = [360, 375, 390, 412, 768, 1024, 1280];
const RESPONSIVE_PAGES = ["home", "chi-sono", "blog", "articolo-seo", "contatti"];
const SCREENSHOTS = {
  home: [360, 390, 768, 1280],
  "articolo-seo": [375],
  contatti: [375],
  blog: [768],
};

const report = { base: BASE, generatedAt: new Date().toISOString(), pages: [], interactions: {}, summary: {} };

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setCacheEnabled(true);

/** Controlli di layout eseguiti nella pagina. */
function layoutCheck() {
  const doc = document.documentElement;
  const overflow = doc.scrollWidth - window.innerWidth;
  const offenders = [];
  const smallTargets = [];
  const smallInputs = [];

  const visible = (el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  if (overflow > 1) {
    for (const el of document.querySelectorAll("body *")) {
      if (!visible(el)) continue;
      const style = getComputedStyle(el);
      if (style.position === "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 || r.left < -1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className).slice(0, 90),
          left: Math.round(r.left),
          right: Math.round(r.right),
          text: (el.textContent || "").trim().slice(0, 50),
        });
        if (offenders.length >= 6) break;
      }
    }
  }

  for (const el of document.querySelectorAll("a, button, input, select, textarea, [role=button]")) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (style.position === "fixed") continue;
    const name = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("placeholder") || el.tagName).trim().slice(0, 45);
    const parentInlineText = el.tagName === "A" && (el.textContent || "").trim().length > 0 && getComputedStyle(el).display === "inline";
    if ((r.width < 44 || r.height < 44) && !parentInlineText) {
      smallTargets.push({ tag: el.tagName.toLowerCase(), name, w: Math.round(r.width), h: Math.round(r.height) });
      if (smallTargets.length >= 12) smallTargets.pop();
    }
    if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") && parseFloat(style.fontSize) < 16) {
      smallInputs.push({ tag: el.tagName.toLowerCase(), name, fontSize: style.fontSize });
    }
  }

  return {
    overflow: Math.max(0, overflow),
    documentWidth: doc.scrollWidth,
    viewportWidth: window.innerWidth,
    offenders,
    smallTargets: smallTargets.slice(0, 10),
    smallInputs,
  };
}

/* ------------------------------ 1. carica ogni pagina: console + rete */
for (const def of PAGES) {
  const url = BASE + def.path;
  const entry = {
    slug: def.slug,
    url,
    status: null,
    title: null,
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    requestFailures: [],
    failedResponses: [],
    responsive: [],
    screenshots: [],
  };

  const onConsole = (msg) => {
    const type = msg.type();
    if (type === "error") entry.consoleErrors.push(msg.text().slice(0, 300));
    else if (type === "warning") entry.consoleWarnings.push(msg.text().slice(0, 200));
  };
  const onPageError = (err) => entry.pageErrors.push(String(err).slice(0, 300));
  const onRequestFailed = (req) => entry.requestFailures.push(`${req.method()} ${req.url().slice(0, 140)} :: ${req.failure()?.errorText}`);
  const onResponse = (res) => {
    if (res.status() >= 400 && res.request().resourceType() !== "preflight") {
      entry.failedResponses.push(`${res.status()} ${res.request().resourceType()} ${res.url().slice(0, 140)}`);
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    entry.status = res ? res.status() : null;
    await page.waitForNetworkIdle({ idleTime: 400, timeout: 12000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 400));
    entry.title = await page.title();
  } catch (error) {
    entry.requestFailures.push(`navigazione: ${String(error).slice(0, 200)}`);
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
  page.off("response", onResponse);

  report.pages.push(entry);
  const problems = entry.consoleErrors.length + entry.pageErrors.length + entry.requestFailures.length + entry.failedResponses.length;
  console.log(
    `${problems ? "✗" : "✓"} ${def.slug.padEnd(14)} HTTP ${entry.status ?? "—"} · console error: ${entry.consoleErrors.length} · page error: ${entry.pageErrors.length} · richieste fallite: ${entry.requestFailures.length} · risposte ≥400: ${entry.failedResponses.length}`,
  );
}

/* --------------------------- 2. sweep responsive sulle pagine chiave */
console.log("\n\u001b[1mSweep responsive\u001b[0m");
for (const slug of RESPONSIVE_PAGES) {
  const entry = report.pages.find((p) => p.slug === slug);
  const def = PAGES.find((p) => p.slug === slug);
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
    try {
      await page.goto(BASE + def.path, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForNetworkIdle({ idleTime: 300, timeout: 10000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 250));
      const check = await page.evaluate(layoutCheck);
      entry.responsive.push({ width, ...check });

      if (SCREENSHOTS[slug]?.includes(width)) {
        const file = path.join(OUT_SNAP, `${slug}-${width}.png`);
        await page.screenshot({ path: file, fullPage: true });
        entry.screenshots.push(path.relative(process.cwd(), file).split(path.sep).join("/"));
      }

      const flag = check.overflow > 1 ? "✗" : "✓";
      const details = check.overflow > 1 ? `overflow ${check.overflow}px` : "";
      const targets = check.smallTargets.length ? ` · ${check.smallTargets.length} target <44px` : "";
      const inputs = check.smallInputs.length ? ` · ${check.smallInputs.length} input <16px` : "";
      console.log(`${flag} ${slug.padEnd(14)} ${String(width).padStart(4)}px ${details}${targets}${inputs}`);
    } catch (error) {
      entry.responsive.push({ width, error: String(error).slice(0, 200) });
      console.log(`✗ ${slug.padEnd(14)} ${String(width).padStart(4)}px errore: ${String(error).slice(0, 120)}`);
    }
  }
}

/* ------------------------------------------- 3. interazioni principali */
console.log("\n\u001b[1mInterazioni\u001b[0m");

async function gotoAndSettle(url, width = 375) {
  await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForNetworkIdle({ idleTime: 400, timeout: 12000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 500));
}

/* menu mobile */
try {
  await gotoAndSettle(BASE + "/", 375);
  const result = await page.evaluate(async () => {
    const button = document.querySelector('button[aria-controls="menu-mobile"]');
    if (!button) return { found: false };
    const before = document.getElementById("menu-mobile") !== null;
    button.click();
    await new Promise((r) => setTimeout(r, 350));
    const menu = document.getElementById("menu-mobile");
    const links = menu ? menu.querySelectorAll("a").length : 0;
    const expanded = button.getAttribute("aria-expanded");
    button.click();
    await new Promise((r) => setTimeout(r, 350));
    return { found: true, before, links, expanded, after: document.getElementById("menu-mobile") !== null };
  });
  report.interactions.menuMobile = result;
  console.log(`${result.found ? "✓" : "✗"} menu mobile: ${JSON.stringify(result)}`);
} catch (error) {
  report.interactions.menuMobile = { error: String(error).slice(0, 200) };
  console.log(`✗ menu mobile: ${String(error).slice(0, 120)}`);
}

/* avviso cookie */
try {
  await gotoAndSettle(BASE + "/", 390);
  const result = await page.evaluate(async () => {
    const notice = document.querySelector('[role="region"][aria-label*="cookie"]');
    if (!notice) return { found: false, visible: false };
    const button = [...notice.querySelectorAll("button")].find((b) => /capito/i.test(b.textContent || ""));
    const before = notice.getBoundingClientRect().height > 0;
    if (button) button.click();
    await new Promise((r) => setTimeout(r, 350));
    const after = document.querySelector('[role="region"][aria-label*="cookie"]') !== null;
    let stored = null;
    try {
      stored = window.localStorage.getItem("ak-avviso-cookie");
    } catch {}
    return { found: true, visibleBefore: before, visibleAfter: after, stored };
  });
  report.interactions.cookieNotice = result;
  console.log(`${result.found ? "✓" : "✗"} avviso cookie: ${JSON.stringify(result)}`);
} catch (error) {
  report.interactions.cookieNotice = { error: String(error).slice(0, 200) };
  console.log(`✗ avviso cookie: ${String(error).slice(0, 120)}`);
}

/* torna su + progresso di lettura */
try {
  await gotoAndSettle(BASE + "/blog/seo-per-le-persone-come-farsi-trovare-su-google", 390);
  const result = await page.evaluate(async () => {
    window.scrollTo(0, 1600);
    await new Promise((r) => setTimeout(r, 700));
    const buttons = [...document.querySelectorAll("button, a")];
    const backToTop = buttons.find((b) => /torna su/i.test(b.getAttribute("aria-label") || b.textContent || ""));
    const visibleBackToTop = backToTop ? backToTop.getBoundingClientRect().height > 0 : false;
    const progressCandidates = [...document.querySelectorAll("[role=progressbar], div")].filter((el) => {
      const style = getComputedStyle(el);
      return style.position === "fixed" && parseFloat(style.height) <= 6 && el.getBoundingClientRect().width > 100;
    });
    const progressWidth = progressCandidates.length ? progressCandidates[0].getBoundingClientRect().width : null;
    if (backToTop) backToTop.click();
    await new Promise((r) => setTimeout(r, 900));
    return {
      backToTopFound: Boolean(backToTop),
      backToTopVisible: visibleBackToTop,
      scrollAfterClick: Math.round(window.scrollY),
      progressBars: progressCandidates.length,
      progressWidth,
      shareLinks: [...document.querySelectorAll('a[href*="twitter.com/intent"], a[href*="linkedin.com/sharing"], a[href*="api.whatsapp.com"]')].length,
    };
  });
  report.interactions.article = result;
  console.log(`✓ articolo (torna su/progresso/condivisione): ${JSON.stringify(result)}`);
} catch (error) {
  report.interactions.article = { error: String(error).slice(0, 200) };
  console.log(`✗ articolo: ${String(error).slice(0, 120)}`);
}

/* validazione form: non inviare nulla, controlla che il browser blocchi i campi vuoti */
try {
  await gotoAndSettle(BASE + "/contatti", 390);
  const apiCalls = [];
  const onReq = (req) => {
    if (req.url().includes("/api/contatti")) apiCalls.push(req.method());
  };
  page.on("request", onReq);
  const result = await page.evaluate(async () => {
    const form = document.querySelector("form");
    if (!form) return { found: false };
    const submit = form.querySelector('button[type="submit"]');
    const requiredMissing = [...form.querySelectorAll("input[required], textarea[required]")].filter((el) => !el.value).length;
    submit.click();
    await new Promise((r) => setTimeout(r, 800));
    return {
      found: true,
      requiredMissing,
      invalidFields: [...form.querySelectorAll(":invalid")].map((el) => el.getAttribute("name") || el.tagName.toLowerCase()),
    };
  });
  await new Promise((r) => setTimeout(r, 600));
  page.off("request", onReq);
  result.apiCallsAfterEmptySubmit = apiCalls;
  report.interactions.contactForm = result;
  console.log(`${result.found && apiCalls.length === 0 ? "✓" : "!"} form contatti (campi vuoti bloccati): ${JSON.stringify(result)}`);
} catch (error) {
  report.interactions.contactForm = { error: String(error).slice(0, 200) };
  console.log(`✗ form contatti: ${String(error).slice(0, 120)}`);
}

/* ------------------------------------------------ 4. sintesi e salvataggio */
const allResponsive = report.pages.flatMap((p) => p.responsive.filter((r) => r.overflow > 1).map((r) => `${p.slug} ${r.width}px: overflow ${r.overflow}px`));
report.summary = {
  pagesChecked: report.pages.length,
  consoleErrorsTotal: report.pages.reduce((s, p) => s + p.consoleErrors.length, 0),
  pageErrorsTotal: report.pages.reduce((s, p) => s + p.pageErrors.length, 0),
  requestFailuresTotal: report.pages.reduce((s, p) => s + p.requestFailures.length, 0),
  failedResponsesTotal: report.pages.reduce((s, p) => s + p.failedResponses.length, 0),
  overflowIssues: allResponsive,
  screenshots: report.pages.reduce((s, p) => s + p.screenshots.length, 0),
};

writeFileSync(path.join(process.cwd(), "audit", "raw", "responsive.json"), JSON.stringify(report, null, 2));
console.log("\n\u001b[1mSintesi\u001b[0m");
console.log(JSON.stringify(report.summary, null, 2));
console.log("→ dettagli: audit/raw/responsive.json");

await browser.close();

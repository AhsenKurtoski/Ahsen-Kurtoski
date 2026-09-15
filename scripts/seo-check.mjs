/**
 * Controlla l'output della build e verifica che ogni pagina abbia i dati che
 * Google legge: title, description, canonical, Open Graph, JSON-LD, sitemap,
 * robots.txt e feed RSS. Segnala anche i contenuti ancora segnaposto.
 *
 * Uso:
 *   npm run build
 *   npm run seo:check
 *
 * Esce con codice 1 se trova errori, 0 se ci sono solo avvisi.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, ".next", "server", "app");

const RESULTS = { errors: [], warnings: [], ok: 0 };
const errors = (msg) => RESULTS.errors.push(msg);
const warnings = (msg) => RESULTS.warnings.push(msg);

/* ------------------------------------------------------------------ helper */

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const stripTags = (s) => decode(s.replace(/<[^>]*>/g, ""));

/** Elenca ricorsivamente i file .html della build (esclusi quelli interni) */
function collectHtml(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectHtml(full, out);
      continue;
    }
    if (!entry.endsWith(".html")) continue;
    if (entry.startsWith("_")) continue; // _not-found, _global-error
    out.push(path.relative(APP_DIR, full).split(path.sep).join("/"));
  }
  return out;
}

/** ".next/server/app/blog/tag/web.html" → "/blog/tag/web" */
const toRoute = (rel) => {
  const noExt = rel.replace(/\.html$/, "");
  if (noExt === "index") return "/";
  return "/" + noExt.replace(/\/index$/, "");
};

function readBuilt(rel) {
  const full = path.join(APP_DIR, rel);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

/** Estrae i @type dai blocchi application/ld+json presenti nell'HTML */
function extractJsonLd(html) {
  const types = [];
  const broken = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (!node || typeof node !== "object") return;
        if (typeof node["@type"] === "string") types.push(node["@type"]);
        for (const value of Object.values(node)) walk(value);
      };
      walk(JSON.parse(m[1]));
    } catch (err) {
      broken.push(err.message);
    }
  }
  return { types, broken };
}

/* ----------------------------------------------------------- primo controllo */

if (!existsSync(APP_DIR)) {
  console.error(
    "\n✗ Build non trovata (.next/server/app). Esegui prima: npm run build\n",
  );
  process.exit(1);
}

const pages = collectHtml(APP_DIR).sort();
if (pages.length === 0) {
  console.error("\n✗ Nessuna pagina HTML nella build.\n");
  process.exit(1);
}

const routes = [];
const socialUrls = [];

console.log(`\n\u001b[1mVerifica SEO — ${pages.length} pagine nella build\u001b[0m\n`);

for (const rel of pages) {
  const html = readBuilt(rel);
  const route = toRoute(rel);
  routes.push(route);

  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = decode(
    html.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? "",
  );
  const canonical = decode(
    html.match(/<link rel="canonical" href="([^"]*)"/i)?.[1] ?? "",
  );
  const ogImage = decode(
    html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ?? "",
  );
  const ogTitle = decode(
    html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1] ?? "",
  );
  const twitterCard = decode(
    html.match(/<meta name="twitter:card" content="([^"]*)"/i)?.[1] ?? "",
  );
  const { types, broken } = extractJsonLd(html);

  if (!title) errors(`${route}: manca il <title>`);
  else if (title.length > 65)
    warnings(`${route}: title di ${title.length} caratteri (Google ne mostra ~60)`);

  if (!description) errors(`${route}: manca la meta description`);
  else if (description.length < 50)
    warnings(`${route}: description corta (${description.length} caratteri)`);
  else if (description.length > 165)
    warnings(`${route}: description di ${description.length} caratteri, verrà tagliata`);

  if (!canonical) errors(`${route}: manca il canonical`);
  if (!ogTitle) warnings(`${route}: manca og:title`);
  if (!ogImage) warnings(`${route}: manca og:image (anteprima social senza immagine)`);
  if (!twitterCard) warnings(`${route}: manca twitter:card`);
  if (broken.length) errors(`${route}: JSON-LD non valido (${broken[0]})`);
  if (types.length === 0) warnings(`${route}: nessun dato strutturato JSON-LD`);

  // raccoglie gli URL sameAs dichiarati nella home
  if (route === "/" || route === "/contatti") {
    const re = /"sameAs":\s*\[([^\]]*)\]/g;
    let m;
    while ((m = re.exec(html))) {
      for (const url of m[1].match(/"(https?:[^"]+)"/g) ?? []) {
        socialUrls.push(url.replace(/"/g, ""));
      }
    }
  }

  const marker = !title || !description || !canonical || broken.length ? "✗" : "✓";
  if (marker === "✓") RESULTS.ok++;
  const ld = types.length ? types.join(", ") : "—";
  console.log(`${marker} ${route.padEnd(52)} ${ld}`);
}

/* --------------------------------------------------------- sitemap e robots */

const sitemap = readBuilt("sitemap.xml.body");
if (!sitemap) {
  errors("sitemap.xml non generata");
} else {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const paths = locs.map((l) => {
    try {
      return new URL(l).pathname.replace(/\/$/, "") || "/";
    } catch {
      return l;
    }
  });
  if (locs.length === 0) errors("sitemap.xml senza URL");

  const missing = routes.filter((r) => !paths.includes(r));
  if (missing.length)
    warnings(`sitemap.xml non include: ${missing.join(", ")}`);

  console.log(
    `\n✓ sitemap.xml: ${locs.length} URL (${paths.length === routes.length ? "tutte le pagine" : "parziale"})`,
  );

  if (locs.length) {
    const first = locs[0];
    if (first.includes("axsenkurtoski.com")) {
      warnings(
        `la sitemap punta al dominio di default (${new URL(first).origin}): imposta NEXT_PUBLIC_SITE_URL con il dominio reale prima del deploy`,
      );
    } else {
      console.log(`✓ dominio di riferimento: ${new URL(first).origin}`);
    }
  }
}

const robots = readBuilt("robots.txt.body");
if (!robots) {
  errors("robots.txt non generato");
} else {
  if (!/User-Agent/i.test(robots)) errors("robots.txt senza User-Agent");
  if (!/Sitemap:/i.test(robots)) errors("robots.txt non dichiara la sitemap");
  if (/Disallow:\s*\/\s*$/m.test(robots))
    errors("robots.txt blocca l'intero sito (Disallow: /)");
  console.log("✓ robots.txt presente e permette la scansione");
}

const feed = readBuilt("feed.xml.body");
if (!feed) {
  warnings("feed.xml non generato");
} else {
  const items = (feed.match(/<item>/g) ?? []).length;
  console.log(`✓ feed.xml con ${items} articoli`);
}

/* -------------------------------------------------------- contenuti e domini */

const siteSrc = readFileSync(path.join(ROOT, "src", "lib", "site.ts"), "utf8");

/** Nome del campo in site.ts → domini che contano come profilo reale */
const SOCIAL_DOMAINS = {
  github: ["github.com"],
  linkedin: ["linkedin.com"],
  instagram: ["instagram.com"],
  fiverr: ["fiverr.com"],
  x: ["x.com/", "twitter.com"],
  youtube: ["youtube.com", "youtu.be"],
};

const emptySocials = Object.keys(SOCIAL_DOMAINS).filter((s) =>
  new RegExp(`${s}:\\s*""`).test(siteSrc),
);
if (emptySocials.length) {
  warnings(
    `profili social lasciati vuoti (non compaiono nel sito): ${emptySocials.join(", ")}`,
  );
}

const declaredUrls = siteSrc.match(/https?:\/\/[^\s"']+/g) ?? [];
const claimed = declaredUrls.filter((u) =>
  Object.values(SOCIAL_DOMAINS).some((domains) =>
    domains.some((d) => u.includes(d)),
  ),
);
if (claimed.length && socialUrls.length === 0) {
  warnings(
    "i profili social sono configurati ma non arrivano nei dati strutturati (sameAs)",
  );
}

// Segnaposto veri: email/domini finti o testi non ancora personalizzati.
// (Un controllo tipo `site.email.includes("example.com")` non è un segnaposto:
// per questo si cercano solo pattern completi.)
const PLACEHOLDER_PATTERNS = [
  { label: "email fittizia", re: /[\w.+-]+@example\.(com|org|net)/ },
  {
    label: "dominio fittizio",
    re: /https?:\/\/(www\.)?example\.(com|org|net)/,
  },
  { label: "testo di riempimento", re: /Lorem ipsum/i },
  {
    label: "dominio da sostituire",
    re: /TUO-DOMINIO|tuo-dominio\.vercel\.app/i,
  },
];

const placeholderHits = [];
const scanFile = (full) => {
  const text = readFileSync(full, "utf8");
  for (const { label, re } of PLACEHOLDER_PATTERNS) {
    if (re.test(text)) {
      placeholderHits.push(`${path.relative(ROOT, full)} (${label})`);
    }
  }
};
const walkSrc = (d) => {
  for (const entry of readdirSync(d)) {
    const full = path.join(d, entry);
    if (statSync(full).isDirectory()) {
      walkSrc(full);
      continue;
    }
    if (/\.[jt]sx?$/.test(entry)) scanFile(full);
  }
};
for (const dir of ["src/lib", "src/app", "src/components", "src/content"]) {
  walkSrc(path.join(ROOT, dir));
}
if (placeholderHits.length) {
  warnings(
    `contenuti segnaposto da sostituire: ${[...new Set(placeholderHits)].join(", ")}`,
  );
}

if (claimed.length) {
  console.log(`✓ profili social dichiarati: ${[...new Set(claimed)].length}`);
  const uniqueSameAs = new Set(socialUrls);
  if (uniqueSameAs.size) {
    console.log(`✓ sameAs nei dati strutturati: ${uniqueSameAs.size} URL`);
  }
}

/* ----------------------------------------------------------------- report */

const { errors: errs, warnings: warns } = RESULTS;

console.log(`\n\u001b[1mRisultato\u001b[0m`);
console.log(`  pagine ok: ${RESULTS.ok}/${pages.length}`);

if (warns.length) {
  console.log(`\n\u001b[33mAvvisi (${warns.length}):\u001b[0m`);
  for (const w of warns) console.log(`  ! ${w}`);
}

if (errs.length) {
  console.log(`\n\u001b[31mErrori (${errs.length}):\u001b[0m`);
  for (const e of errs) console.log(`  ✗ ${e}`);
  console.log("\n\u001b[31mVerifica fallita.\u001b[0m\n");
  process.exit(1);
}

console.log(
  `\n\u001b[32mTutto in ordine: ogni pagina espone i dati che Google legge.\u001b[0m\n`,
);

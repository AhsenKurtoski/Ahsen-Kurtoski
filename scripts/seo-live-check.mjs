/**
 * Controlla il sito PUBBLICATO (non la build locale): verifica i prerequisiti
 * che Google richiede davvero per scansionare e indicizzare le pagine.
 *
 * Uso:
 *   node scripts/seo-live-check.mjs https://tuo-dominio.com
 *   npm run seo:live -- https://tuo-dominio.com
 *
 * Esce con codice 1 se trova problemi bloccanti.
 */
const UA = "AxsenKurtoski-SEO-Check/1.0 (+audit)";

const rawUrl = process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
const siteUrl = rawUrl.replace(/\/+$/, "");

if (!/^https?:\/\//.test(siteUrl)) {
  console.error(
    "\n✗ Indica l'indirizzo del sito pubblicato, ad esempio:\n" +
      "  npm run seo:live -- https://axsen-kurtoski.vercel.app\n",
  );
  process.exit(1);
}

const host = new URL(siteUrl).host;
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(siteUrl);
const isHttps = siteUrl.startsWith("https://");

const findings = { errors: [], warnings: [] };
const problem = (m) => findings.errors.push(m);
const warn = (m) => findings.warnings.push(m);
const ok = (m) => console.log(`✓ ${m}`);

console.log(`\n\u001b[1mAudit indicizzazione — ${siteUrl}\u001b[0m\n`);

async function get(url, options = {}) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: options.redirect ?? "follow",
      method: options.method ?? "GET",
      headers: { "User-Agent": UA, Accept: options.accept ?? "*/*" },
    });
    const ms = Date.now() - started;
    const text = options.method === "HEAD" ? "" : await res.text();
    return { res, text, ms, error: null };
  } catch (err) {
    return { res: null, text: "", ms: Date.now() - started, error: err };
  }
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

/* ------------------------------------------------ 1. protocollo e dominio */

if (!isHttps && !isLocal) {
  problem("il sito non usa HTTPS: Google dà priorità ai siti sicuri e molti browser avvisano");
}

if (!isLocal) {
  const plain = await get(siteUrl.replace(/^https:/, "http:") + "/", {
    redirect: "manual",
  });
  if (plain.error) {
    warn(`non ho potuto verificare il redirect da http: ${plain.error.message}`);
  } else if ([301, 302, 307, 308].includes(plain.res.status)) {
    const to = plain.res.headers.get("location") ?? "";
    if (to.startsWith("https://")) ok("http:// reindirizza a https://");
    else problem(`http:// reindirizza a ${to} (atteso https://)`);
  } else {
    warn(
      `http:// risponde ${plain.res.status} senza reindirizzare a https:// (non bloccante, ma meglio forzare HTTPS)`,
    );
  }
}

/* ------------------------------------------------------------ 2. robots.txt */

const robots = await get(`${siteUrl}/robots.txt`);
if (robots.error || !robots.res?.ok) {
  problem(`robots.txt non raggiungibile (${robots.error?.message ?? `HTTP ${robots.res?.status}`})`);
} else {
  const body = robots.text;
  const sitemapLines = body.match(/Sitemap:\s*(\S+)/gi) ?? [];
  const disallowsAll = /^\s*Disallow:\s*\/\s*$/im.test(body);

  if (disallowsAll) {
    problem("robots.txt contiene 'Disallow: /': blocca il sito intero, Google non può scansionarlo");
  } else if (/^\s*Disallow:\s*\/\s*$/im.test(body.replace(/<[^>]*>/g, ""))) {
    problem("robots.txt sembra bloccare tutto");
  } else {
    ok("robots.txt permette la scansione");
  }

  if (sitemapLines.length) ok(`robots.txt dichiara la sitemap: ${sitemapLines[0].split(": ")[1]}`);
  else warn("robots.txt non dichiara la sitemap (funziona lo stesso, ma è meglio aggiungerla)");
}

/* ----------------------------------------------------------- 3. sitemap.xml */

const sitemap = await get(`${siteUrl}/sitemap.xml`);
let sitemapUrls = [];

if (sitemap.error || !sitemap.res?.ok) {
  problem(`sitemap.xml non raggiungibile (${sitemap.error?.message ?? `HTTP ${sitemap.res?.status}`})`);
} else {
  sitemapUrls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (sitemapUrls.length === 0) {
    problem("sitemap.xml non contiene URL");
  } else {
    ok(`sitemap.xml valida con ${sitemapUrls.length} URL`);

    const foreign = sitemapUrls.filter((u) => {
      try {
        return new URL(u).host !== host;
      } catch {
        return true;
      }
    });
    if (foreign.length) {
      problem(
        `la sitemap contiene URL di un altro dominio (${foreign.slice(0, 3).join(", ")}): ` +
          "succede quando NEXT_PUBLIC_SITE_URL non è impostato al momento del deploy",
      );
    }

    const lastmods = [...sitemap.text.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
    const badLastmod = lastmods.filter((d) => Number.isNaN(Date.parse(d)));
    if (badLastmod.length) {
      problem(`lastmod in formato non valido: ${badLastmod.slice(0, 2).join(", ")}`);
    } else if (lastmods.length === sitemapUrls.length) {
      const today = new Date().toISOString().slice(0, 10);
      const allToday = lastmods.every((d) => d.slice(0, 10) === today);
      if (allToday) {
        warn(
          "tutte le pagine hanno lastmod di oggi: se non hai modificato davvero tutto, Google impara a ignorare questa data",
        );
      } else {
        ok("lastmod presente e con date varie (segnale utile per Google)");
      }
    }
  }
}

/* ----------------------------------------------------------- 4. le pagine */

const MAX_PAGES = 30;
const pages = sitemapUrls.slice(0, MAX_PAGES);
const rendered = [];
const missingPages = sitemapUrls.length > MAX_PAGES;

console.log(`\n\u001b[1mPagine verificate (${pages.length}${missingPages ? ` di ${sitemapUrls.length}` : ""})\u001b[0m`);

for (const url of pages) {
  const { res, text, ms, error } = await get(url);
  const route = new URL(url).pathname || "/";

  if (error || !res?.ok) {
    problem(`${route}: non raggiungibile (${error?.message ?? `HTTP ${res?.status}`})`);
    console.log(`✗ ${route.padEnd(50)} HTTP ${res?.status ?? "errore"}`);
    continue;
  }

  const issues = [];
  const title = decode(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = decode(
    text.match(/<meta name="description" content="([^"]*)"/i)?.[1] ?? "",
  );
  const canonical = decode(
    text.match(/<link rel="canonical" href="([^"]*)"/i)?.[1] ?? "",
  );
  const ogImage = decode(
    text.match(/<meta property="og:image" content="([^"]*)"/i)?.[1] ?? "",
  );
  const metaRobots = text.match(/<meta name="robots" content="([^"]*)"/i)?.[1] ?? "";
  const headerRobots = res.headers.get("x-robots-tag") ?? "";
  const jsonLdTypes = [];
  for (const m of text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (node && typeof node === "object") {
          if (typeof node["@type"] === "string") jsonLdTypes.push(node["@type"]);
          Object.values(node).forEach(walk);
        }
      };
      walk(JSON.parse(m[1]));
    } catch {
      issues.push("JSON-LD non valido");
    }
  }

  if (!title) issues.push("senza <title>");
  if (!description) issues.push("senza description");
  if (!canonical) issues.push("senza canonical");
  else {
    const expected = url.replace(/\/$/, "");
    if (canonical.replace(/\/$/, "") !== expected) {
      issues.push(`canonical diverso dall'URL (${canonical})`);
    }
  }
  if (/noindex/i.test(metaRobots)) issues.push("meta robots noindex: Google non la indicizzerà");
  if (/noindex/i.test(headerRobots)) issues.push(`X-Robots-Tag noindex: ${headerRobots}`);
  if (!ogImage) issues.push("senza og:image");

  // Contenuto presente nell'HTML: se la pagina è un guscio JavaScript, Google
  // può comunque eseguirlo, ma è più lento e meno affidabile.
  const bodyText = text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (bodyText.length < 400) issues.push("poco testo nell'HTML servito (pagina troppo dipendente da JavaScript)");
  if (!jsonLdTypes.length) issues.push("nessun dato strutturato");

  if (ogImage) rendered.push({ route, ogImage });

  if (ms > 1500) warn(`${route}: risposta lenta (${ms} ms)`);

  if (issues.length) {
    problem(`${route}: ${issues.join("; ")}`);
    console.log(`✗ ${route.padEnd(50)} ${issues[0]}`);
  } else {
    console.log(`✓ ${route.padEnd(50)} ${jsonLdTypes.slice(0, 3).join(", ")}`);
  }
}

/* -------------------------------------------- 5. immagini social e asset */

for (const { route, ogImage } of rendered) {
  const { res, error } = await get(ogImage, { method: "HEAD" });
  if (error || !res?.ok) {
    problem(`immagine social di ${route} non raggiungibile (${error?.message ?? `HTTP ${res?.status}`})`);
  } else if (!/^image\//.test(res.headers.get("content-type") ?? "")) {
    problem(`l'immagine social di ${route} non è un'immagine (${res.headers.get("content-type")})`);
  }
}
if (rendered.length) ok(`${rendered.length} immagini social raggiungibili e di tipo immagine`);

const assets = [
  "/favicon.ico",
  "/icon-192.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
  "/feed.xml",
];
for (const asset of assets) {
  const { res, error } = await get(`${siteUrl}${asset}`, { method: "HEAD" });
  if (error || !res?.ok) {
    warn(`${asset} risponde ${res?.status ?? error?.message}: meglio che ci sia`);
  } else {
    console.log(`✓ ${asset}`);
  }
}

/* ---------------------------------------------- 6. errori 404 e duplicati */

const notFound = await get(`${siteUrl}/pagina-che-non-esiste-${Date.now()}`, {
  redirect: "manual",
});
if (notFound.error) {
  warn(`non ho potuto verificare la pagina 404: ${notFound.error.message}`);
} else if (notFound.res.status === 404) {
  ok("le pagine inesistenti rispondono 404 (niente soft-404)");
} else if ([301, 302, 307, 308].includes(notFound.res.status)) {
  ok("le pagine inesistenti reindirizzano (302/301) invece di dare errore");
} else {
  problem(
    `una pagina inesistente risponde ${notFound.res.status}: se dice 200 Google indicizza contenuti spazzatura`,
  );
}

for (const url of sitemapUrls.slice(0, 5)) {
  if (url.endsWith("/")) continue;
  // La home non ha una variante con barra finale: `https://sito` e
  // `https://sito/` producono la stessa richiesta HTTP (`GET /`), quindi non
  // sono due URL diversi e non c'è niente da segnalare.
  if (new URL(url).pathname === "/") continue;
  const variant = await get(`${url}/`, { redirect: "manual" });
  if (!variant.error && variant.res.status === 200) {
    problem(`${new URL(url).pathname} funziona sia con sia senza slash finale: due URL per la stessa pagina`);
  }
}

/* ---------------------------------------------------------------- report */

const { errors, warnings } = findings;
console.log("\n\u001b[1mRisultato\u001b[0m");

if (warnings.length) {
  console.log(`\n\u001b[33mAvvisi (${warnings.length}):\u001b[0m`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (errors.length) {
  console.log(`\n\u001b[31mProblemi che impediscono o rallentano l'indicizzazione (${errors.length}):\u001b[0m`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log("\n\u001b[31mDa sistemare prima di contare su Google.\u001b[0m\n");
  process.exit(1);
}

console.log(
  "\n\u001b[32mTutto a posto: il sito è scansionabile e indicizzabile.\u001b[0m\n" +
    "Ricorda che l'indicizzazione non è istantanea: Google decide quando, da poche ore a qualche settimana.\n",
);

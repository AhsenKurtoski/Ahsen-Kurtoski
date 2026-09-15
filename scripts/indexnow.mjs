/**
 * Segnala gli URL del sito agli search engine che supportano IndexNow
 * (Bing, quindi anche DuckDuckGo, più Yandex, Seznam e Naver).
 * La notifica è condivisa: basta inviarla una volta.
 *
 * ⚠️ Google NON usa IndexNow. Per Google servono Search Console e la sitemap:
 * vedi PREREQUISITI.md.
 *
 * Uso:
 *   node scripts/indexnow.mjs https://tuo-dominio.com
 *   node scripts/indexnow.mjs https://tuo-dominio.com --url /blog/nuovo-articolo
 *   node scripts/indexnow.mjs --key              # mostra/serve solo il file chiave
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const KEY_FILE = path.join(process.cwd(), ".indexnow-key");

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const positionals = args.filter((a) => !a.startsWith("--"));
const singleUrlIndex = args.indexOf("--url");
const singleUrl = singleUrlIndex === -1 ? null : args[singleUrlIndex + 1];

let siteUrl = positionals[0] ?? process.env.NEXT_PUBLIC_SITE_URL;
if (siteUrl) siteUrl = siteUrl.replace(/\/+$/, "");

const log = (msg) => console.log(msg);

/* ------------------------------------------------------------- chiave */

/** Recupera la chiave da env o dal file locale; la crea se non esiste */
function loadOrCreateKey() {
  if (process.env.INDEXNOW_KEY) {
    return { key: process.env.INDEXNOW_KEY, created: false };
  }
  if (existsSync(KEY_FILE)) {
    return { key: readFileSync(KEY_FILE, "utf8").trim(), created: false };
  }

  // 32 caratteri esadecimali: dentro i limiti richiesti (8-128, solo [a-z0-9-])
  const generated = randomBytes(16).toString("hex");
  writeFileSync(KEY_FILE, generated, "utf8");
  writeFileSync(path.join(PUBLIC_DIR, `${generated}.txt`), generated, "utf8");
  return { key: generated, created: true };
}

const { key, created: keyCreated } = loadOrCreateKey();
const keyPath = path.join(PUBLIC_DIR, `${key}.txt`);
// Il file deve esistere in public/ al momento del deploy: se manca, lo ricreo
const keyFileCreated = keyCreated || !existsSync(keyPath);
if (!existsSync(keyPath)) writeFileSync(keyPath, key, "utf8");

log(`\n\u001b[1mIndexNow\u001b[0m`);
log(`  chiave: ${key}`);
log(
  `  file di verifica: public/${key}.txt${keyFileCreated ? " (appena creato)" : ""}`,
);

if (flags.includes("--key") || flags.includes("--setup")) {
  const domain = siteUrl ?? "https://tuo-dominio";
  log(
    `\n\u001b[33mProssimo passo:\u001b[0m fai il deploy, così il file chiave è online su\n` +
      `  ${domain}/${key}.txt\n` +
      `poi lancia:\n  node scripts/indexnow.mjs ${domain}\n`,
  );
  process.exit(0);
}

if (!siteUrl || !/^https?:\/\//.test(siteUrl)) {
  console.error(
    "\n✗ Serve l'URL del sito pubblicato, ad esempio:\n" +
      "  node scripts/indexnow.mjs https://axsen-kurtoski.vercel.app\n",
  );
  process.exit(1);
}

/* ------------------------------------------- verifica della proprietà */

const keyLocation = `${siteUrl}/${key}.txt`;
log(`  sito: ${siteUrl}`);

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "AxsenKurtoski-SEO-Check/1.0" },
  });
  return { res, text: await res.text() };
}

try {
  const { res, text } = await fetchText(keyLocation);
  if (!res.ok) {
    console.error(
      `\n✗ Il file chiave non è raggiungibile (HTTP ${res.status} su ${keyLocation}).\n` +
        `  Il file è stato creato in public/${key}.txt: serve un nuovo deploy prima di inviare gli URL.\n`,
    );
    process.exit(1);
  }
  if (text.trim() !== key) {
    console.error(
      `\n✗ Il file ${keyLocation} non contiene la chiave attesa.\n` +
        `  Contenuto trovato: "${text.trim().slice(0, 40)}"\n`,
    );
    process.exit(1);
  }
  log("✓ proprietà del sito verificata (file chiave online e corretto)");
} catch (err) {
  console.error(`\n✗ Impossibile raggiungere ${keyLocation}: ${err.message}\n`);
  process.exit(1);
}

/* ------------------------------------------------------------- URL */

let urlList;

if (singleUrl) {
  urlList = [singleUrl.startsWith("http") ? singleUrl : `${siteUrl}${singleUrl.startsWith("/") ? "" : "/"}${singleUrl}`];
  log(`\nInvio di 1 URL: ${urlList[0]}`);
} else {
  const { res, text } = await fetchText(`${siteUrl}/sitemap.xml`);
  if (!res.ok) {
    console.error(`\n✗ Sitemap non raggiungibile (HTTP ${res.status} su ${siteUrl}/sitemap.xml)\n`);
    process.exit(1);
  }
  urlList = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urlList.length === 0) {
    console.error("\n✗ La sitemap non contiene URL.\n");
    process.exit(1);
  }
  log(`\nInvio di ${urlList.length} URL dalla sitemap`);
}

/* ---------------------------------------------------------- invio */

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "AxsenKurtoski-SEO-Check/1.0",
  },
  body: JSON.stringify({
    host: new URL(siteUrl).host,
    key,
    keyLocation,
    urlList,
  }),
});

const meaning = {
  200: "URL accettati: verranno scansionati presto",
  202: "accettati, verifica della chiave in corso",
  400: "richiesta non valida (formato URL o JSON)",
  403: "chiave non valida o file chiave non trovato",
  422: "gli URL non appartengono a questo host, oppure la chiave non rispetta il formato",
  429: "troppe richieste: riprova più tardi",
};

const advice = {
  400: "Il formato della richiesta o degli URL non è valido.",
  403: "Il file chiave non è online, oppure non contiene esattamente la chiave.",
  422: `Gli URL devono appartenere all'host dichiarato (${new URL(siteUrl).host}): controlla che la sitemap usi lo stesso dominio.`,
  429: "Hai inviato troppe richieste in poco tempo: aspetta qualche minuto, insistere non aiuta.",
};

log(`\nHTTP ${response.status} — ${meaning[response.status] ?? "risposta inattesa"}`);

if (!response.ok) {
  console.error(`\n✗ Invio non riuscito. ${advice[response.status] ?? "Riprova più tardi."}\n`);
  process.exit(1);
}

log(
  `\n\u001b[32mFatto.\u001b[0m Gli URL sono stati segnalati a Bing (e DuckDuckGo), Yandex, Seznam e Naver.\n` +
    `Ricorda: Google non partecipa a IndexNow — per Google servono Search Console e la sitemap.\n`,
);

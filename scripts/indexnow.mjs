/**
 * Segnala gli URL del sito agli search engine che supportano IndexNow
 * (Bing, quindi anche DuckDuckGo, più Yandex, Seznam e Naver).
 * La notifica è condivisa: basta inviarla una volta.
 *
 * ⚠️ Google NON usa IndexNow. Per Google servono Search Console e la sitemap:
 * vedi PREREQUISITI.md. La sitemap si aggiorna da sola (con i <lastmod> veri),
 * quindi Google rilegge gli articoli nuovi senza che tu faccia niente.
 *
 * Uso:
 *   node scripts/indexnow.mjs https://tuo-dominio.com       # tutti gli URL della sitemap
 *   node scripts/indexnow.mjs --changed                    # solo ciò che è cambiato (git)
 *   node scripts/indexnow.mjs --changed --wait 300         # ...dopo aver atteso il deploy
 *   node scripts/indexnow.mjs --url /blog/nuovo-articolo   # un singolo URL
 *   node scripts/indexnow.mjs --key                        # mostra/serve solo il file chiave
 *
 *   --dry-run      mostra cosa invierebbe, senza inviare né scrivere file
 *   --base <ref>   commit/ref da confrontare (default: INDEXNOW_BASE, poi HEAD~1)
 *   --wait <sec>   aspetta che gli URL rispondano 200 prima di segnalarli
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ENDPOINT =
  process.env.INDEXNOW_ENDPOINT ?? "https://api.indexnow.org/indexnow";
const PUBLIC_DIR = path.join(process.cwd(), "public");
const KEY_FILE = path.join(process.cwd(), ".indexnow-key");
const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");
/** Stesso dominio di riserva usato da src/lib/site.ts */
const DEFAULT_SITE = "https://ahsenkurtoski.vercel.app";

/* -------------------------------------------------- argomenti */

const VALUE_FLAGS = new Set(["url", "base", "wait"]);
const flags = new Set();
const values = new Map();
const positionals = [];

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (!arg.startsWith("--")) {
    positionals.push(arg);
    continue;
  }
  const [name, inlineValue] = arg.slice(2).split("=");
  if (inlineValue !== undefined) {
    values.set(name, inlineValue);
  } else if (VALUE_FLAGS.has(name) && argv[i + 1] && !argv[i + 1].startsWith("--")) {
    values.set(name, argv[++i]);
  } else {
    flags.add(name);
  }
}

const dryRun = flags.has("dry-run");
const changedOnly = flags.has("changed");
const waitSeconds = Number(values.get("wait") ?? 0) || 0;

let siteUrl = positionals[0] ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE;
siteUrl = siteUrl.replace(/\/+$/, "");
if (siteUrl && !/^https?:\/\//.test(siteUrl)) siteUrl = `https://${siteUrl}`;

const log = (msg) => console.log(msg);
const ok = (msg) => log(`\u001b[32m✓\u001b[0m ${msg}`);
const warn = (msg) => log(`\u001b[33m!\u001b[0m ${msg}`);

/**
 * Uscita pulita. Su Windows chiudere il processo nello stesso istante in cui
 * fetch sta ancora rilasciando i suoi socket fa stampare a libuv un assert
 * incomprensibile ("Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)")
 * e può nascondere l'esito vero del comando. Lascio quindi un attimo per far
 * finire la chiusura delle connessioni prima di uscire.
 */
async function finish(code = 0) {
  process.exitCode = code;
  await new Promise((resolve) => setTimeout(resolve, 300));
  process.exit(code);
}

/* --------------------------------------------------------- chiave */

/**
 * La chiave arriva, nell'ordine: da INDEXNOW_KEY, da .indexnow-key (ignorato da
 * git) oppure — caso della CI, dove .indexnow-key non esiste — dal file già
 * committato in public/, così la chiave resta la stessa che il sito pubblica.
 */
function resolveKey() {
  if (process.env.INDEXNOW_KEY) {
    return { key: process.env.INDEXNOW_KEY.trim(), generated: false };
  }
  if (existsSync(KEY_FILE)) {
    return { key: readFileSync(KEY_FILE, "utf8").trim(), generated: false };
  }

  const published = findPublishedKey();
  if (published) return { key: published, generated: false };

  const generated = randomBytes(16).toString("hex");
  if (!dryRun) {
    writeFileSync(KEY_FILE, generated, "utf8");
    writeFileSync(path.join(PUBLIC_DIR, `${generated}.txt`), generated, "utf8");
  }
  return { key: generated, generated: true };
}

/** Cerca in public/ un file <chiave>.txt già committato (nome = contenuto) */
function findPublishedKey() {
  let files = [];
  try {
    files = readdirSync(PUBLIC_DIR);
  } catch {
    return null;
  }
  for (const file of files) {
    if (!/^[a-f0-9]{8,128}\.txt$/i.test(file)) continue;
    const name = file.replace(/\.txt$/, "");
    try {
      if (readFileSync(path.join(PUBLIC_DIR, file), "utf8").trim() === name) {
        return name;
      }
    } catch {
      /* file illeggibile: lo ignoro */
    }
  }
  return null;
}

/* --------------------------------------------- cosa è cambiato */

function git(lines) {
  try {
    return execFileSync("git", lines, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function refExists(ref) {
  if (!ref || /^0+$/.test(ref)) return false;
  try {
    execFileSync("git", ["rev-parse", "--verify", `${ref}^{commit}`], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

/** File toccati: differenze col ref di base, modifiche locali e file non tracciati */
function changedFiles() {
  const files = new Set();
  const base = values.get("base") ?? process.env.INDEXNOW_BASE;

  if (refExists(base)) {
    git(["diff", "--name-only", `${base}..HEAD`]).forEach((f) => files.add(f));
    log(`  confronto con: ${base}..HEAD`);
  } else if (refExists("HEAD~1")) {
    git(["diff", "--name-only", "HEAD~1..HEAD"]).forEach((f) => files.add(f));
    log("  confronto con: HEAD~1..HEAD");
  } else {
    log("  nessun ref di base disponibile: guardo solo le modifiche locali");
  }

  git(["diff", "--name-only", "HEAD"]).forEach((f) => files.add(f));
  git(["diff", "--name-only", "--cached"]).forEach((f) => files.add(f));
  git(["ls-files", "--others", "--exclude-standard"]).forEach((f) => files.add(f));

  return [...files];
}

/** File che, se cambiano, rendono "nuovo" tutto il sito */
const GLOBAL_PREFIXES = [
  "src/lib/site.ts",
  "src/app/layout.tsx",
  "src/app/globals.css",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/components/",
];

/** Stesso slug usato dalle pagine tag (vedi tagToSlug in src/lib/posts.ts) */
function tagToSlug(tag) {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Traduce l'elenco dei file cambiati in URL da segnalare.
 * Restituisce `null` quando conviene segnalare tutto il sito.
 */
function urlsFromChanges(files) {
  if (files.some((f) => GLOBAL_PREFIXES.some((g) => f === g || f.startsWith(g)))) {
    return null;
  }

  const urls = new Set();

  for (const file of files) {
    const post = /^src\/content\/posts\/(.+)\.md$/.exec(file);
    if (post) {
      const slug = post[1];
      const absolute = path.join(POSTS_DIR, `${slug}.md`);
      if (existsSync(absolute)) {
        urls.add(`/blog/${slug}`);
        const tags = /^tags:\s*(.+)$/m.exec(readFileSync(absolute, "utf8"))?.[1] ?? "";
        for (const tag of tags.split(",").map((t) => t.trim()).filter(Boolean)) {
          urls.add(`/blog/tag/${tagToSlug(tag)}`);
        }
      }
      // L'elenco e il feed cambiano in ogni caso (anche se l'articolo è stato rimosso)
      urls.add("/blog");
      urls.add("/feed.xml");
      continue;
    }

    if (file.startsWith("src/app/blog")) {
      urls.add("/blog");
      urls.add("/feed.xml");
      continue;
    }
    if (file.startsWith("src/app/chi-sono")) {
      urls.add("/chi-sono");
      continue;
    }
    if (file.startsWith("src/app/contatti")) {
      urls.add("/contatti");
      continue;
    }
    if (file.startsWith("src/app/feed.xml")) {
      urls.add("/feed.xml");
      continue;
    }
    if (file === "src/app/page.tsx") {
      urls.add("/");
    }
  }

  return [...urls];
}

/* -------------------------------------------------- URL finali */

async function fetchWithTimeout(url, ms = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "AhsenKurtoski-SEO-Check/1.0" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function sitemapUrls() {
  const res = await fetchWithTimeout(`${siteUrl}/sitemap.xml`);
  if (!res.ok) {
    throw new Error(`Sitemap non raggiungibile (HTTP ${res.status})`);
  }
  const text = await res.text();
  const urls = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) throw new Error("La sitemap non contiene URL");
  return urls;
}

/** Tiene solo gli URL già online (con --wait aspetta che il deploy finisca) */
async function keepLiveUrls(urls, seconds) {
  const pending = new Set(urls);
  const live = [];
  const deadline = Date.now() + seconds * 1000;

  const isLive = async (url) => {
    try {
      const res = await fetchWithTimeout(url);
      return res.ok;
    } catch {
      return false;
    }
  };

  while (pending.size > 0) {
    const results = await Promise.all(
      [...pending].map(async (url) => [url, await isLive(url)]),
    );
    for (const [url, up] of results) {
      if (up) {
        live.push(url);
        pending.delete(url);
      }
    }
    if (pending.size === 0 || Date.now() + 10000 > deadline) break;
    log(`  in attesa del deploy: ${pending.size} URL non ancora online...`);
    await new Promise((r) => setTimeout(r, 10000));
  }

  for (const url of pending) {
    warn(`non ancora online, segnalazione rimandata: ${url}`);
  }
  return urls.filter((url) => live.includes(url));
}

/* ------------------------------------------------------- main */

log("\n\u001b[1mIndexNow\u001b[0m");

if (!siteUrl || !/^https?:\/\//.test(siteUrl)) {
  console.error(
    "\n✗ Serve l'URL del sito pubblicato, ad esempio:\n" +
      "  node scripts/indexnow.mjs https://ahsen-kurtoski.vercel.app\n",
  );
  await finish(1);
}

const { key, generated } = resolveKey();
const keyPath = path.join(PUBLIC_DIR, `${key}.txt`);
const keyTracked = existsSync(keyPath) && readFileSync(keyPath, "utf8").trim() === key;

log(`  chiave: ${key}${generated ? " (nuova)" : ""}`);
log(`  file di verifica: public/${key}.txt${keyTracked ? " ✓" : " (appena creato)"}`);
log(`  sito: ${siteUrl}${dryRun ? "  \u001b[36m[prova, nessun invio]\u001b[0m" : ""}`);

if (flags.has("key") || flags.has("setup")) {
  log(
    `\n\u001b[33mProssimo passo:\u001b[0m fai il deploy, così il file chiave è online su\n` +
      `  ${siteUrl}/${key}.txt\n` +
      `poi lancia:\n  node scripts/indexnow.mjs ${siteUrl}\n`,
  );
  await finish(0);
}

/* --- elenco URL --- */

let urlList = [];
let mode;

if (values.has("url")) {
  const raw = values.get("url");
  urlList = [raw.startsWith("http") ? raw : `${siteUrl}${raw.startsWith("/") ? "" : "/"}${raw}`];
  mode = "URL indicato a mano";
} else if (changedOnly) {
  const files = changedFiles();
  const derived = urlsFromChanges(files);

  if (derived === null) {
    urlList = await sitemapUrls();
    mode = "modifica globale: segnalo tutto il sito";
  } else if (derived.length === 0) {
    log(
      "\nNessun contenuto da segnalare: in queste modifiche non c'è nessuna pagina pubblica\n" +
        "(le modifiche a script, configurazioni o documentazione non vanno inviate).\n",
    );
    await finish(0);
  } else {
    urlList = derived.map((u) => `${siteUrl}${u}`);
    mode = `${derived.length} URL cambiati`;
    log(`  file cambiati considerati: ${files.length}`);
  }
} else {
  urlList = await sitemapUrls();
  mode = "tutta la sitemap";
}

urlList = [...new Set(urlList)];

if (waitSeconds > 0 && urlList.length > 0) {
  log(`\nAttendo che gli URL siano online (max ${waitSeconds}s)`);
  urlList = await keepLiveUrls(urlList, waitSeconds);
  if (urlList.length === 0) {
    warn("nessun URL online: nessuna segnalazione inviata");
    await finish(0);
  }
}

log(`\nDa segnalare (${mode}) — ${urlList.length} URL:`);
for (const url of urlList) log(`  · ${url}`);

/* --- verifica che il file chiave sia davvero online --- */

if (!dryRun) {
  try {
    const res = await fetchWithTimeout(`${siteUrl}/${key}.txt`);
    const text = res.ok ? (await res.text()).trim() : "";
    if (!res.ok || text !== key) {
      console.error(
        `\n✗ Il file chiave non è verificabile su ${siteUrl}/${key}.txt (HTTP ${res.status}).\n` +
          `  Il file è in public/: serve un deploy prima di poter inviare gli URL.\n`,
      );
      await finish(1);
    }
    ok(`proprietà verificata: ${siteUrl}/${key}.txt contiene la chiave`);
  } catch (err) {
    console.error(`\n✗ Impossibile raggiungere il file chiave: ${err.message}\n`);
    await finish(1);
  }
}

if (dryRun) {
  log("\n\u001b[36mProva terminata:\u001b[0m nessuna richiesta inviata.\n");
  await finish(0);
}

/* --- invio --- */

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "AhsenKurtoski-SEO-Check/1.0",
  },
  body: JSON.stringify({
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
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
  await finish(1);
}

log(
  `\n\u001b[32mFatto.\u001b[0m Segnalati a Bing (e DuckDuckGo), Yandex, Seznam e Naver.\n` +
    `\u001b[2mGoogle non partecipa a IndexNow: la sitemap si aggiorna da sola, ma se vuoi\n` +
    `spingere un articolo nuovo richiedi l'indicizzazione in Search Console.\u001b[0m\n`,
);

await finish(0);

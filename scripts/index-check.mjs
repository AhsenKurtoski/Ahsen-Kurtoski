#!/usr/bin/env node
/**
 * Segue la migrazione dei due domini nell'indice, con i numeri invece che a occhio.
 *
 * Uso:
 *   npm run index:check
 *   npm run index:check -- --nota "dopo il Cambio di indirizzo in GSC"
 *
 * Cosa scrive:
 *   - `audit/indice-storico.json` (versionato): una voce per esecuzione, con i
 *     numeri di oggi e quelli di ieri a confronto;
 *   - `audit/raw/index-check.json` (non versionato): l'output completo.
 *
 * Il controllo ha due parti, e la differenza fra le due conta:
 *
 * A. **Migrazione (sempre misurabile, nessuna chiave).** Per ogni URL della
 *    sitemap del dominio ufficiale: la pagina risponde 200, il canonical punta
 *    al dominio ufficiale, e la stessa pagina sul **vecchio** dominio fa un
 *    redirect **in un solo salto** verso quella nuova. È la condizione tecnica
 *    che Google chiede per consolidare le due proprietà: se salta, si vede qui.
 *
 * B. **Indice (serve una sorgente configurata).** Quante pagine di ciascun
 *    dominio risultano nell'indice, e quali. Senza una sorgente il report lo
 *    **dice** invece di scrivere zero: uno zero inventato è peggio di un dato
 *    mancante, perché nasconde il problema per settimane.
 *
 * Sorgenti supportate (in ordine di preferenza):
 *   1. `SERPER_API_KEY`                  → risultati Google reali (è la sorgente
 *                                          che serve per seguire la migrazione,
 *                                          visto che il vecchio dominio è
 *                                          indicizzato da Google);
 *   2. `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` → Programmable Search (100 query/giorno
 *                                          nel piano gratuito);
 *   3. nessuna                             → parte A soltanto.
 *
 * Nota su cosa NON funziona: interrogare DuckDuckGo/Bing dall'HTML non è
 * utilizzabile — rispondono con una pagina di challenge (`anomaly`) invece che
 * con i risultati, quindi il controllo fallirebbe in silenzio o con numeri falsi.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const NOTA = args.includes("--nota") ? args[args.indexOf("--nota") + 1] : null;
const NUOVO = "https://ahsenkurtoski.vercel.app";
const VECCHIO = "https://axsenkurtoski.vercel.app";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const STORICO = path.join(process.cwd(), "audit", "indice-storico.json");
const RAW = path.join(process.cwd(), "audit", "raw", "index-check.json");

const unique = (xs) => [...new Set(xs)];

async function get(url, { redirect = "follow", ua = UA } = {}) {
  try {
    const res = await fetch(url, {
      redirect,
      headers: { "User-Agent": ua, Accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
    });
    // La sitemap arriva come `application/xml`, non `text/*`: leggere il body solo
    // per `text/*` la faceva sembrare vuota.
    const tipo = res.headers.get("content-type") ?? "";
    const body = /text|xml|json|html/i.test(tipo) ? await res.text() : "";
    return { status: res.status, location: res.headers.get("location"), finalUrl: res.url, body };
  } catch (error) {
    return { status: null, error: error.message };
  }
}

const sitemapOf = async (domain) => {
  const xml = await get(`${domain}/sitemap.xml`);
  if (!xml.body) return [];
  return unique([...xml.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()));
};

/* ------------------------------------------------------- A. migrazione */

const pagine = [];
const sitemapNuova = await sitemapOf(NUOVO);
if (!sitemapNuova.length) {
  console.error(`\n✗ sitemap non leggibile su ${NUOVO}: niente da misurare.\n`);
  process.exit(1);
}

for (const url of sitemapNuova) {
  const percorso = new URL(url).pathname;
  const vecchia = VECCHIO + percorso;

  const nuova = await get(url);
  const canonical = nuova.body?.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null;
  const vecchiaRes = await get(vecchia, { redirect: "manual" });

  pagine.push({
    percorso,
    nuova: nuova.status,
    canonical,
    canonicalOk: canonical === url || canonical === url + "/",
    vecchia: vecchiaRes.status,
    redirectTo: vecchiaRes.location ?? null,
    unSalto: [301, 302, 307, 308].includes(vecchiaRes.status) && (vecchiaRes.location ?? "").replace(/\/$/, "") === url.replace(/\/$/, ""),
  });
}

const ok = (c) => pagine.filter(c).length;
const migrazione = {
  pagine: pagine.length,
  nuoveOk: ok((p) => p.nuova === 200),
  canonicalOk: ok((p) => p.canonicalOk),
  vecchieConRedirect: ok((p) => p.unSalto),
};

console.log(`\nMigrazione — ${VECCHIO} → ${NUOVO}\n`);
console.log(`  pagine nella sitemap: ${migrazione.pagine}`);
console.log(`  ✓ nuove a 200:                 ${migrazione.nuoveOk}/${migrazione.pagine}`);
console.log(`  ✓ canonical sul dominio nuovo: ${migrazione.canonicalOk}/${migrazione.pagine}`);
console.log(`  ✓ vecchie con redirect a un salto: ${migrazione.vecchieConRedirect}/${migrazione.pagine}`);
const daSistemare = pagine.filter((p) => p.nuova !== 200 || !p.canonicalOk || !p.unSalto);
if (daSistemare.length) {
  console.log("\n  da guardare:");
  for (const p of daSistemare) {
    console.log(
      `    ${p.percorso}: nuova=${p.nuova} canonical=${p.canonical ?? "assente"} vecchia=${p.vecchia}${p.redirectTo ? ` → ${p.redirectTo}` : ""}`,
    );
  }
}

/* ------------------------------------------------------------ B. indice */

async function daSerper(dominio) {
  const key = process.env.SERPER_API_KEY;
  if (!key) return null;
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: `site:${dominio}`, num: 100 }),
  }).catch(() => null);
  if (!res?.ok) return { errore: `Serper HTTP ${res?.status ?? "errore di rete"}` };
  const data = await res.json();
  return { urls: unique((data.organic ?? []).map((r) => r.link)) };
}

async function daGoogleCse(dominio) {
  const key = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return null;
  const res = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(`site:${dominio}`)}&num=100`,
  ).catch(() => null);
  if (!res?.ok) return { errore: `Google CSE HTTP ${res?.status ?? "errore di rete"}` };
  const data = await res.json();
  return { urls: unique((data.items ?? []).map((r) => r.link)) };
}

const fonti = [
  { nome: "serper", etichetta: "Google (Serper)", richiedi: daSerper },
  { nome: "google-cse", etichetta: "Google (Programmable Search)", richiedi: daGoogleCse },
];

let indice = null;
for (const fonte of fonti) {
  const risultato = await fonte.richiedi(NUOVO);
  if (!risultato) continue;
  if (risultato.errore) {
    console.log(`\nIndice — sorgente ${fonte.etichetta}: ${risultato.errore}`);
    indice = { fonte: fonte.nome, etichetta: fonte.etichetta, errore: risultato.errore };
    break;
  }
  const vecchio = await fonte.richiedi(VECCHIO);
  indice = {
    fonte: fonte.nome,
    etichetta: fonte.etichetta,
    nuovo: risultato.urls,
    vecchio: vecchio?.urls ?? [],
  };
  break;
}

if (!indice) {
  console.log(
    "\nIndice — non misurato: nessuna sorgente configurata.\n" +
      "  Per avere i numeri serve una delle due (la migrazione la segue Google, quindi\n" +
      "  è la sua indicizzazione che conta):\n" +
      "    SERPER_API_KEY                    → risultati Google\n" +
      "    GOOGLE_API_KEY + GOOGLE_CSE_ID    → Programmable Search (100 query/giorno gratis)\n" +
      "  Nel frattempo la parte A resta la condizione tecnica della migrazione.\n",
  );
} else if (indice.errore) {
  console.log(`\nIndice — la sorgente ha risposto con un errore, nessun numero registrato: ${indice.errore}\n`);
} else {
  console.log(`\nIndice — ${indice.etichetta}, ricerca \`site:\`\n`);
  console.log(`  ${NUOVO.padEnd(34)} ${String(indice.nuovo.length).padStart(3)} pagine`);
  console.log(`  ${VECCHIO.padEnd(34)} ${String(indice.vecchio.length).padStart(3)} pagine`);
  for (const u of indice.nuovo) console.log(`    ✓ ${u}`);
  for (const u of indice.vecchio.slice(0, 10)) console.log(`    · ${u}  (dominio vecchio)`);
}

/* ---------------------------------------------------------- lo storico */

const storico = existsSync(STORICO)
  ? JSON.parse(readFileSync(STORICO, "utf8"))
  : { descrizione: "Una voce per esecuzione di `npm run index:check`. I numeri dell'indice arrivano solo dalle esecuzioni che avevano una sorgente configurata.", esecuzioni: [] };

const precedente = [...storico.esecuzioni].reverse().find((e) => e.indice && !e.indice.errore);

const voce = {
  quando: new Date().toISOString(),
  nota: NOTA,
  migrazione,
  indice: indice && !indice.errore ? { fonte: indice.fonte, nuovo: indice.nuovo.length, vecchio: indice.vecchio.length, urlsNuovo: indice.nuovo } : null,
  indiceErrore: indice?.errore ?? (indice ? null : "nessuna sorgente configurata"),
  pagine: pagine.map((p) => p.percorso),
};

storico.esecuzioni.push(voce);
storico.aggiornatoIl = voce.quando;

if (precedente?.indice) {
  const delta = voce.indice
    ? `nuovo ${precedente.indice.nuovo} → ${voce.indice.nuovo} · vecchio ${precedente.indice.vecchio} → ${voce.indice.vecchio}`
    : "esecuzione senza dati d'indice";
  console.log(`\nRispetto al ${precedente.quando.slice(0, 10)} (${precedente.indice.fonte}): ${delta}`);
} else if (voce.indice) {
  console.log("\nPrima esecuzione con dati d'indice: è il punto di partenza, i prossimi run mostreranno lo spostamento.");
}

mkdirSync(path.dirname(STORICO), { recursive: true });
mkdirSync(path.dirname(RAW), { recursive: true });
writeFileSync(STORICO, JSON.stringify(storico, null, 2) + "\n");
writeFileSync(RAW, JSON.stringify({ ...voce, storico: undefined }, null, 2));
console.log(`\n→ storico: ${path.relative(process.cwd(), STORICO)} (${storico.esecuzioni.length} esecuzioni)`);
console.log(`→ dettaglio: ${path.relative(process.cwd(), RAW)}`);

const problemi = daSistemare.length;
if (problemi) console.log(`\n${problemi} pagine con qualcosa da sistemare nella migrazione (vedi sopra).`);
process.exit(problemi ? 1 : 0);

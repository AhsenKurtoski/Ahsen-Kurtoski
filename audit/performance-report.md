# Report performance & mobile — Ahsen Kurtoski

**Data:** 30 settembre 2026 · **URL misurato:** `https://axsenkurtoski.vercel.app` (dominio realmente servito)
**Strumenti:** Lighthouse 13.5 con Chrome for Testing 154 in locale (headless), puppeteer-core per lo sweep responsive. Report grezzi in [`audit/lighthouse/`](lighthouse/).
**Throttling:** mobile = emulazione Moto G Power, rete "Slow 4G" + CPU 4× (metodo simulate, default Lighthouse); desktop = preset desktop; run extra "3G" su home con throttling devtools reale (RTT 600 ms, 400 kbps, CPU 4×).

---

## 1. Punteggi e metriche

| Run | Perf | A11y | Best Pract. | SEO | LCP | TBT | CLS | TTFB | JS trasferito |
|---|---|---|---|---|---|---|---|---|---|
| home-mobile | **71** | 96 | 100 | 100 | 3,10 s | **930 ms** | ~0 | 66 ms | 147 KB |
| home-desktop | 96 | 96 | 100 | 100 | 512 ms | 144 ms | ~0 | 78 ms | 149 KB |
| home-3g | 84 | 96 | 100 | 100 | 3,42 s | — | ~0 | 74 ms | 147 KB |
| blog-mobile | **72** | 96 | 100 | 100 | 2,37 s | **1.244 ms** | 0 | 94 ms | 148 KB |
| chi-sono-mobile | 95 | **81** | 100 | 100 | 2,15 s | 207 ms | 0 | 64 ms | 147 KB |
| contatti-mobile | 84 | 96 | 100 | 100 | 2,18 s | 534 ms | 0 | 67 ms | 149 KB |
| articolo-seo-mobile | 84 | 96 | 100 | 100 | 2,43 s | 529 ms | 0 | 69 ms | 148 KB |
| articolo-seo-desktop | **100** | 96 | 100 | 100 | 482 ms | 0 ms | 0 | 102 ms | 150 KB |

**Core Web Vitals (mobile 4G):**

| Metrica | Valore mobile | Soglia "buono" | Esito |
|---|---|---|---|
| LCP (home) | 3,10 s | ≤ 2,5 s | ⚠️ da migliorare |
| LCP (altre pagine) | 2,15–2,43 s | ≤ 2,5 s | ⚠️ borderline |
| INP proxy (TBT) | 530–930 ms | ≤ 200 ms | ❌ da migliorare |
| CLS | 0 – 0,0006 | ≤ 0,1 | ✅ eccellente |
| TTFB | 64–102 ms | ≤ 800 ms | ✅ eccellente |

I punteggi CrUX "reali" non sono disponibili (dominio con pochissimo traffico): queste sono misure di laboratorio, riproducibili con i comandi in fondo.

---

## 2. Risorse e architettura (home mobile)

| Risorsa | Richieste | Trasferito |
|---|---|---|
| JavaScript | 9 | **147 KB** |
| Font | 2 | 52 KB |
| Altro (HTML/RSC/icon) | 12 | 32 KB |
| Documento | 1 | 15 KB |
| CSS | 1 | **9 KB** |
| Immagini/media | 0 | 0 |
| **Totale** | **25** | **254 KB** |
| Terze parti | **0** | **0** |

Punti di forza strutturali: HTML statico prerenderizzato (contenuto presente senza JS), nessuna richiesta di terze parti, font self-hosted, CSS minimale, compressione brotli attiva, 404 corretti, nessun errore console/rete.

---

## 3. Cause del LAG e proposte di fix

### 3.1 TBT alto su mobile: 930 ms (home), 530 ms (articoli/contatti)
**Evidenza:** `mainthread-work-breakdown` 3,0 s; `bootup-time` 1,4 s; `max-potential-fid` 920 ms sul run home-mobile. **Il TBT peggiore è sul blog mobile: 1.244 ms** (`bootup` 1,78 s, di cui la pagina `/blog` stessa — idratazione delle card e prefetch dei link visibili — costa 1,78 s). Chunk più pesante: `_next/static/chunks/2sjvppnz5km2e.js` (73 KB trasferiti, **28 KB mai usati**).
**Cause individuate:**
1. **Effetto typing della home** (`src/components/typing-role.tsx`): un `setState` ogni 45–90 ms **per sempre**, anche a scheda in background e anche per chi ha `prefers-reduced-motion`. Sulla home questo carburante di render continua durante tutta la misura.
2. **Idratazione React** dell'intera pagina (header, reveal, cookie notice, back-to-top, reading progress) — costo fisiologico, da ridurre dove facile.
3. **CSS render-blocking** (9 KB, 1 file Tailwind): `render-blocking-insight` stima ~150 ms su mobile.

**Fix 1 — typing consapevole (Facile, impatto medio):**
```tsx
// src/components/typing-role.tsx
useEffect(() => {
  // Chi ha chiesto meno animazioni vede subito il primo ruolo, statico
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const onVisibility = () => { paused = document.hidden; };
  document.addEventListener("visibilitychange", onVisibility);
  // …nel timer: if (paused) return; prima di ogni setState…
  return () => document.removeEventListener("visibilitychange", onVisibility);
}, []);
```
Reso statico anche in SSR (il testo attuale è già accessibile via `sr-only`).

**Fix 2 — non precaricare il font mono ovunque (Facile, risparmia ~23 KB sulle pagine senza codice):**
```ts
// src/app/layout.tsx
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });
```

**Fix 3 — CSS inline (sperimentale, da misurare):** Next 16 può inlinare il CSS critico:
```ts
// next.config.ts
experimental: { inlineCss: true },
```
Misurare prima/dopo con `npx lighthouse`; se il punteggio non migliora, rimuovere (opzione ancora instabile).

**Fix 4 — ridurre il JS iniziale (Media):** il chunk da 73 KB con 28 KB inutilizzati contiene i componenti client condivisi. Prossimo passo consigliato: `@next/bundle-analyzer` su una build locale per vedere dentro il chunk, e valutare:
- `dynamic(() => import(...), { ssr: false })` per `BackToTop`, `CookieNotice`, `ReadingProgress` (non servono al primo paint);
- rimuovere dal client i componenti che possono restare server;
- **polyfill legacy**: l'audit `legacy-javascript-insight` fallisce su home e blog. Se non supporti browser molto vecchi, dichiaralo per farli sparire:
```json
// package.json
"browserslist": ["chrome >= 111", "edge >= 111", "firefox >= 111", "safari >= 16.4"]
```
(Misurare prima/dopo: i polyfill pesano e si eseguono a ogni caricamento.)

### 3.2 LCP 3,1 s su mobile (home), 0,5 s su desktop
**Evidenza:** FCP 1,1 s, LCP 3,1 s: il ritardo sta fra primo paint e dipinto del contenuto principale (elemento LCP = titolo/card hero, tutto testo). Con CPU 4× il collo di bottiglia è l'esecuzione JS di idratazione+rehythm sopravvalutata; su 3G reale LCP 3,42 s (rete).
**Fix:** i Fix 1–4 sopra + mantenere `font-display: swap` (già attivo). Dopo i fix, ricontrollare home-mobile: obiettivo **LCP ≤ 2,5 s e TBT ≤ 200 ms**.

### 3.3 Nessun problema su: CLS, TTFB, immagini, terze parti
- CLS ~0: nessuno spostamento (ottimo; le animazioni `Reveal` usano `translate`/`opacity`, che non contano nel CLS).
- TTFB 64–102 ms: hosting edge Vercel, niente da fare.
- Nessuna immagine di contenuto: le regole WebP/srcset/lazy non si applicano; quando ne aggiungerai, usa `next/image` (vedi audit report, M4).
- Zero terze parti: nessun costo di privacy o performance.

---

## 4. Responsive e touch

**Sweep automatico** (`npm run audit:responsive`) su home, /chi-sono, /blog, articolo, /contatti a **360, 375, 390, 412, 768, 1024, 1280 px**:
- ✅ **Nessun overflow orizzontale** in nessuna delle 35 combinazioni.
- ✅ Menu hamburger: apre/chiude correttamente, 4 link, `aria-expanded` coerente.
- ✅ Avviso cookie: appare alla prima visita, si chiude, salva `ak-avviso-cookie`.
- ✅ Torna-su: appare dopo lo scroll, click → torna in cima; barra di lettura presente e proporzionale.
- ✅ Form contatti: validazione nativa blocca i campi vuoti (3 `:invalid`), nessuna chiamata all'API.
- ⚠️ **Input a 14 px** (3 campi del form): zoom automatico su iOS → fix `text-base sm:text-sm` (audit report, L1).
- ⚠️ **Tap target 40×40 px** su hamburger e 4 icone social: WCAG 2.2 AA passa (min 24 px), ma sotto la linea guida touch di 44 px → `size-11` (L2).
- ℹ️ I "10 target <44px" riportati dallo script includono anche link testuali inline (esclusi dalle linee guida) e lo skip-link nascosto: falsi positivi.

Screenshot di controllo: `audit/screenshots/home-360.png`, `home-390.png`, `home-768.png`, `home-1280.png`, `blog-768.png`, `articolo-seo-375.png`, `contatti-375.png`.

---

## 5. Console e rete (tutte le pagine)

| Pagina | Errori console | Page error | Richieste fallite | Risposte ≥400 |
|---|---|---|---|---|
| /, /chi-sono, /blog, articolo, /contatti, /privacy, /blog/tag/web | 0 | 0 | 0 | 0 |
| /pagina-inesistente | 1 (il 404 stesso) | 0 | 0 | 1 (il 404 stesso) |

Nessun errore JavaScript, nessun warning di idratazione, nessuna risorsa mancante. Dettagli: `audit/raw/responsive.json`.

---

## 6. Come riprodurre

```bash
# 1. Chrome for Testing + Lighthouse (una volta sola)
npm i -D lighthouse @puppeteer/browsers
npx @puppeteer/browsers install chrome@stable --path .chrome

# 2. Misure Lighthouse (esempio home mobile)
export CHROME_PATH="$(cygpath -m "$(pwd)/.chrome/chrome/*/chrome-*/chrome.exe")"
npx lighthouse https://axsenkurtoski.vercel.app/ --output=html,json \
  --output-path=audit/lighthouse/home-mobile --quiet --chrome-flags="--headless=new --no-sandbox"

# 3. Riepilogo di tutti i run
node scripts/audit-lh-summary.mjs

# 4. Sweep responsive + console + interazioni
npm run audit:responsive -- https://axsenkurtoski.vercel.app
```

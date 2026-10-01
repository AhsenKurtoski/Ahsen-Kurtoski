# Fix applicati — accessibilità e semantica (30 settembre 2026)

Correzioni del gruppo **HIGH / MEDIUM / QUICK WIN** dell'[action plan](action-plan.md) già applicate al codice.
**Committate e deployate** il 30/09/2026 (commit `c3bc58c` su `main`, deploy Vercel dalla stessa revisione). I numeri "dopo" in fondo sono misurati **sul sito live**, non in locale.

Riferimento ai problemi originali: [audit report](audit-report.md) (H2, H3, H4, M1, L1, M3).

**Aggiornamento 01/10/2026.** Le sezioni 7 (title e meta description, M2), 8 (performance mobile, M3 fix 2–4, con la decisione su `inlineCss`) e 9 (URL reali dei profili social) sono **committate (`f480b5e`) e deployate su Vercel il 01/10/2026**: le misure interne sono prese su build di produzione servite in locale, quelle "sul live" dopo il deploy. Esito dopo il deploy su **PageSpeed Insights**: mobile **Perf 96 → 100**, LCP **2,40 → 1,7 s**, TBT **72 → 20 ms**, risorse render-blocking **1 → 0**; desktop Perf **100** (LCP 0,6 s).

---

## 1. Contrasto del testo — `text-zinc-500` → `text-zinc-400`

| | Prima | Dopo |
|---|---|---|
| Colore | `#71717b` | `#a1a1aa` |
| Rapporto su `#0b0b11` | 4,06:1 ❌ | **~8:1** ✅ |
| Occorrenze | 16 (nodi Lighthouse 6–10 per pagina) | 0 |

Interessati 9 file: `app/page.tsx`, `app/chi-sono/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`,
`app/blog/tag/[tag]/page.tsx`, `app/privacy/page.tsx`, `components/site-footer.tsx`, `components/breadcrumbs.tsx`,
`components/contact-form.tsx` (incluso il `placeholder`).

Extra fuori audit: il separatore `,` fra i siti nel footer passava da `text-zinc-600` (2,6:1, oggi non visibile perché
c'è un solo sito in `site.otherSites`) a `text-zinc-400`, così non tornerà a fallire quando ne aggiungi un secondo.

## 2. Header — `label-content-name-mismatch` sul logo

**Prima:** `<Link aria-label="Ahsen Kurtoski — torna alla home">` con dentro il testo visibile `AK Ahsen Kurtoski`:
l'etichetta non conteneva "AK", quindi axe lo segnalava su **ogni pagina**.

**Dopo:** niente `aria-label`; le iniziali `AK` sono decorative (`aria-hidden`), la destinazione è detta da uno
`<span class="sr-only">— torna alla home</span>`. Nome accessibile calcolato: *"Ahsen Kurtoski — torna alla home"*,
che contiene tutto il testo visibile.

## 3. `/chi-sono` — HTML semantico

- **Timeline:** era `<ol><Reveal><li>…` (il `<div>` di `Reveal` si infilava fra lista e voce → `list` + `listitem`).
  Ora `<ol><li><Reveal>…`: il `<li>` è figlio diretto dell'`<ol>` e l'animazione vive dentro la voce.
  Il pallino della timeline è posizionato in assoluto rispetto al `<li>` (`relative`), quindi resta allineato: verificato a schermo.
- **Info rapide:** era `<dl>` con `<dt>/<dd>` annidati sotto due `<div>` → `definition-list` + `dlitem`.
  Ora è una `<ul>` di `<li>` con `<span>` etichetta + valore (l'elenco è una lista di fatti, non una coppia termine/definizione).

## 4. `<h1>` su tutte le pagine

`SectionHeading` ha una nuova prop `as?: "h1" | "h2"` (default `h2`), quindi la resa visiva non cambia.

- `as="h1"` sulla prima intestazione di `/chi-sono`, `/blog`, `/contatti`, `/privacy`, `/blog/tag/[tag]`.
- Uguale su `/` e `/blog/[slug]`: usavano già un `<h1>` proprio.
- **Effetto collaterale trovato e corretto:** con l'`h1` in cima, le card degli articoli (`<h3>`) creavano un salto
  `h1 → h3` su `/blog` e sulle pagine tag (`heading-order`, a11y 98). `PostCard` ora accetta `headingLevel` (default `3`)
  e le due pagine elenco passano `2`. Nelle pagine articolo le card restano `h3` sotto l'`h2` "Continua a leggere".

**Risultato: 16/16 pagine con esattamente un `<h1>` e nessun salto di livello.**

## 5. Input del form a 16 px su mobile

`inputClass` in `contact-form.tsx`: `text-sm` → **`text-base sm:text-sm`**.
A 390 px gli input tornano 16 px (iOS non zooma più al focus), da tablet in su restano 14 px come prima.
Etichette e ringraziamenti del form passano a `text-zinc-400` (punto 1).

## 6. Effetto macchina da scrivere rispettoso

`components/typing-role.tsx`:

- **`prefers-reduced-motion: reduce`** → nessun timer: mostra il primo ruolo in statico (nessun cursore lampeggiante).
- **Scheda nascosta** (`document.visibilitychange`) → l'effetto si ferma e riparte quando torni sulla scheda: niente
  `setState` ogni 45–90 ms mentre nessuno guarda (CPU e batteria su mobile).

## 7. Title e meta description (lunghezze ideali)

Obiettivo: title entro i ~60 caratteri che Google mostra, description fra 140 e 155. **16/16 pagine nel range, 0 fuori**, misurate sull'HTML servito da un server reale (`next start`), non sui file di build.

| Pagina | Title (char) | Description (char) |
|---|---|---|
| `/` | 36 | **150** (era 138) |
| `/chi-sono` | 54 | **147** (131) |
| `/blog` | **57** (era 21) | **146** (129) |
| `/contatti` | **58** (25) | **144** (94) |
| `/privacy` | 45 | **148** (133) |
| 4 articoli | 49 / 47 / **60** (65) / **59** (62) | **140 / 153 / 147 / 149** (105–122) |
| 7 archivi tag | 32–43 (invariati) | **141–152** (98–109) |

Cosa è cambiato e dove:

- `src/lib/site.ts` — `shortBio` (usata da home, JSON-LD, feed e manifest) portata a 150 caratteri; `updated` a `2026-10-01` perché il `lastmod` della sitemap dica la data vera della modifica.
- `src/app/blog/page.tsx`, `src/app/contatti/page.tsx`, `src/app/privacy/page.tsx`, `src/app/chi-sono/page.tsx` — `description` riscritta (per blog e contatti anche il `title`, prima di 21 e 25 caratteri).
- `src/app/blog/tag/[tag]/page.tsx` — description generata: la concordanza ora è corretta («1 articolo del blog…», prima diceva «1 articoli») e il testo è tarato per restare fra 141 e 152 sia con l'etichetta più corta (`SEO`) sia con la più lunga (`Programmazione`).
- `src/content/posts/*.md` — i quattro `excerpt` (description e anteprime delle card) e i due title oltre i 60 caratteri.
- `scripts/seo-check.mjs` — soglie portate alle lunghezze ideali (title ≤ 60, description 140–155: prima erano 65/50/165, quindi title da 65 e description da 60 passavano inosservati).

Comandi usati per la verifica: `npm run build`, `npm run seo:check`, `npm run seo:live -- http://127.0.0.1:3111` (server locale), `node audit/raw/m2-served.mjs`, `node audit/raw/m2-verify.mjs`.

## 8. Performance mobile: font mono, reveal CSS, bundle (M3 fix 2–4)

Metodo, tabelle complete e ipotesi sul limite residuo nella [sezione 0b del performance report](performance-report.md). Sintesi di cosa è cambiato nel codice:

- **Fix 2 — `preload: false` su Geist Mono** (`src/app/layout.tsx`): il font mono non viene più precaricato su ogni pagina. Sulle pagine senza codice né indirizzi in `font-mono` la richiesta da 23 KB **non parte più** (home: da 2 a 1 richiesta di font); dove serve, il file viene scaricato su richiesta e usato davvero (verificato: HTTP 200, 23.108 byte, `document.fonts.check('16px "Geist Mono"')` → `true` su `/contatti`).
- **Fix 4 — `Reveal` da componente client a componente server** (`src/components/reveal.tsx` + regola `.reveal` in `src/app/globals.css`): l'animazione d'ingresso ora è **solo CSS e agganciata allo scorrimento** (`animation-timeline: view()`), quindi senza IntersectionObserver, senza idratazione e senza `opacity: 0` in attesa del JavaScript. Il chunk del componente non viene più caricato (home: da 9 a 8 file JS, 147 → 145 KB).
  - Verificato in Chrome 154: 22 elementi `.reveal` sulla home; quelli sotto la piega restano invisibili finché non entrano nello schermo e diventano tutti visibili scorrendo fino in fondo; con `prefers-reduced-motion: reduce` l'animazione è disattivata (`animation: none`) e il contenuto è statico. Con JavaScript disattivato il contenuto è comunque leggibile, perché lo stato di partenza è visibile e non `opacity: 0`.
  - **Effetto visivo:** durata e resa sono le stesse di prima (0,7 s, cascata a 80–90 ms per card); cambia chi la esegue — il browser, non React.
- **Fix 3 — `experimental.inlineCss`: adottato dopo un A/B con build affiancate.** Elimina l'unica richiesta che blocca il primo paint. Il verdetto iniziale («+17 KB a navigazione, nessun miglioramento dei punteggi») veniva da run singoli e non accoppiati; rifatto con due build servite insieme e run alternati (A,B poi B,A) su 6 round, il **LCP simulato** — nel modello Lantern, quello con cui PSI calcola il punteggio — scende di **253 ms in 6 round su 6** e il **TBT resta invariato** (+27 ms di mediana accoppiata). Costo in byte, misurato: **+0,35 KB brotli in prima visita**, +7,4 KB per navigazione client-side (Next duplica il CSS dentro il payload RSC e il CSS non è più cacheabile), +18,5 KB su host che servono solo gzip. Nessun costo di CPU misurabile: lavoro sul main thread e bootup JS invariati. La motivazione è scritta in `next.config.ts`.
- **Fix 4b — `browserslist` moderno: provato e scartato.** Non cambia un byte: i 13,8 KB di JavaScript "legacy" e i 28 KB inutilizzati stanno nel runtime del framework (React + Next/Turbopack), non nel codice dell'app.

**Prima → dopo (home mobile, misure locali like-for-like):** byte totali **258 → 233 KB**, JS 147 → 145 KB, font 52 → 29 KB; Perf mediana 92 → 94, LCP mediana 2,8 → 2,7 s, TBT mediana 210 → 170 ms (con ~±100 ms di variabilità fra run identici: il TBT va letto come "non peggiora", non come un guadagno certo).

**A/B su `font-display` (ipotesi provata e respinta).** Il sospetto era che l'LCP tardasse per il ridipinto del testo quando arriva il woff2. Provato con `display: "optional"` sulla stessa build, 5 run per configurazione: LCP simulato 2,7 → 2,8 s, Perf mediana 94 → 90, TBT mediana 170 → 270 ms. **Nessun guadagno**, quindi si torna a `swap`. Il dato che chiude il capitolo: in **11 run su 11** l'LCP *osservato* coincide con l'FCP (769–1266 ms) in entrambe le configurazioni — il testo viene dipinto insieme alla pagina, senza aspettare JS o font. I 2,6–2,8 s che si leggono nei report sono la stima della simulazione (Lantern), che somma il costo JS del framework davanti al dipinto.

**Accessibilità:** 100/100 su tutte le pagine misurate dopo le modifiche (home, blog, contatti, articolo SEO): il nuovo `Reveal` non introduce regressioni.

## 9. Profili social: gli URL veri nei dati strutturati (01/10/2026)

**Cosa non andava.** Durante l'audit gli handle social erano stati *ricostruiti a mano* (`/in/ahsenkurtoski`, `/ahsenkurtoski`) perché LinkedIn e Instagram non si lasciano controllare da strumenti automatici: LinkedIn risponde **999** e Instagram **200** a *qualunque* username. I due URL puntavano quindi a profili **inesistenti** e finivano nei 4 `sameAs` dei dati strutturati (`Person` e `ProfessionalService` in `src/app/layout.tsx`) — esattamente il punto che Google usa per collegare il nome «Ahsen Kurtoski» alle identità ufficiali. Un `sameAs` che dichiara profili inesistenti è peggio di un `sameAs` assente.

**Correzione.** Nel blocco `socials` di `src/lib/site.ts` ci sono ora gli URL pubblici reali, con il commento che spiega perché quei link non sono verificabili da bot:
- LinkedIn → `https://www.linkedin.com/in/ahsen-kurtoski-397b00354`
- Instagram → `https://www.instagram.com/ahsenstudio`

**Verifica.** `sameAs` nell'HTML di build contiene i 4 URL aggiornati su entrambi i blocchi JSON-LD; `seo:check` resta 16/16 con il solo avviso atteso (profili `x` e `youtube` vuoti); `tsc` ed `eslint` puliti. Che i profili esistano si conferma **a mano**, dal browser: è l'unica verifica possibile.

## Verifiche eseguite (dopo le modifiche)

| Controllo | Esito |
|---|---|
| `npx tsc --noEmit` | 0 errori |
| `npx eslint .` | 0 errori |
| `npm run build` | OK (29 route) |
| `npm run seo:check` | 16/16 pagine ok |
| Lighthouse a11y, 7 pagine (build locale) | **100/100 su tutte**, zero audit falliti |
| `/chi-sono` a11y | **81 → 100** |
| `<h1>` per pagina (HTML di build) | 1 su tutte e 16 le pagine |
| Gerarchia titoli (runtime) | nessun salto |
| Input a 390 px / 900 px | 16 px / 14 px |
| `reduced-motion` | testo statico, nessun cursore, stabile dopo 1,2 s |
| Scheda nascosta | testo invariato dopo 1 s |
| Layout a schermo (390 e 900 px) | timeline, card e form invariati |

**Verifiche ripetute sul sito live dopo il deploy** (`https://ahsenkurtoski.vercel.app`):

| Controllo | Esito |
|---|---|
| Lighthouse a11y (home, /chi-sono, /blog, /contatti, /blog/tag/seo) | **100/100** su tutte, zero audit falliti |
| Audit link sul dominio ufficiale (`--fail-on=all`) | 16/16 pagine, 17 link interni 200, **0 problemi / 0 avvisi**, 404 reale, `http → https` 308 |
| `<h1>` e gerarchia titoli su tutte le 16 URL | un solo `<h1>` per pagina, nessun salto (ora controllato anche dal crawler) |
| Lighthouse performance mobile | home **83–86** (3 run), blog **97**, contatti **97**; LCP 2,14–2,65 s, TBT 106–546 ms |

Dati grezzi dei run "dopo": `audit/raw/after-fix/` (JSON Lighthouse per le 7 pagine).
Screenshot post-fix: `audit/screenshots/after-*.png`.

## Cosa resta aperto

1. **Tap target 40 px** (QW2: menu mobile e icone social) — non incluso in questo giro.
2. **Performance mobile (M3 fix 2–4)**: fatti e misurati (sezione 8) — font mono non più precaricato, `Reveal` senza JS, bundle analizzato; `browserslist` e `font-display: optional` provati e **scartati** con i numeri alla mano; `inlineCss` provato con due build affiancate e **adottato** (LCP simulato **−253 ms in 6 round su 6**, +0,35 KB brotli in prima visita) — [performance report §0d](performance-report.md). Sul limite di LCP c'è una precisazione importante: i 2,6–2,8 s dei report Lighthouse sono la **stima della simulazione**, mentre l'LCP osservato coincide con l'FCP in **16 run su 16** — il testo non aspetta né JavaScript né il font. Verifica indipendente su **PageSpeed Insights** — prima del deploy (macchina lenta): mobile **Perf 96 · LCP 2,4 s · TBT 70 ms · CLS 0**, desktop **Perf 100 · LCP 0,52 s · TBT 0**; **dopo il deploy (01/10/2026, `f480b5e`): mobile Perf 100 · LCP 1,7 s · TBT 20 ms · CLS 0,001 con zero risorse render-blocking**, desktop Perf 100 · LCP 0,6 s. Nessun dato di campo CrUX (traffico insufficiente).
3. **Sito dello studio** (H5): il sottodominio è a posto, ma `<title>` e description dicono ancora "Axsen Kurtoski" — si correggono nel progetto del sito, fuori da questo repo.
4. **Search Console** (M4) sulla proprietà del dominio ufficiale, ora che risponde 200.

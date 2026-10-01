# Report performance & mobile — Ahsen Kurtoski

**Data:** 30 settembre 2026 · **URL misurato:** `https://axsenkurtoski.vercel.app` (all'epoca il dominio realmente servito; oggi fa 307 verso `ahsenkurtoski.vercel.app`)
**Strumenti:** Lighthouse 13.5 con Chrome for Testing 154 in locale (headless), puppeteer-core per lo sweep responsive. Report grezzi in `audit/lighthouse/` (cartella **locale, non versionata**: si rigenera con i comandi della sezione 6).
**Throttling:** mobile = emulazione Moto G Power, rete "Slow 4G" + CPU 4× (metodo simulate, default Lighthouse); desktop = preset desktop; run extra "3G" su home con throttling devtools reale (RTT 600 ms, 400 kbps, CPU 4×).

---

## 0. Aggiornamento: misure dopo i fix (sito live, deploy `c3bc58c`)

Misure ripetute **sul dominio ufficiale** dopo il deploy, cioè sul codice che gli utenti ricevono oggi.

| Run (mobile) | Perf | A11y | LCP | TBT | CLS | TTFB |
|---|---|---|---|---|---|---|
| home (3 run) | **83 · 84 · 86** | **100** | 2,45–2,65 s | 393 · 393 · 546 ms | 0 | 70 ms |
| blog | **97** | **100** | 2,20 s | 132 ms | 0 | 88 ms |
| contatti | **97** | **100** | 2,14 s | 106 ms | 0 | 82 ms |

Confronto con le misure pre-fix dello stesso periodo (home 71 → **83–86**, blog 72 → **97**, contatti 84 → **97**).
Le due serie non sono misurate nelle stesse condizioni (dominio diverso, periodo diverso, cache diversa): il confronto è indicativo e i valori da guardare sono quelli "dopo". Il fix del typing effect è l'unico cambiamento di questo giro che riduce lavoro sul main thread, ed è coerente con il crollo del TBT, ma non ho misure isolate che ne provino da sole l'effetto.
I fix 2–4 di M3 (font mono, CSS, bundle) sono stati **applicati e misurati il 01/10/2026**: vedi la sezione 0b qui sotto. La home resta sopra la soglia consigliata di LCP 2,5 s nei report Lighthouse, ma **non perché il primo dipinto sia in ritardo**: l'LCP osservato coincide con l'FCP (0,8–1,0 s) in ogni run. I dettagli — e cosa significa per gli obiettivi di questo report — sono in [sezione 0b](#0b-fix-24-di-m3-cosa-è-stato-applicato-e-misure-primadopo-01102026).

---

## 0b. Fix 2–4 di M3: cosa è stato applicato e misure prima/dopo (01/10/2026)

**Metodo.** Build di produzione servita in locale da `next start`, Lighthouse 13.5 con Chrome for Testing 154, preset mobile (Moto G Power, Slow 4G, CPU 4×). Confronto **like-for-like**: identico metodo prima e dopo, home ripetuta (3 run prima, 5 run dopo). I valori assoluti in locale sono più alti di quelli sul dominio Vercel (che paga la rete reale): contano le coppie, non i valori isolati.

| Home mobile (locale) | Perf | LCP | TBT | Byte totali |
|---|---|---|---|---|
| **Prima** (solo fix 1) | 93 · 92 · 88 → **mediana 92** | 2,8 · 2,8 · 2,9 → **2,8 s** | 190 · 210 · 300 → **mediana 210 ms** | 258 KB |
| **Dopo** (fix 2 + 4) | 95 · 94 · 94 · 90 · 90 → **mediana 94** | 2,7 · 2,7 · 2,7 · 2,8 · 2,8 → **mediana 2,7 s** | 130 · 170 · 160 · 270 · 260 → **mediana 170 ms** | **233 KB** |

**Cosa è certo e cosa no.** Il TBT varia di ~±100 ms fra run identici, quindi la differenza 210 → 170 ms **non è attribuibile con certezza** e va letta come "non peggiora". I byte invece sono una misura esatta e riproducibile, e si spiegano voce per voce:

| Risorsa (home) | Prima | Dopo | Perché |
|---|---|---|---|
| JavaScript | 147 KB in 9 file | **145 KB in 8 file** | sparisce il chunk di `Reveal` (il componente non è più client) |
| Font | 52 KB in 2 file | **29 KB in 1 file** | il woff2 mono non viene più precaricato dove non serve |
| **Totale** | 258 KB | **233 KB** | −25 KB esatti |

Altre pagine con lo stesso metodo (run singoli, quindi indicativi):

| Pagina | Byte prima | Byte dopo | Perf | LCP | TBT |
|---|---|---|---|---|---|
| blog | 274 KB | **248 KB** | 93 (era 88) | 2,4 s (era 3,0) | 260 ms (era 310) |
| contatti | 244 KB | 242 KB | 90 (era 91) | 2,9 s (era 2,9) | 250 ms (era 240) |
| articolo SEO | — | 235 KB | 94 | 2,6 s | 210 ms |

**Fix 2 — il font mono non è più precaricato (`preload: false`).** Verificato con conteggi esatti: sulle pagine senza codice né indirizzi in `font-mono` la richiesta del woff2 mono (23 KB) **non parte più** (da 2 richieste di font a 1); dove il mono serve — `/contatti`, articoli con `<code>` — il file viene scaricato su richiesta e usato davvero: HTTP 200 (23.108 byte) e `document.fonts.check('16px "Geist Mono"')` → `true`. Da qui i −25 KB sulla home e i soli −2 KB su `/contatti` (dove il mono serve).

**Fix 4 — il JS iniziale: cosa c'era da tagliare e cosa no.** Tre leve, con l'esito reale:

| Leva | Esito |
|---|---|
| `browserslist` moderno (`chrome/edge/firefox >= 111`, `safari >= 16.4`) | **Provata e scartata.** Il chunk del framework resta identico byte per byte (71.688 B) e `legacy-javascript` continua a segnalare 13,8 KB: quei polyfill stanno nel codice precompilato di React/Next, non nell'app. Rimossa perché non produce effetti misurabili. |
| `Reveal` da componente client a componente server con animazione CSS | **Applicata.** L'animazione è in `globals.css` con `animation-timeline: view()` (scroll-driven): sparisce un confine client, il chunk relativo non viene più caricato e il contenuto non dipende dal JS per essere visibile. Verificato in Chrome 154: 22 elementi `.reveal`, quelli sotto la piega restano a `opacity: 0` finché non entrano e diventano tutti visibili scorrendo; con `prefers-reduced-motion: reduce` l'animazione è disattivata (`animation: none`) e il testo è statico. |
| `dynamic()` per `BackToTop` e `ReadingProgress` | **Non applicata.** Sono ~1 KB ciascuno e servono al primo paint: il guadagno non giustifica il rischio di cambiare comportamento. |

Quel chunk da **71 KB (28 KB inutilizzati, 13,8 KB di codice legacy)** è il runtime del framework (React + Next/Turbopack): resta identico qualunque cosa si tocchi nell'app. I componenti client dell'app sono sparsi in chunk da 1–9 KB. Con questo stack il pavimento del TBT mobile è intorno ai 100–150 ms: il target di 200 ms è raggiungibile, quello di LCP 2,5 s no.

**Fix 3 — `experimental.inlineCss`: adottato dopo un A/B dedicato.** Toglie l'unica richiesta che blocca il primo paint (`render-blocking-insight`). La prima decisione, presa su run singoli e non accoppiati, era stata opposta («0,1–0,2 s di LCP, punteggi sovrapposti, +17 KB a navigazione: non paga»); con build affiancate e run alternati il segno si è ribaltato. Numeri completi nella [sezione 0d](#0d-decisione-finale-su-experimentalinlinecss-adottato): **LCP simulato −253 ms in 6 round su 6**, TBT invariato, **+0,35 KB brotli in prima visita** e +7,4 KB per navigazione client-side.

### L'LCP di 2,6–2,8 s è la simulazione, non il dipinto

Il paragrafo della hero è l'elemento LCP ed è testo statico giì presente nell'HTML. Se il ritardo fosse reale, fra FCP e LCP ci sarebbe uno stacco: non c'è.

| Configurazione | LCP simulato | **LCP osservato** | FCP osservato | LCP = FCP? |
|---|---|---|---|---|
| swap (adottata) | 2768 ms | **841 ms** | 841 ms | sì |
| swap, altro run | 2827 ms | **856 ms** | 856 ms | sì |
| `font-display: optional` | 2626 ms | **769 ms** | 769 ms | sì |
| `font-display: optional`, altro run | 2807 ms | **1034 ms** | 1034 ms | sì |
| configurazione finale, run 1 | 2639 ms | **1266 ms** | 1266 ms | sì |
| configurazione finale, run 2 | 2720 ms | **820 ms** | 820 ms | sì |
| **3G reale, pre-fix** (`home-3g`, throttling devtools) | 3420 ms | **3420 ms** | 3420 ms | sì |

**In 11 run su 11 l'LCP osservato coincide con l'FCP** (l'ultima riga della tabella viene dall'audit del 30/09, prima di ogni fix, con throttling **reale** da 3G: anche lì il testo è stato dipinto insieme al primo paint, in 3,4 s di sola rete). Il testo viene dipinto quando viene dipinta la pagina, senza aspettare JavaScript né il font. I 2,6–2,8 s sono il risultato della **simulazione** (Lantern): parte dal trace osservato e ci somma il costo del lavoro sul main thread sotto CPU 4× e rete lenta, quindi attribuisce al dipinto il tempo del JavaScript del framework. È il motivo per cui il valore simulato non si muove qualunque cosa si cambi nell'app: cambiare il font, i componenti client o il CSS lascia il modello quasi identico.

**Conseguenza sugli obiettivi.** Il valore simulato **dipende dalla macchina** su cui gira Lighthouse, non dal codice dell'app: qui sta 2,7–2,9 s, su PSI mobile 2,4 s (sotto la soglia) e su PSI desktop 0,5 s. Quello che non cambia è l'LCP osservato, che è sempre uguale al primo paint. Quindi la voce non si ottimizza "nel codice": si ottimizza il **primo dipinto**, cioè quanto in fretta l'HTML arriva e quanto costa farne il parse (documento 16 KB trasferiti, ~110 KB non compressi, ~145 KB di JS da parsare ed eseguire). La verifica sul dominio live è nella [sezione 0c](#0c-verifica-sul-dominio-live-pagespeed-insights-01102026).

### A/B su `font-display` (ipotesi provata e respinta)

L'ipotesi di partenza era che l'LCP fosse in ritardo per il cambio del font (il woff2 arriva dopo il primo paint e il testo viene ridipinto). Provata con un A/B sulla stessa build, 5 run per configurazione:

| Home mobile, 5 run | Perf | LCP simulato | TBT simulato | Byte |
|---|---|---|---|---|
| `display: "swap"` (adottata) | 95·94·94·90·90 → **mediana 94** | 2,7·2,7·2,7·2,8·2,8 → **2,7 s** | 130·170·160·270·260 → **170 ms** | 233 KB |
| `display: "optional"` | 83·90·96·95·90 → **mediana 90** | 2,8·2,8·2,6·2,7·2,8 → **2,8 s** | 500·270·90·150·280 → **270 ms** | 233 KB |

**Non migliora niente**: l'LCP simulato non si muove e le mediane di Perf e TBT sono peggiori (il run da 83 con TBT 500 ms è rumore di macchina, ma la direzione non è a favore). Il costo invece è certo: alla prima visita il sito mostrerebbe il font di sistema. Quindi **`display: "optional"` è stato scartato** e il commento in `src/app/layout.tsx` spiega perché, così l'esperimento non viene rifatto.

**Nota sul metodo, da tenere presente ovunque in questo report.** Questa macchina ha una variabilità alta: nella stessa serie di 5 run identici un run ha segnato Perf 74 con TBT 1.114 ms, il successivo Perf 96 con TBT 90 ms. Per questo le conclusioni qui sopra si appoggiano alle mediane, ai byte (misura esatta) e ai tempi osservati, non ai punteggi dei singoli run.

**Stato di queste modifiche:** committate (`f480b5e`) e **deployate su Vercel il 01/10/2026**. L'esito misurato sul live dopo il deploy è in §0c.

---

## 0c. Verifica sul dominio live (PageSpeed Insights, 01/10/2026)

Misura indipendente dalla mia macchina: PageSpeed Insights gira la stessa Lighthouse (13.5.0) dall'infrastruttura Google. La prima misura è la **baseline prima del deploy** (non conteneva M2/M3); l'ultima riga della tabella e il paragrafo «Dopo il deploy» sono invece misurati sul deploy nuovo. Raccolta completa in `audit/raw/psi-live-evidence.json`; i report grezzi sono riapribili da [PSI mobile](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fahsenkurtoski.vercel.app&form_factor=mobile) e [PSI desktop](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fahsenkurtoski.vercel.app&form_factor=desktop).

| Ambiente (home) | Macchina (`benchmarkIndex`) | Primo paint osservato | LCP osservato | LCP simulato | TBT | Perf |
|---|---|---|---|---|---|---|
| locale, working tree (più configurazioni) | 2.282–2.712 | 765–1.034 ms | **= FCP** | 2,72–2,91 s | 94–274 ms | 88–96 |
| locale, URL live | 2.705–2.754 | 1.517–1.553 ms | **= FCP** | 2,41–2,70 s | 85–480 ms | 84–97 |
| **PSI mobile, URL live** | **676** | **2.249 ms** | **= FCP** | **2,40 s** | **72 ms** | **96** |
| **PSI desktop, URL live** | **1.073** | **232 ms** | **= FCP** | **0,52 s** | **0** | **100** |
| 3G reale, pre-fix (throttling devtools) | 2.765 | 3.420 ms | **= FCP** | 3,42 s | 0 | 84 |
| **PSI mobile, deploy nuovo** (`f480b5e`) | 854 | **269 ms** | **= FCP** | **1,7 s** | **20 ms** | **100** |
| **PSI desktop, deploy nuovo** (`f480b5e`) | 1.001 | **351 ms** | **= FCP** | **0,6 s** | **10 ms** | **100** |

**Verdetto di PSI prima del deploy (mobile):** LCP **2,4 s** ✅, TBT **72 ms** ✅, CLS **0** ✅, Perf **96**, a11y/practice/SEO **100**. Sul desktop: Perf **100**, LCP **0,52 s**, TBT **0**. Con le soglie Core Web Vitals (LCP ≤ 2,5 s, TBT ≤ 200 ms, CLS ≤ 0,1) il sito **passa in laboratorio** su mobile e passa largamente su desktop.

### Dopo il deploy (01/10/2026, commit `f480b5e`)

| Home, PageSpeed Insights | Prima (deploy vecchio) | **Dopo (deploy nuovo)** |
|---|---|---|
| Perf mobile | 96 | **100** |
| LCP mobile | 2,40 s | **1,7 s** |
| TBT mobile | 72 ms | **20 ms** |
| Primo paint osservato | 2.249 ms | **269 ms** |
| Risorse render-blocking | 1 (il CSS, **300 ms stimati**) | **0** |
| Perf desktop | 100 | 100 (LCP 0,52 → 0,6 s) |

Il rilievo «CSS che blocca il rendering» è **sparito** dal report di PSI: era l'unica voce "da app" delle tre, e restano le due del framework (14 KiB di JS legacy, 28 KiB non usato).

**Una cautela da non saltare.** PSI non garantisce la stessa macchina: la baseline girava con `benchmarkIndex` **676**, questo run con **854** (~26% più veloce). Una parte del guadagno è quindi fortuna della macchina, non codice. Il dato che *non* si spiega così è il **primo paint osservato: da 2.249 a 269 ms** — otto volte più veloce con una CPU più veloce del 26% — ed è coerente con la diagnosi della §0b: il contenuto non aspetta più l'idratazione per essere visibile, perché `Reveal` non è più un componente client e lo stato di partenza è visibile invece di `opacity: 0`. Su una macchina lenta quella differenza pesa più che sulla mia, ed è il motivo per cui il guadagno misurato sul live (−0,70 s di LCP mobile) è maggiore dei −253 ms attribuibili al solo `inlineCss`.

**Nessun dato di campo.** PSI riporta «Nessun dato» sia per l'URL sia per l'origine: il sito ha troppo poco traffico per entrare in CrUX. Quindi **non esiste** una misura di utenti reali da confrontare: la valutazione ufficiale di Google sugli utenti reali, oggi, è semplicemente "non disponibile".

**Le tre cose che questa verifica ha chiarito.**

1. **L'LCP non ha un ritardo proprio.** In **16 run su 16**, su quattro ambienti diversi e sei configurazioni (prima e dopo i fix, font in swap e optional, CSS inline o no), l'LCP osservato coincide con il primo paint: il testo si dipinge insieme alla pagina. Non c'è niente da "sistemare" fra FCP e LCP perché fra i due non passa tempo.
2. **Sul live il numero mobile passa, ma di poco, e dipende dalla macchina.** PSI mobile ha girato su una macchina circa 3,5 volte più lenta della mia (`benchmarkIndex` 676 contro ~2.500) e lì la pagina resta **vuota fino a ~2,25 s** (la filmstrip lo mostra: fotogrammi da 5 KB fino a 1.717 ms, contenuto da 24 KB a 2.289 ms) pur avendo scaricato tutto entro 495 ms. Non è rete: è il costo di parse/esecuzione di ~110 KB di HTML e ~145 KB di JS su una CPU lenta. Sul desktop, con la stessa pagina e una macchina più veloce, il primo paint è a 232 ms.
3. **I tre avvisi di PSI sono gli stessi che vedo in locale** e sono tutti a livello di framework: CSS che blocca il rendering («risparmio stimato 300 ms»), 14 KiB di JavaScript legacy, 28 KiB di JavaScript non usato. Coerente con l'analisi della sezione 0b: non sono byte dell'app.

**La sola leva rimasta, con i numeri in mano.** Il CSS bloccante è l'unica voce "da app" che PSI quantifica (300 ms stimati su macchina lenta) ed è anche l'unica che si toglie con una riga di configurazione. La domanda posta qui — «in locale l'avevo scartata, ma su una macchina lenta il calcolo potrebbe cambiare segno?» — ha avuto risposta con un A/B dedicato con build affiancate: **si adotta `inlineCss`** (§0d). Il modello di PSI realizza ~250 ms dei 300 ms stimati, a fronte di +0,35 KB in prima visita.

---

## 0d. Decisione finale su `experimental.inlineCss`: adottato

Il CSS inline è l'unica modifica al codice che toglie una richiesta **render-blocking**, cioè l'unica voce "da app" fra i tre rilievi di PSI (gli altri due, JS legacy e JS inutilizzato, stanno nel runtime del framework). La prima decisione, presa su run singoli e non accoppiati, era di scartarlo; con un metodo migliore il risultato si ribalta.

**Metodo.** Due build dello stesso codice affiancate e servite insieme, che differiscono **solo** per `inlineCss` (porta 3111 con inline, 3112 senza), e run Lighthouse **alternati nella stessa sessione** (A,B e poi B,A, così l'effetto "primo run del round" non si confonde con la variante), mediana delle differenze accoppiate su 6 round. Due regimi: `simulate` (il modello **Lantern**, esattamente quello con cui PSI calcola il punteggio) e `devtools` (CPU rallentata davvero 4×, banda 1.638 kbps, latenza 150 ms — i valori del profilo mobile di PSI). Script: `audit/raw/ab-run.sh` e `audit/raw/ab-pair.mjs`.

### Nel modello con cui PSI calcola il punteggio

| Home mobile, 6 round accoppiati | Con inline | Senza inline | Δ (mediana accoppiata) |
|---|---|---|---|
| **LCP simulato** | **2.563 ms** | 2.794 ms | **−253 ms** (mediana accoppiata), favorevole in **6 round su 6** (da −143 a −327) |
| TBT simulato | 240 ms | 312 ms | +27 ms: invariato, dentro il rumore |
| FCP simulato | bimodale: 871–885 **o** 1.115–1.173, mediana 1.000 | 906 ms, stabile | +94 ms, ma il modello è instabile qui |
| Perf (macchina locale) | 93 | 89 | +1 |
| Byte totali nel modello (gzip locale) | 259 KB | 233 KB | +26 KB |

Il LCP è la metrica che pesa di più nel punteggio mobile ed è l'unica che si muove: **−253 ms costanti**. Coerente con i **300 ms** che PSI stima per il CSS render-blocking sul live: due misure indipendenti che dicono la stessa cosa.

### Con throttling reale (CPU 4×, latenza 150 ms)

| 6 round accoppiati (FCP = LCP) | Valori |
|---|---|
| Con inline | 2.074 · 2.110 · 2.133 · 2.150 · 2.178 · 3.006 ms |
| Senza inline | 1.796 · 1.886 · 3.110 · 3.118 · 3.136 · 3.119 ms |
| **Δ mediana accoppiata** | **−531 ms** (favorevole all'inline) |
| TBT | 0 ms con inline, 0–29 ms senza |
| Lavoro sul main thread | 6,3–6,5 s con inline, 5,6–6,5 s senza |

**Questi numeri valgono come direzione, non come valori.** Nello stesso regime la *stessa* variante oscilla di oltre un secondo (la "senza inline" ha girato due volte a ~1,8 s e quattro volte a ~3,1 s): è un artefatto di dipinto dell'ambiente headless, non dell'app. Regge il segno — anche qui a favore dell'inline — e regge un dato che invece è pulito: **il lavoro sul main thread non cambia**, quindi l'HTML più grande non costa CPU. Il waterfall spiega perché: in entrambe le varianti tutte le risorse sono scaricate entro ~1,0–1,4 s e il primo dipinto arriva dopo, quando il main thread si libera (è la stessa conclusione della §0b: l'LCP osservato coincide sempre con il primo paint).

### Quanto costa in byte (misura esatta)

| | Con inline | Senza inline | Differenza |
|---|---|---|---|
| Home, HTML non compresso | 231 KB | 111 KB + 37 KB di CSS | ≈2× |
| **Home, prima visita (brotli, quello che serve Vercel)** | **18,9 KB** | 18,5 KB | **+0,35 KB** |
| Home, prima visita (gzip: `next start`, host senza brotli) | 43,0 KB | 23,9 KB | +18,5 KB |
| **Home, ricarica (CSS in cache)** | **18,9 KB** | 11,0 KB | **+8,0 KB** (gzip: +27,4 KB) |
| **Navigazione client-side (payload RSC)** | **113 KB · 13,4 KB brotli** | 34 KB · 6,1 KB brotli | **+7,4 KB per pagina** |
| CSS esterno | non esiste più | 37 KB, `max-age=31536000, immutable` | — |

Il costo ricorrente è la voce meno intuitiva: senza inline il CSS è un file **immutabile in cache per un anno**, mentre con inline Next lo **duplica dentro il payload RSC** (verificato: nel payload compaiono `.reveal` e `font-geist`, assenti in quello senza inline) e quindi viaggia a ogni navigazione. In prima visita il costo è quasi nullo (brotli: +0,35 KB, perché la ripetizione del CSS comprime quasi a zero), ma chi legge tre o quattro pagine paga ~7 KB brotli in più a pagina: decine di millisecondi, contro i ~250 ms guadagnati sul primo dipinto.

### Verdetto: adottato

`experimental: { inlineCss: true }` è in `next.config.ts`, con la motivazione scritta accanto. Il bilancio è a favore: (a) il guadagno è sulla metrica che pesa di più nel punteggio ed è confermato da due metodi indipendenti (il modello di PSI e i 300 ms stimati da PSI stesso); (b) non peggiora il TBT (+27 ms di mediana accoppiata, cioè niente) né il lavoro sul main thread; (c) il costo in byte su brotli è trascurabile in prima visita e modesto per chi naviga.

**Limiti dichiarati.** Questa macchina è ~3,5× più veloce di quella di PSI e non riproduce fedelmente un telefono lento: l'unico ambiente davvero rappresentativo resta PSI, quindi la conferma definitiva si avrà **dopo il deploy** (atteso: LCP mobile 2,40 → ~2,15 s, Perf 96 → ~97/98). Non esiste ancora dato di campo CrUX. La flag è **sperimentale**: se una versione futura di Next la rimuove, si torna alla richiesta CSS esterna senza altre modifiche.

**L'alternativa più fine, non provata.** `optimizeCss` (critters) inlinerebbe **solo** il CSS critico lasciando il resto asincrono e cacheabile: sarebbe il meglio dei due mondi, ma richiede una dipendenza in più e non è stata misurata.

**Perché la decisione non può rientrare dalla finestra.** `scripts/perf-budget.mjs` gira a ogni push (dentro il workflow di verifica) e fallisce se ricompare un foglio di stile esterno che blocca il rendering, o se il documento supera 48 KB gzip, la prima visita 290 KB gzip, il CSS inline 44 KB, i file JS 10, i font precaricati 1 (valori misurati il 01/10/2026 + ~15%, elencati nei commenti dello script). Provata nei due sensi: con `inlineCss: false` esce con codice 1 segnalando «1 foglio di stile esterno che blocca il rendering», con la configurazione adottata esce 0.

---

## 1. Punteggi e metriche (pre-fix, durante l'audit)

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

**Core Web Vitals (mobile 4G):** — valori **simulati** (vedi la precisazione nella sezione 0b: l'LCP osservato coincide con l'FCP, quindi questi numeri dicono quanto la simulazione attribuisce al JavaScript, non quanto il testo aspetti per dipingersi).

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

> **Esito (01/10/2026):** cosa è stato applicato, cosa è stato scartato e i numeri prima/dopo sono nella [sezione 0b](#0b-fix-24-di-m3-cosa-è-stato-applicato-e-misure-primadopo-01102026). Questa sezione resta la diagnosi originale.

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

**Fix 3 — CSS inline: applicato (01/10/2026).** Next 16 può inlinare il CSS della pagina:
```ts
// next.config.ts
experimental: { inlineCss: true },
```
Misurato prima/dopo con build affiancate e run alternati: **LCP simulato −253 ms (6 round su 6)**, TBT invariato, **+0,35 KB brotli in prima visita** e +7,4 KB per navigazione client-side. Tabella completa in [§0d](#0d-decisione-finale-su-experimentalinlinecss-adottato). Resta una flag sperimentale: se una versione futura di Next la rimuove, il sito torna alla richiesta CSS esterna senza altre modifiche.

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
**Fix:** i Fix 1–4 sopra + mantenere `font-display: swap` (già attivo). Dopo i fix, ricontrollare home-mobile: obiettivo **TBT ≤ 200 ms** (centrato: mediana 170 ms). L'obiettivo **LCP ≤ 2,5 s** va invece riletto alla luce della sezione 0b: l'LCP *osservato* coincide con l'FCP anche su 3G reale, quindi il numero simulato di 2,6–2,8 s non descrive un'attesa del testo. La diagnosi "il ritardo sta fra primo paint e dipinto del contenuto principale" era quindi sbagliata: non c'è nessun ritardo fra i due.

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

# Action plan — Ahsen Kurtoski

Ordine di esecuzione consigliato: **Critical subito → High questa settimana → Medium entro 2 settimane → Quick win quando tocchi il codice → Long-term nel trimestre.**
Riferimenti incrociati: [audit report](audit-report.md) (bug), [performance](performance-report.md), [SEO checklist](seo-checklist.md), [CSV find & replace](find-replace-log.csv).

> **Aggiornamento 30/09/2026 (fine giornata):** **C1, C2, H1, H2, H3, H4, M1, L1** e il fix 1 di M3 sono **fatti, committati e deployati** (commit `c3bc58c`). Verifiche sul sito live: audit link **0 problemi / 0 avvisi** su 16 pagine, Lighthouse a11y **100/100**.
> Restano aperti: **H5** (solo i testi del sito dello studio), **M3 fix 2–4**, **M4** (Search Console), **QW2** (tap target 44 px), **QW4** (header duplicati), **L4** (collegamenti locali Vercel/git). Dettagli in [fixes-applied.md](fixes-applied.md).
>
> **Aggiornamento 01/10/2026:** anche **M2** (title e meta description) e **M3 fix 2–4** (font mono, reveal CSS, bundle) sono **fatti e verificati** — 16/16 pagine nel range ideale di title/description, e sulla home mobile −25 KB per pagina con un componente client in meno. Committate (`f480b5e`) e **deployate su Vercel il 01/10/2026**: su PageSpeed Insights mobile **Perf 96 → 100**, LCP **2,4 → 1,7 s**, TBT **72 → 20 ms**, risorse render-blocking **1 → 0**. Restano aperti **H5**, **M4**, **QW2**, **QW4** e **L4**.

---

## 🔴 CRITICAL — da fare subito

### C1 · Sblocca il dominio ufficiale (rinomina progetto Vercel) — ✅ FATTO il 30/09/2026
**Esito:** progetto rinominato; `ahsenkurtoski.vercel.app` → **200**, `axsenkurtoski.vercel.app` → **307** verso il nuovo; audit link e `seo:live` sul dominio ufficiale puliti. Resta solo `npx vercel link`, che richiede il tuo accesso (voce L4).

- **Problema (come si presentava durante l'audit):** `ahsenkurtoski.vercel.app` → 404; canonical/sitemap/robots puntano lì. Il sito è online solo sul vecchio dominio.
- **Come riprodurlo:** `curl -sI https://ahsenkurtoski.vercel.app/` → 404.
- **Soluzione esatta:** Vercel → progetto `axsenkurtoski` → Settings → General → Project Name → `ahsenkurtoski` → Save. Verifica: `curl -sI https://axsenkurtoski.vercel.app/` → 200 e `curl -sI https://axsenkurtoski.vercel.app/` → **307** (era previsto 308: Vercel risponde 307 Temporary Redirect) → 200. Poi `npm run seo:live -- https://ahsenkurtoski.vercel.app` e `npm run audit:links -- https://ahsenkurtoski.vercel.app` — entrambi eseguiti il 30/09/2026, tutto verde.
- **Impatto:** SEO bloccante risolto — senza questo Google non indicizza nulla correttamente. **Difficoltà:** Facile (2 min, dashboard).

### C2 · Pubblica le sostituzioni già pronte nel working tree — ✅ FATTO il 30/09/2026
**Esito:** commit `c3bc58c` su `main` (41 file) pushato; il sito live mostra handle `AhsenKurtoski`, brand "Ahsen Studio" e il link aggiornato del sito dello studio.

- **Problema (come si presentava durante l'audit):** le correzioni di handle/brand sono applicate al codice ma non ancora online.
- **Come riprodurlo:** il sito live mostra ancora GitHub `AxsenXzc`, brand "Axsen Studio".
- **Soluzione esatta:** dopo C1 (e H1 qui sotto, perché i link nuovi devono esistere): commit dei file modificati (`src/lib/site.ts`, `package.json`, `.gitignore`, `scripts/audit-*.mjs`) → push → deploy automatico.
- **Impatto:** coerenza identità "Ahsen Kurtoski" su tutto il sito. **Difficoltà:** Facile.

---

## 🟠 HIGH — questa settimana

### H1 · Rinomina gli account social ad `AhsenKurtoski` (o ripristina i vecchi handle) — ✅ CHIUSO il 01/10/2026
**Esito:** `github.com/AhsenKurtoski` → **200** (profilo senza più riferimenti ad "Axsen"). **Correzione del 01/10/2026:** gli handle di LinkedIn e Instagram scritti il 30/09 erano ricostruiti a mano e **non esistevano** (i bot non potevano accorgersene: LinkedIn risponde 999 e Instagram 200 a qualunque username). In `src/lib/site.ts` ci sono ora i profili veri — `linkedin.com/in/ahsen-kurtoski-397b00354` e `instagram.com/ahsenstudio` — e sono i 4 URL in `sameAs`.

- **Problema (come si presentava durante l'audit):** i nuovi URL nel codice non esistono ancora — verificato: `github.com/AhsenKurtoski` → **404**; LinkedIn/Instagram non verificabili da bot.
- **Come riprodurlo:** apri i tre link dalla home (dopo il deploy).
- **Soluzione esatta:** GitHub → Settings → Account → Change username → `AhsenKurtoski` (mantiene il redirect dal vecchio); Instagram → Cambia username; LinkedIn → Modifica URL pubblico. Poi verifica i tre URL e aggiorna le bio social con il sito. *In alternativa:* ripristina in `src/lib/site.ts` (righe 100–102) i vecchi handle e non toccare gli account.
- **Impatto:** `sameAs` e link di identità funzionanti = segnale forte per la ricerca sul nome. **Difficoltà:** Facile (ma richiede accesso agli account).

### H2 · Contraste: `text-zinc-500` → `text-zinc-400` (16 occorrenze, 9 file) — ✅ APPLICATO
- **Problema:** 4,06–4,09:1 su testi piccoli; richiesto ≥4,5:1. Lighthouse: 6–10 nodi per pagina.
- **Come riprodurlo:** Lighthouse → Accessibility → `color-contrast` (`audit/lighthouse/*.report.html`).
- **Soluzione esatta:** `grep -rl "text-zinc-500" src | xargs sed -i 's/text-zinc-500/text-zinc-400/g'` — file: `page.tsx`, `chi-sono/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, `blog/tag/[tag]/page.tsx`, `privacy/page.tsx`, `site-footer.tsx`, `breadcrumbs.tsx`, `contact-form.tsx`.
- **Impatto:** A11y 96→~100 su tutto il sito. **Difficoltà:** Facile.

### H3 · /chi-sono: HTML semantico (timeline e info rapide) — ✅ APPLICATO
- **Problema:** `list`/`listitem` (div del componente Reveal fra `<ol>` e `<li>`) e `definition-list`/`dlitem` (dt/dd annidati sotto due div). A11y 81/100.
- **Come riprodurlo:** Lighthouse su `/chi-sono`.
- **Soluzione esatta:** snippet completi in [audit report](audit-report.md) (sezione H3: invertire `<li>`/`<Reveal>`; sostituire `<dl>` con `<ul>/<li>`).
- **Impatto:** A11y 81→~100, albero di accessibilità corretto anche per i crawler AI. **Difficoltà:** Facile.

### H4 · Header: rimuovi l'`aria-label` dal logo — ✅ APPLICATO
- **Problema:** `label-content-name-mismatch` su tutte le pagine.
- **Soluzione esatta:** in `src/components/site-header.tsx` (righe 22–26) togli `aria-label={…}`: il testo visibile "AK Ahsen Kurtoski" è già l'etichetta giusta.
- **Impatto:** A11y. **Difficoltà:** Facile.

### H5 · Sito Netlify dello studio: aggiorna i testi "Axsen Kurtoski" — ⚙️ PARZIALE (sottodominio rinominato, link sistemato)
- **Problema:** `<title>` e description del sito dello studio dicono ancora "Axsen Kurtoski".
- **Fatto (30/09/2026):** il sito è stato rinominato in `ahsen-studio.netlify.app` (il vecchio `axsen-studio.netlify.app` risponde 404 e Netlify non crea redirect fra sottodomini) e il link in `src/lib/site.ts` riga 92 è stato aggiornato: card della home e footer ora puntano al sito vivo.
- **Resta da fare:** nel **progetto del sito dello studio** aggiornare `<title>`, meta description e i testi che citano "Axsen Kurtoski"; valuta un dominio personale al posto del `.netlify.app`.
- **Impatto:** coerenza del brand e della ricerca sul nome. **Difficoltà:** Facile (altro progetto).

---

## 🟡 MEDIUM — entro 2 settimane

### M1 · H1 su tutte le pagine — ✅ APPLICATO
- **Problema:** 14/16 pagine senza `<h1>` (SectionHeading rende sempre h2). La pagina "Chi è Ahsen Kurtoski?" non ha H1.
- **Soluzione esatta:** prop `as?: "h1" | "h2"` su `src/components/section-heading.tsx`; poi `as="h1"` sulla prima intestazione di `/chi-sono`, `/blog`, `/contatti`, `/privacy`, `/blog/tag/[tag]` (snippet completo in [audit report](audit-report.md), sezione M1).
- **Impatto:** SEO on-page + gerarchia titoli per screen reader. **Difficoltà:** Facile.

### M2 · Title e description ottimizzati — ✅ FATTO e deployato il 01/10/2026 (commit `f480b5e`)
- **Problema:** 2 title >60 char; description 94–122 char (ideale 140–155).
- **Soluzione esatta:** tabella con le proposte pagina per pagina in [audit report](audit-report.md) (sezione M2). Gli articoli si correggono nell'`excerpt` del frontmatter (`src/content/posts/*.md`).
- **Esito:** riscritti title e description di `/blog`, `/contatti`, `/privacy`, `/chi-sono`, dei 4 articoli e dei 7 archivi tag, più `shortBio` della home; valori finali e verifiche in [fixes-applied.md §7](fixes-applied.md#7-title-e-meta-description-lunghezze-ideali). Le soglie di `seo:check` sono state portate a title ≤ 60 e description 140–155, così la voce non può regredire in silenzio. *Deployato il 01/10/2026.*
- **Impatto:** CTR in SERP. **Difficoltà:** Facile.

### M3 · Performance mobile: typing, font mono, bundle — ✅ FATTO e deployato il 01/10/2026 (commit `f480b5e`)
- **Problema:** home mobile Perf 71 (LCP 3,10 s, TBT 930 ms); 28 KB di JS inutilizzati; font mono precaricato ovunque; CSS render-blocking ~150 ms.
- **Come riprodurlo:** `npx lighthouse` (comandi in [performance report](performance-report.md#6-come-riprodurre)).
- **Soluzione esatta:** Fix 1–4 in [performance report §3](performance-report.md#3-cause-del-lag-e-proposte-di-fix): typing con `prefers-reduced-motion` + pausa a scheda nascosta; `preload: false` per Geist Mono; valutare `experimental.inlineCss` (fatto e adottato); `@next/bundle-analyzer` e `dynamic()` per i widget non critici.
- **Esito:** fix 1–4 applicati e misurati — typing (già deployato), `preload: false` per il mono, `Reveal` senza JS con animazione CSS scroll-driven, bundle analizzato. `browserslist` **provato e scartato** (i polyfill legacy stanno nel framework); `inlineCss` **provato con due build affiancate e adottato** (LCP simulato −253 ms in 6 round su 6, +0,35 KB brotli in prima visita; §0d del performance report), con la motivazione scritta in `next.config.ts`. Home mobile in locale: byte 258 → 233 KB, Perf mediana 92 → 94, LCP 2,8 → 2,7 s, TBT 210 → 170 ms. Sull'LCP: i 2,6–2,8 s sono **stima della simulazione** Lighthouse, non un ritardo reale — l'LCP osservato coincide con l'FCP (0,8–1,0 s) in 11 run su 11, e l'ipotesi del cambio font è stata provata con un A/B su `font-display` e respinta. Verifica indipendente su **PageSpeed Insights** (deploy attuale): mobile **Perf 96, LCP 2,4 s, TBT 70 ms, CLS 0**, desktop **Perf 100, LCP 0,52 s**; nessun dato di campo CrUX (traffico insufficiente). Dettagli in [performance report](performance-report.md) (§0b e §0c).
- **Impatto:** obiettivo Perf ≥85 mobile, LCP ≤2,5 s, TBT ≤200 ms. **Difficoltà:** Media.

### M4 · Google Search Console: proprietà nuova + sitemap + cambio indirizzo
- **Problema:** nessuna proprietà attiva sul dominio corretto (il dominio non esiste ancora).
- **Soluzione esatta:** sequenza in [SEO checklist](seo-checklist.md) (§4, «Google Search Console») e in `CHECKLIST-SEARCH-CONSOLE.md`.
- **Impatto:** indicizzazione reale e monitoraggio. **Difficoltà:** Facile (10 min + attesa Google).

---

## ⚡ QUICK WINS (facili, alto rapporto beneficio/sforzo)

| # | Fix | File | Snippet |
|---|---|---|---|
| QW1 | Input form a 16 px (stop zoom iOS) — ✅ APPLICATO | `components/contact-form.tsx` | `text-sm` → `text-base sm:text-sm` nella `inputClass` |
| QW2 | Tap target 44 px (menu + social) | `site-header.tsx`, `social-links.tsx` | `size-10` → `size-11` |
| QW3 | `subject` del form in italiano/chiaro | `app/api/contatti/route.ts` | già ok, verificare testo email |
| QW4 | Allinea header sicurezza | `vercel.json` / `next.config.ts` | aggiungi `interest-cohort=()` anche in `vercel.json` (o togli il duplicato) |
| QW5 | Barra di avanzamento anche su hover/focus? | — | no: già a posto |
| QW6 | Preload mono off | `layout.tsx` | `preload: false` (vedi M3) |

---

## 🎯 LONG-TERM (trimestre)

1. **Dominio personale** (`ahsenkurtoski.com`): acquisto + Vercel Domains + 301 dal `.vercel.app`; aggiornare `NEXT_PUBLIC_SITE_URL`. Un dominio proprio rafforza identità e fiducia; il `.vercel.app` resta come redirect.
2. **Contenuti che rispondono alle query sul nome**: la pagina `/chi-sono` è pronta; aggiungi articoli che ti citano sostanzialmente (progetti, retrospettive) e link in entrata (bio, directory dev, Fiverr, curriculum).
3. **Misurazione**: Search Console mensile (query, copertura, CWV field data quando disponibile); niente analytics invasivi in linea con la privacy del sito.
4. **Pipeline performance**: `npm run audit:responsive` + Lighthouse locali prima dei cambi grossi; `@next/bundle-analyzer` su ogni release.
5. **PWA opzionale**: service worker per caching offline (solo se aggiungi valore ai lettori; richiede avviso privacy aggiornato se cambiano i dati).
6. **Knowledge panel signals**: nome e foto identici su tutti i profili, `sameAs` coerente (dopo H1), Google Business Profile già coerente con `ProfessionalService`.

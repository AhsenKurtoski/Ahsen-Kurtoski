# Audit tecnico completo — Ahsen Kurtoski

**Data audit:** 30 settembre 2026
**Oggetto:** repo locale `Ahsen-Blog` + sito pubblicato
**Sito effettivamente servito:** `https://axsenkurtoski.vercel.app` (unico dominio che risponde)
**Dominio ufficiale dichiarato nel codice:** `https://ahsenkurtoski.vercel.app` → **404 NOT_FOUND**

Metodi: build di produzione locale, `tsc --noEmit`, ESLint, `seo:check`, crawler link interno (`scripts/audit-links.mjs`), Chrome for Testing headless con `scripts/audit-responsive.mjs` (console, rete, 7 viewport, interazioni), Lighthouse 13.5 locale (7 run), Googlebot UA, MCP Vercel.

> **Stato al 30/09/2026:** i problemi **H2, H3, H4, M1, L1** e l'effetto typing (M3) sono **già corretti nel working tree** — non ancora committati né deployati. Prima → dopo e verifiche in [fixes-applied.md](fixes-applied.md) (Lighthouse a11y 100/100 su tutte le pagine testate). Restano aperti: **C1** (dominio 404), **H1** (handle social da rinominare), **H5**, **M2**, **M3 fix 2–4**, **M4**.

---

## 1. Riepilogo esecutivo

| Area | Stato | Nota |
|---|---|---|
| Errori JavaScript runtime | ✅ 0 | Nessun errore console o page error su tutte le pagine (l'unico "Failed to load resource 404" è la pagina 404 stessa, atteso) |
| Richieste di rete fallite | ✅ 0 | 0 richieste fallite, 0 risposte ≥400 su tutte le pagine |
| Link interni | ✅ 17/17 | Tutti 200, nessuna catena di redirect, nessun doppio slash |
| Link esterni | ⚠️ 10 | GitHub/LinkedIn/Instagram/Fiverr non verificabili da bot; 1 link interno assoluto verso il dominio morto |
| Dominio & indicizzabilità | 🔴 **Critico** | Sitemap e canonical puntano a un dominio che risponde 404 |
| Core Web Vitals | ⚠️ | LCP 3,1 s su mobile (home), TBT 930 ms; CLS ~0, TTFB 66 ms |
| Accessibilità | ⚠️ | Contraste 4,06–4,09:1 (< 4,5) in 16 punti; 4 errori semantici su /chi-sono |
| On-page SEO | ⚠️ | H1 mancante su 14/16 pagine; 2 title >60 char; description spesso <120 |
| Dati strutturati | ✅ | JSON-LD valido su tutte le pagine (Person, WebSite, ProfessionalService, BlogPosting, BreadcrumbList, FAQPage) |
| Responsive | ✅ | Nessun overflow a 360/375/390/412/768/1024/1280 px; interazioni tutte funzionanti |
| Sicurezza/header | ✅ | HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy |

**Punteggi Lighthouse (locali, Chrome 154):**

| Pagina | Modalità | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home | mobile (4G) | **71** | 96 | 100 | 100 | 3,10 s | 930 ms | 0 |
| Home | desktop | 96 | 96 | 100 | 100 | 512 ms | 144 ms | 0 |
| Home | 3G simulato | 84 | 96 | 100 | 100 | 3,42 s | — | ~0 |
| Chi sono | mobile | 95 | **81** | 100 | 100 | 2,15 s | 207 ms | 0 |
| Contatti | mobile | 84 | 96 | 100 | 100 | 2,18 s | 534 ms | 0 |
| Articolo SEO | mobile | 84 | 96 | 100 | 100 | 2,43 s | 529 ms | 0 |
| Articolo SEO | desktop | **100** | 96 | 100 | 100 | 482 ms | 0 ms | 0 |

---

## 2. Problemi per priorità

### 🔴 CRITICAL

#### C1 — Il dominio ufficiale risponde 404; canonical e sitemap puntano lì
**Problema.** Il codice dichiara `https://ahsenkurtoski.vercel.app` come dominio canonico (canonical, sitemap, robots.txt, Open Graph, JSON-LD, link "Sito ufficiale" in home). Quel dominio **non è assegnato ad alcun progetto Vercel** e risponde `404: NOT_FOUND`. Il sito è servito solo da `axsenkurtoski.vercel.app`, che però dichiara canonical verso il dominio morto.

**Riproduzione.**
```bash
curl -sI https://ahsenkurtoski.vercel.app/        # → 404
curl -s  https://axsenkurtoski.vercel.app/ | grep canonical   # → https://ahsenkurtoski.vercel.app
curl -s  https://axsenkurtoski.vercel.app/sitemap.xml | grep loc | head -1  # → dominio morto
```

**Diagnosi (MCP Vercel).** Il progetto si chiama ancora **`axsenkurtoski`** (`prj_9fBKVo5pMCyMJSY5Eh7zPkUTuYpg`, team `team_iUJUaOjZnfAZQQAzeap5CntM`) e possiede un solo dominio: `axsenkurtoski.vercel.app`. Il dominio nuovo non è assegnato a nessuno. Gli ultimi deploy di produzione sono tutti `READY` (repo GitHub `AxsenXzc/Ahsen-Kurtoski`, ultimo commit `23914af`).

**Soluzione esatta.**
1. Vercel → progetto `axsenkurtoski` → **Settings → General → Project Name** → `ahsenkurtoski` → **Save**.
2. Vercel assegna automaticamente `ahsenkurtoski.vercel.app` e trasforma `axsenkurtoski.vercel.app` in **redirect 308** verso il nuovo dominio.
3. Verifica:
```bash
curl -sI https://ahsenkurtoski.vercel.app/            # 200
curl -sI https://axsenkurtoski.vercel.app/ | head -1  # 308 + Location: ahsenkurtoski
npm run seo:live -- https://ahsenkurtoski.vercel.app  # tutto verde
npm run audit:links -- https://ahsenkurtoski.vercel.app
```
4. Aggiorna il collegamento locale: `npx vercel link` (il file `.vercel/project.json` punta ancora a `trae_axsen-kurtoski_vmd0`).
5. In Search Console: proprietà nuova → invia `sitemap.xml` → "Cambio di indirizzo" (vedi `CHECKLIST-SEARCH-CONSOLE.md`).

*Alternativa temporanea (solo se non puoi rinominare subito):* in Vercel → Settings → Environment Variables imposta `NEXT_PUBLIC_SITE_URL=https://axsenkurtoski.vercel.app` e ridispiega: canonical e sitemap tornano coerenti col dominio funzionante. **Non farlo se rinomini a breve: si ricomincia da capo con l'indicizzazione.**

**Impatto.** SEO: bloccante. Finché canonical/sitemap puntano a un 404, Google non può indicizzare correttamente nulla del sito (canonical verso pagina inesistente = pagina esclusa). **Difficoltà:** Facile (2 minuti, dashboard).

---

### 🟠 HIGH

#### H1 — I nuovi handle `AhsenKurtoski` non esistono ancora (link rotti al deploy)
**Problema.** Su tua indicazione ho sostituito gli handle social con `AhsenKurtoski` (GitHub/LinkedIn/Instagram). Verifica del 30/09: `https://github.com/AhsenKurtoski` → **404**. LinkedIn (999) e Instagram (login wall) non sono verificabili da strumenti automatici.
**Riproduzione.** Apri i tre URL nuovi dalla home; quello GitHub dà 404.
**Soluzione.** Prima del prossimo deploy: rinomina gli account (GitHub → Settings → Account → Change username; Instagram → Cambia username; LinkedIn → Modifica URL pubblico). GitHub mantiene il redirect dal vecchio username; per Instagram/LinkedIn verifica che i vecchi link continuino a funzionare, altrimenti aggiorna le bio che li contengono. Se preferisci non rinominare, ripristina i vecchi handle in `src/lib/site.ts` (righe 100–102).
**Impatto.** SEO/UX: link di identità (`sameAs`) rotti indeboliscono il collegamento del nome alla persona. **Difficoltà:** Facile (ma richiede l'accesso agli account).

#### H2 — Contraste insufficiente su testi piccoli (4,06–4,09:1, richiesto 4,5:1)
**Problema.** 16 usi di `text-zinc-500` (#71717b) su fondi `#0b0b11`/`#0a0a0f` = **4,06–4,09:1**. Lighthouse segnala 6–10 nodi per pagina (footer, breadcrumb, meta articoli, card home, etichette /chi-sono).
**Riproduzione.** Lighthouse → Accessibility → `color-contrast` (report in `audit/lighthouse/`).
**Soluzione.** Passa i testi piccoli a `text-zinc-400` (contrasto ~7,9:1):
```bash
grep -rl "text-zinc-500" src | xargs sed -i 's/text-zinc-500/text-zinc-400/g'
```
File coinvolti (16 occorrenze): `src/app/page.tsx`, `chi-sono/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`, `blog/tag/[tag]/page.tsx`, `privacy/page.tsx`, `components/site-footer.tsx`, `components/breadcrumbs.tsx`, `components/contact-form.tsx`.
**Impatto.** A11y: da 96 a ~100; UX: leggibilità. **Difficoltà:** Facile.

#### H3 — /chi-sono: HTML non valido nella timeline e nelle info rapide
**Problema.** `<li>` dentro `<ol>` ma avvolti da `<div>` (componente `Reveal`) → axe `list` + `listitem`. `<dt>/<dd>` annidati due livelli sotto `<dl>` → `definition-list` + `dlitem`. Effetti: accessibilità 81/100, categoria "agentic-browsing" 50/100 (albero di accessibilità malformato), possibile lettura errata da screen reader e crawler.
**Riproduzione.** Lighthouse su `/chi-sono` → vedi `audit/raw/lighthouse-details.json`.
**Soluzione 1 — timeline (`src/app/chi-sono/page.tsx`, righe 121–144):** inverti l'annidamento, il `<li>` deve essere figlio diretto di `<ol>`:
```tsx
{site.timeline.map((step, index) => (
  <li key={step.year} className="relative">
    <Reveal delay={index * 90}>
      {/* …contenuto esistente (span punto, anno, titolo, descrizione)… */}
    </Reveal>
  </li>
))}
```
**Soluzione 2 — info rapide (righe 90–106):** sostituisci la `<dl>` con una lista semplice:
```tsx
<ul className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 text-sm">
  {facts.map((fact) => (
    <li key={fact.label} className="flex items-start gap-3">
      <Icon name={fact.icon} className="mt-0.5 size-4 shrink-0 text-[#00d4ff]" />
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">{fact.label}</p>
        <p className="text-zinc-200">{fact.value}</p>
      </div>
    </li>
  ))}
</ul>
```
**Impatto.** A11y 81→~100, albero di accessibilità pulito. **Difficoltà:** Facile.

#### H4 — `label-content-name-mismatch` sul logo dell'header
**Problema.** `<Link aria-label="Ahsen Kurtoski — torna alla home">` ma dentro c'è testo visibile "AK Ahsen Kurtoski": l'etichetta accessibile non include il testo visibile.
**Riproduzione.** Lighthouse → Accessibility → `label-content-name-mismatch` (tutte le pagine).
**Soluzione (`src/components/site-header.tsx`, righe 22–26):** rimuovi `aria-label` (il testo visibile è già descrittivo):
```tsx
<Link href="/" className="flex items-center gap-2.5">
```
**Impatto.** A11y. **Difficoltà:** Facile.

#### H5 — Il sito Netlify dello studio mostra ancora "Axsen Kurtoski" — ⚠️ PARZIALE
**Aggiornamento 30/09/2026.** Il sito su Netlify è stato **rinominato**: `https://ahsen-studio.netlify.app` risponde 200, mentre il vecchio `https://axsen-studio.netlify.app` ora risponde **404** (Netlify non crea redirect fra sottodomini `.netlify.app`: il link nella home e nel footer era rotto). L'URL in `src/lib/site.ts` è stato aggiornato di conseguenza.
**Resta da fare.** Il sito dello studio ha ancora `<title>Axsen Kurtoski — Sviluppatore Web Freelance a Feltre</title>` e description con "Axsen Kurtoski": title, description e testi vanno corretti **nel progetto del sito** (non presente in questo repo).
**Impatto.** Coerenza identità/SEO locale. **Difficoltà:** Facile (su un altro progetto).

---

### 🟡 MEDIUM

#### M1 — H1 mancante su 14 pagine su 16
**Problema.** Solo la home e gli articoli hanno un `<h1>`. `/chi-sono`, `/blog`, `/contatti`, `/privacy` e le 7 pagine tag usano `SectionHeading`, che rende sempre `<h2>`. La pagina "Chi è Ahsen Kurtoski?" — quella che deve rispondere alla query "chi è Ahsen Kurtoski" — non ha un H1.
**Soluzione.** Aggiungi una prop `as` al componente:
```tsx
// src/components/section-heading.tsx
export function SectionHeading({ eyebrow, title, description, align = "left", as: Tag = "h2" }: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  // …sostituisci <h2 className="…">{title}</h2> con:
  <Tag className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</Tag>
}
```
Poi, **solo per la prima intestazione di ogni pagina**: `/chi-sono` riga 59, `/blog` riga 46, `/contatti` riga 55, `/privacy` riga 76, `/blog/tag/[tag]` riga 65 → `<SectionHeading as="h1" … />`.
**Impatto.** SEO on-page + gerarchia per screen reader. **Difficoltà:** Facile.

#### M2 — Meta description corte (94–122 char) e 2 title oltre 60
**Problema.** Le description di articoli/tag/contatti sono sotto il range ottimale 140–155; i title di due articoli sono 62 e 65 caratteri (Google taglia ~60). Pagina per pagina (dati in `audit/raw/onpage.json`):

| Pagina | Title attuale (char) | Proposta |
|---|---|---|
| `/blog/seo-per-le-persone-...` | 65 | "SEO per le persone: farsi trovare su Google · Ahsen Kurtoski" (58) |
| `/blog/strumenti-essenziali-...` | 62 | "Strumenti essenziali per il creator digitale · Ahsen Kurtoski" (56) |
| `/blog` | 21 | "Blog: sviluppo web, strumenti e tutorial · Ahsen Kurtoski" (55) |
| tag | 32–43 | ok come pattern, allunga la description a ~140 |
| `/contatti` | desc 94 | "Scrivimi per un progetto, una collaborazione o una domanda: rispondo a tutti. Form rapido, email diretta e FAQ." (~120) |

Per gli articoli la description è l'`excerpt` del frontmatter (`src/content/posts/*.md`): allungala nelle card, cambia anche l'anteprima.
**Impatto.** CTR in SERP. **Difficoltà:** Facile.

#### M3 — Main thread / TBT elevato su mobile (LCP 3,1 s, TBT 930 ms)
Dettaglio nella [performance report](performance-report.md#3-cause-del-lag-e-proposte-di-fix). Sintesi: il bundle JS principale pesa 147 KB (28 KB non usati), l'effetto typing gira in continuazione anche a pagina nascosta e non rispetta `prefers-reduced-motion`; il font mono (23 KB) è precaricato su tutte le pagine anche dove non serve.
**Impatto.** Performance mobile (Perf 71→85+), UX. **Difficoltà:** Media.

#### M4 — Sitemap e OG sono N/A per immagini; nessuna immagine di contenuto
**Problema.** Nessuna immagine di contenuto sul sito (0 `<img>`; icone SVG e OG generate). Non ci sono quindi problemi srcset/lazy/WebP — ma anche nessun `image:image` nella sitemap, che ora non serve.
**Soluzione futura (quando aggiungi immagini):** usa `next/image` con `width/height` espliciti, `loading="lazy"` (tranne la prima visibile), formato WebP/AVIF automatico; il markdown degli articoli supporta già immagini con `loading="lazy"` (`src/lib/posts.ts`), ma senza width/height → aggiungi la dimensione al markdown o passa a `next/image`.
**Impatto.** Futuro. **Difficoltà:** Facile (quando serve).

---

### ⚪ LOW / QUICK WINS

#### L1 — Input del form a 14 px → zoom automatico su iOS
`inputClass` in `src/components/contact-form.tsx` usa `text-sm` (14 px): su iPhone il focus allo zoom è automatico sotto i 16 px. Fix:
```tsx
const inputClass = "w-full rounded-xl border … px-4 py-3 text-base sm:text-sm …";
```
**Impatto.** UX mobile. **Difficoltà:** Facile.

#### L2 — Tap target 40×40 px (hamburger + icone social)
WCAG 2.2 AA richiede 24 px (ok), ma le linee guida touch consigliano 44 px. Bump `size-10` → `size-11` in `site-header.tsx` (bottone menu) e in `social-links.tsx`.
**Impatto.** UX. **Difficoltà:** Facile.

#### L3 — Header di sicurezza duplicati con valori leggermente diversi
`next.config.ts` e `vercel.json` definiscono entrambi gli header; solo `next.config.ts` include `interest-cohort=()`. Nessun conflitto reale (Vercel unisce), ma conviene allinearli o tenerne uno solo.
**Impatto.** Manutenibilità. **Difficoltà:** Facile.

#### L4 — Collegamento locale Vercel stantio
`.vercel/project.json` punta a `trae_axsen-kurtoski_vmd0` mentre il progetto reale è `axsenkurtoski`. Dopo la rinomina: `npx vercel link`.
**Impatto.** Solo sviluppo locale. **Difficoltà:** Facile.

---

## 3. Cosa NON è un problema (verificato)

- **Errori JS/console:** zero su tutte le pagine (solo il 404 atteso sulla pagina 404).
- **Redirect:** `http → https` 308 corretto; nessuna catena di redirect sui link interni; la variante con slash finale sull'hosting non crea doppioni.
- **404:** pagina inesistente → 404 (nessun soft-404).
- **Font:** self-hosted (nessuna richiesta a Google), `display: swap`, preload attivo (vedi M3 per il mono).
- **Terze parti:** zero richieste esterne a runtime (privacy e performance).
- **Responsive:** 35 combinazioni pagina×viewport senza overflow, menu mobile e avviso cookie funzionanti, form con validazione nativa che blocca i campi vuoti senza chiamare l'API.

---

## 4. Correzioni già applicate in questa sessione

| File | Modifica |
|---|---|
| `src/lib/site.ts` | Handle social → `AhsenKurtoski` (GitHub, LinkedIn, Instagram); brand testuale → "Ahsen Studio"; `updated` → 2026-09-30 |
| `scripts/audit-links.mjs` | *Nuovo.* Crawler link/scansionabilità riutilizzabile (`npm run audit:links`) |
| `scripts/audit-responsive.mjs` | *Nuovo.* Audit responsive/console/interazioni con Chrome locale (`npm run audit:responsive`) |
| `scripts/audit-lh-summary.mjs` | *Nuovo.* Riepilogo dei report Lighthouse (`node scripts/audit-lh-summary.mjs`) |
| `package.json` | Script `audit:links`, `audit:responsive`; devDependency `lighthouse`, `@puppeteer/browsers` |
| `.gitignore` | Aggiunto `.chrome/` (Chrome for Testing locale, non va committato) |

Verifica dopo le modifiche: build ✅, `tsc --noEmit` ✅ 0 errori, ESLint ✅, `seo:check` ✅ 16/16 pagine, build HTML contiene i nuovi handle e "Ahsen Studio", nessun "Axsen" residuo non intenzionale.

Tutte le altre correzioni (C1, H2–H5, M1–M3, L1–L4) sono **documentate qui con lo snippet esatto** e pronte da applicare: vedi [action plan](action-plan.md).

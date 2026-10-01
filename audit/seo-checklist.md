# SEO checklist — Ahsen Kurtoski

**Data:** 30 settembre 2026 · Dati per pagina in `audit/raw/onpage.json` · Crawl in `audit/raw/link-audit.json` (cartella **locale, non versionata**: si rigenera con gli script in `scripts/audit-*.mjs`)
Legenda: ✅ a posto · ⚠️ migliorabile · ❌ da correggere · — non applicabile

> **Aggiornamento 30/09/2026:** la matrice e la sezione technical qui sotto fotografano l'audit del mattino (**prima** dei fix e della rinomina del dominio). Lo stato **attuale**, verificato sul dominio ufficiale dopo il deploy, è nella [sezione 1b](#1b-stato-attuale-dopo-i-fix-verificato-sul-live): canonical coerenti, un solo `<h1>` su 16/16 pagine, robots e sitemap sul dominio giusto. Title e description sono stati riscritti il 01/10/2026 (M2, valori reali nella sezione 1b); resta aperta la Search Console (M4).

---

## 1. On-page — matrice per pagina (16 URL) — **fotografia all'audit, prima dei fix**

| Pagina | Title (char) | Description (char) | H1 | Canonical | OG image | JSON-LD | Esito |
|---|---|---|---|---|---|---|---|
| `/` | "Ahsen Kurtoski — Developer & Creator" (36) ✅ | 138 ✅ | ✅ 1 | ❌ dominio 404 | ✅ | ✅ Person/WebSite/ProfessionalService | ⚠️ canonical |
| `/chi-sono` | "Chi è Ahsen Kurtoski? Biografia, percorso e competenze" (54) ✅ | 131 ✅ | ❌ 0 (è un h2) | ❌ | ✅ | ✅ | ⚠️ H1 + canonical |
| `/blog` | "Blog · Ahsen Kurtoski" (21) ⚠️ corto | 129 ✅ | ❌ 0 | ❌ | ✅ | ✅ | ⚠️ H1 + title + canonical |
| `/contatti` | "Contatti · Ahsen Kurtoski" (25) ⚠️ | 94 ⚠️ corta | ❌ 0 | ❌ | ✅ | ✅ FAQPage | ⚠️ |
| `/privacy` | "Informativa privacy e cookie · Ahsen Kurtoski" (45) ✅ | 133 ✅ | ❌ 0 | ❌ | ✅ | ✅ | ⚠️ H1 + canonical |
| 4 articoli blog | 47–65 ⚠️ due >60 | 105–122 ⚠️ | ✅ 1 | ❌ | ✅ (per articolo) | ✅ BlogPosting+Breadcrumb | ⚠️ canonical |
| 7 archivi tag | 32–43 ⚠️ | 98–109 ⚠️ | ❌ 0 | ❌ | ✅ | ✅ | ⚠️ H1 + description |
| 404 | noindex implicito (404) — | — | ✅ 1 | ❌ | — | — | ✅ (non indicizzabile) |

**Note operative:**
- **Canonical ❌ ovunque** (all'audit): puntavano tutti a `https://ahsenkurtoski.vercel.app`, che allora rispondeva 404 → causa critica C1. **Risolto**: il progetto Vercel è stato rinominato, canonical e sitemap sono coerenti (vedi sezione 1b).
- **H1 mancante su 14/16** (all'audit): fix M1 (prop `as="h1"` su `SectionHeading`) e `headingLevel` su `PostCard`. **Risolto**: 1 `<h1>` su tutte le 16 pagine.
- **Title/description**: ✅ riscritti il 01/10/2026 (M2). Range finale su 16/16 pagine: title **32–60** caratteri, description **140–153**. Le soglie ideali sono ora imposte da `seo:check` a ogni build (prima erano 65/50/165, troppo permissive).
- Alt text: — (nessuna immagine di contenuto; le icone sono SVG decorativi o con `aria-hidden`).
- Internal linking: ✅ ogni pagina ha breadcrumb, nav, footer e link contestuali; 17 link interni unici, tutti 200.

---

## 2. Technical SEO

| Voce | Stato | Evidenza / nota |
|---|---|---|
| HTTPS + redirect da http | ✅ | `http → https` 308 |
| robots.txt raggiungibile e permissivo | ✅ | `Allow: /`, nessun `Disallow` |
| robots.txt dichiara la sitemap corretta | ❌ | Dichiara la sitemap sul **dominio 404** (C1) |
| sitemap.xml valida con URL corretti | ❌ | 16 URL, TUTTI sul dominio 404; equivalenti sul dominio attivo: 200 |
| `lastmod` veritieri | ✅ | date reali per pagina e articolo (aggiornato `updated` a 2026-09-30) |
| Un solo URL per pagina (no doppioni /slash) | ✅ | nessun problema rilevato |
| 404 reali (no soft-404) | ✅ | pagina inesistente → 404 |
| Nessun noindex indesiderato | ✅ | meta robots `index, follow` + googleBot `max-image-preview:large`, `max-snippet:-1` |
| Dati strutturati | ✅ | `Person`, `WebSite`, `ProfessionalService`, `FAQPage` (contatti), `BlogPosting` + `BreadcrumbList` (articoli) — JSON-LD valido su tutte le pagine |
| Breadcrumb schema | ✅ | `BreadcrumbList` con URL assolute |
| FAQ schema | ✅ | 4 domande → 4 coppie Question/Answer |
| Organization / LocalBusiness | ⚠️ | C'è `ProfessionalService` coerente col profilo Business (area Italia); manca un logo `image` quadrato dedicato nel JSON-LD (opzionale) |
| Open Graph + Twitter Card | ✅ | `summary_large_image`, og:image 1200×630 generata per pagina |
| Feed RSS | ✅ | `/feed.xml` con 4 articoli, dichiarato nei `<link rel="alternate">` |
| Manifest PWA | ✅ | `/manifest.webmanifest` con icone 192/512/SVG |
| Service worker / offline | — | non presente, non necessario per un sito editoriale |
| AMP | — | non applicabile (scelta superata da mobile-first + Core Web Vitals) |
| Mobile-first indexing | ✅ | HTML identico per tutti gli UA, contenuto server-rendered |
| hreflang | — | sito monolingua (it) |
| Sitemap immagini / video | — | nessuna immagine di contenuto, nessun video |
| Verifica Google (file HTML) | ✅ | `/google2783a9147b2337cb.html` → **200** sia su `ahsenkurtoski.vercel.app` sia sul vecchio dominio (che redirige); verificato il 30/09/2026 dopo la rinomina |
| Meta `google-site-verification` | — | metodo usato: file HTML (il meta tag via env è predisposto e vuoto) |
| Header sicurezza | ✅ | HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy |
| Compressione | ✅ | brotli (Vercel) |
| Cache asset statici | ✅ | `_next/static` immutable |
| Hosting/redirect dominio vecchio→nuovo | ✅ | `ahsenkurtoski.vercel.app` → 200; `axsenkurtoski.vercel.app` → **307** verso il nuovo (verificato il 30/09/2026) |

---

## 3. Simulazione scansione Googlebot

Test con UA `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` su tutte le 16 URL:

- Sul dominio **funzionante**: 16/16 rispondono 200 con HTML completo (contenuto presente senza JavaScript), canonical, OG e JSON-LD → il sito è scansionabile.
- Sulle URL della **sitemap**: durante l'audit 16/16 davano **404** (dominio non assegnato, causa C1). **Oggi**: 16/16 **200** con canonical, OG e JSON-LD, verificato dal crawler (`--fail-on=all`, 0 problemi) sul dominio ufficiale.
- `robots.txt` raggiungibile da Googlebot, nessun blocco.
- Nessuna dipendenza da JS per i contenuti: quello che vede Googlebot è già tutto lì.

---

## 4. Google Search Console — stato e passi

Stato attuale (30/09/2026): il dominio ufficiale **risponde 200** e il file di verifica è online, quindi la proprietà si può creare subito. La procedura completa è in [`CHECKLIST-SEARCH-CONSOLE.md`](../CHECKLIST-SEARCH-CONSOLE.md) (la voce sul progetto Vercel `axsenkurtoski` è ormai storica: il progetto si chiama `ahsenkurtoski`).

**Sequenza da eseguire (dominio ufficiale già attivo):**

1. Verifica che `https://ahsenkurtoski.vercel.app/google2783a9147b2337cb.html` risponda 200.
2. Search Console → proprietà **Prefisso URL** `https://ahsenkurtoski.vercel.app/` → verifica con **File HTML** (già online).
3. **Sitemap** → invia `https://ahsenkurtoski.vercel.app/sitemap.xml`.
4. **Controllo URL** → home e `/chi-sono` → *Richiedi indicizzazione*.
5. Sulla **vecchia** proprietà: *Cambio di indirizzo* verso il nuovo dominio; non cancellare la proprietà, serve a monitorare il calo.
6. Controlli a distanza (dal giorno dopo): Copertura/«Pagine» e query `site:ahsenkurtoski.vercel.app`.

**Cause probabili di pagine non indicizzate:** la causa strutturale (canonical verso un dominio 404) è stata rimossa. Se qualche pagina resta "Scansionata, non indicizzata", la causa più comune per un sito nuovo senza backlink è la scoperta/valutazione: risposta = contenuti + link dalle bio, non richieste ripetute.

---

## 5. Scansione strutturata dei dati (validazione)

- JSON-LD: parse valido su tutte le pagine (0 errori in `seo:check` e nel crawler). Tipi presenti: `Person`, `WebSite`, `ProfessionalService`, `FAQPage`, `BlogPosting`, `WebPage`, `BreadcrumbList`, `Question/Answer`, `ListItem`.
- Campi chiave presenti: `name`, `url`, `sameAs` (4 URL dopo le sostituzioni), `inLanguage: it-IT`, `areaServed`, `email`, `jobTitle`.
- Verifica manuale consigliata prima del deploy: [Rich Results Test](https://search.google.com/test/rich-results) su home, contatti e un articolo (i validator esterni non sono automatizzabili da qui).

---

## 6. Sintesi

| Area | ✅ | ⚠️ | ❌ |
|---|---|---|---|
| On-page (16 pagine) — **dopo M1 e M2** | 16 | 0 | 0 |
| Technical — **dopo i fix** | 19 | 1 (logo quadrato nel JSON-LD, opzionale) | 0 |
| Scansionabilità Googlebot | 16/16 sul dominio ufficiale | — | — |
| Prossimo passo | **M4 Search Console** sul dominio ormai attivo → poi M3 fix 2–4 | | |

### 1b. Stato attuale (dopo i fix, verificato sul live)

Controlli eseguiti il 30/09/2026 sul dominio ufficiale, dopo il deploy del commit `c3bc58c`:

| Controllo | Prima | Ora |
|---|---|---|
| Canonical di ogni pagina | ❌ puntavano a un dominio 404 | ✅ coincidono con l'URL della pagina (16/16) |
| Sitemap e robots.txt | ❌ dichiaravano il dominio 404 | ✅ `sitemap.xml` con 16 URL e `Sitemap:` in robots.txt su `ahsenkurtoski.vercel.app` |
| `<h1>` per pagina | ❌ assente su 14/16 | ✅ **1 su 16/16**, nessun salto di gerarchia (controllo aggiunto al crawler) |
| Pagine della sitemap raggiungibili | ❌ 16/16 → 404 | ✅ 16/16 → 200 |
| 404 reali, `http → https`, doppi slash | ✅ | ✅ (ricontrollati) |
| Title oltre 60 char · description corte | ⚠️ 2 · molti | ✅ **risolti** il 01/10/2026 (M2): title 32–60, description 140–153 su 16/16 — deployate il 01/10/2026 (commit `f480b5e`) |

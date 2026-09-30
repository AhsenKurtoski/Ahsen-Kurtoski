# SEO checklist — Ahsen Kurtoski

**Data:** 30 settembre 2026 · Dati per pagina in [`audit/raw/onpage.json`](raw/onpage.json) · Crawl in [`audit/raw/link-audit.json`](raw/link-audit.json)
Legenda: ✅ a posto · ⚠️ migliorabile · ❌ da correggere · — non applicabile

---

## 1. On-page — matrice per pagina (16 URL)

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
- **Canonical ❌ ovunque**: puntano tutti a `https://ahsenkurtoski.vercel.app`, che risponde 404 → causa critica C1 (audit report). Si sistemano rinominando il progetto Vercel.
- **H1 mancante su 14/16**: fix M1 (prop `as="h1"` su `SectionHeading`).
- **Title/description**: proposte concrete per pagina in audit report M2.
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
| Verifica Google (file HTML) | ✅ sul dominio attivo | `/google2783a9147b2337cb.html` → 200 su `axsenkurtoski.vercel.app`; **verificare che risponda anche sul dominio nuovo dopo la rinomina** |
| Meta `google-site-verification` | — | metodo usato: file HTML (il meta tag via env è predisposto e vuoto) |
| Header sicurezza | ✅ | HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy |
| Compressione | ✅ | brotli (Vercel) |
| Cache asset statici | ✅ | `_next/static` immutable |
| Hosting/redirect dominio vecchio→nuovo | ❌ | oggi il vecchio dominio serve direttamente (200); dopo la rinomina diventerà 308 |

---

## 3. Simulazione scansione Googlebot

Test con UA `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` su tutte le 16 URL:

- Sul dominio **funzionante**: 16/16 rispondono 200 con HTML completo (contenuto presente senza JavaScript), canonical, OG e JSON-LD → il sito è scansionabile.
- Sulle URL della **sitemap** (dominio nuovo): 16/16 **404** → il problema non è la scansionabilità ma il dominio (C1).
- `robots.txt` raggiungibile da Googlebot, nessun blocco.
- Nessuna dipendenza da JS per i contenuti: quello che vede Googlebot è già tutto lì.

---

## 4. Google Search Console — stato e passi

Stato attuale: la verifica è predisposta via file HTML, ma **qualunque proprietà sul dominio nuovo non può funzionare finché il dominio risponde 404**. La procedura completa è in [`CHECKLIST-SEARCH-CONSOLE.md`](../CHECKLIST-SEARCH-CONSOLE.md) (già corretta per il progetto `axsenkurtoski`).

**Sequenza aggiornata (dopo la rinomina del progetto Vercel, fix C1):**

1. Verifica che `https://ahsenkurtoski.vercel.app/google2783a9147b2337cb.html` risponda 200.
2. Search Console → proprietà **Prefisso URL** `https://ahsenkurtoski.vercel.app/` → verifica con **File HTML** (già online).
3. **Sitemap** → invia `https://ahsenkurtoski.vercel.app/sitemap.xml`.
4. **Controllo URL** → home e `/chi-sono` → *Richiedi indicizzazione*.
5. Sulla **vecchia** proprietà: *Cambio di indirizzo* verso il nuovo dominio; non cancellare la proprietà, serve a monitorare il calo.
6. Controlli a distanza (dal giorno dopo): Copertura/«Pagine» e query `site:ahsenkurtoski.vercel.app`.

**Cause probabili di pagine non indicizzate oggi:** canonical → dominio 404 (l'unica causa reale; il resto è già a posto). Se dopo la migrazione qualche pagina resta "Scansionata, non indicizzata", la causa più comune per un sito nuovo senza backlink è la scoperta/valutazione: risposta = contenuti + link dalle bio, non richieste ripetute.

---

## 5. Scansione strutturata dei dati (validazione)

- JSON-LD: parse valido su tutte le pagine (0 errori in `seo:check` e nel crawler). Tipi presenti: `Person`, `WebSite`, `ProfessionalService`, `FAQPage`, `BlogPosting`, `WebPage`, `BreadcrumbList`, `Question/Answer`, `ListItem`.
- Campi chiave presenti: `name`, `url`, `sameAs` (4 URL dopo le sostituzioni), `inLanguage: it-IT`, `areaServed`, `email`, `jobTitle`.
- Verifica manuale consigliata prima del deploy: [Rich Results Test](https://search.google.com/test/rich-results) su home, contatti e un articolo (i validator esterni non sono automatizzabili da qui).

---

## 6. Sintesi

| Area | ✅ | ⚠️ | ❌ |
|---|---|---|---|
| On-page (16 pagine) | 10 | 6 | 0 (H1/canonical contati a parte) |
| Technical | 17 | 1 | 2 (sitemap/robots sul dominio morto) |
| Scansionabilità Googlebot | 16/16 sul dominio attivo | — | 16/16 sulla sitemap (dominio morto) |
| Riparazione prioritaria | **C1 dominio** → poi H1, title/description | | |

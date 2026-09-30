# Audit completo — Ahsen Kurtoski (30 settembre 2026)

Kit di audit + report per il sito personale. Tutto verificato sul **sito realmente servito** (`axsenkurtoski.vercel.app`) e sul repo locale, con: build di produzione, TypeScript, ESLint, Lighthouse 13.5 (Chrome for Testing locale), crawler link, sweep responsive su 7 viewport, simulazione Googlebot per UA, MCP Vercel.

> **Modifiche al codice già applicate** (non ancora deployate): handle social → `AhsenKurtoski`, brand testuale → "Ahsen Studio", data `updated` aggiornata, 3 script di audit riutilizzabili, `.gitignore` per `.chrome/`.
>
> **Fix a11y/semantica già applicati** (non deployati): contrasto, aria-label del logo, HTML di /chi-sono, `<h1>` su tutte le pagine, input a 16 px, typing con `reduced-motion` — dettagli e verifiche in [fixes-applied.md](fixes-applied.md).

---

## 🔥 I tre numeri che contano

1. **Il dominio ufficiale `ahsenkurtoski.vercel.app` risponde 404.** Canonical, sitemap e robots puntano lì: il sito è "canonicalizzato verso il vuoto". Fix: rinomina del progetto Vercel `axsenkurtoski` → `ahsenkurtoski` (2 minuti, crea anche il redirect 308 dal vecchio dominio). Vedi [action plan, C1](action-plan.md).
2. **Home mobile: Lighthouse 71** (LCP 3,10 s, TBT 930 ms). Il resto è solido: CLS ~0, TTFB 66 ms, zero terze parti, zero errori JS. Cause e fix in [performance report](performance-report.md).
3. **A11y 81/100 su /chi-sono** per HTML non valido (li/dt/dd annidati male) e contraste 4,06:1 (`text-zinc-500`) su tutte le pagine. Fix facili e già scritti in [audit report](audit-report.md).

## ✅ Cosa è già in ordine

- 16/16 pagine con title, description, canonical, Open Graph, JSON-LD; sitemap con `lastmod` veritieri; feed RSS; manifest PWA; 404 reali; `http→https` 308.
- Zero errori JavaScript, zero richieste fallite, zero terze parti, nessuna risorsa mancante.
- Nessun overflow a 360/375/390/412/768/1024/1280 px; menu mobile, avviso cookie, torna-su, barra di lettura e form funzionanti.
- 17/17 link interni a 200; struttura identità (`Person` + `ProfessionalService` + `sameAs`) già orientata alla ricerca "Ahsen Kurtoski".

## 📁 File

| File | Contenuto |
|---|---|
| [audit-report.md](audit-report.md) | Report tecnico: tutti i bug con priorità, riproduzione, snippet esatto, impatto, difficoltà |
| [performance-report.md](performance-report.md) | Lighthouse (7 run), Core Web Vitals, throttling 3G/4G, cause del LAG + fix |
| [seo-checklist.md](seo-checklist.md) | Matrice on-page per le 16 URL, technical SEO, simulazione Googlebot, GSC |
| [action-plan.md](action-plan.md) | Piano prioritizzato: Critical / High / Medium / Quick win / Long-term |
| [fixes-applied.md](fixes-applied.md) | Fix a11y/semantica già applicati: prima → dopo e verifiche (Lighthouse a11y 100/100) |
| [roadmap-30-60-90.md](roadmap-30-60-90.md) | Roadmap trimestrale con KPI |
| [find-replace-log.csv](find-replace-log.csv) | Log "prima → dopo" delle sostituzioni Axsen→Ahsen/AhsenKurtoski (applicate e non) |
| [index.html](index.html) | Dashboard riassuntiva (apri nel browser) |
| `lighthouse/` | Report Lighthouse grezzi (HTML + JSON, 8 run) — **locali, non versionati**: si rigenerano con i comandi qui sotto |
| `screenshots/` | Screenshot responsive (10 scatti, inclusi quelli dopo i fix) |
| `raw/` | Dati grezzi: crawl link, responsive/console, dettagli Lighthouse, on-page, log installazione — **locali, non versionati** |

## 🔁 Come si riproduce

```bash
npm run build && npm run seo:check
npm run seo:live -- https://axsenkurtoski.vercel.app
npm run audit:links -- https://axsenkurtoski.vercel.app
npm run audit:responsive -- https://axsenkurtoski.vercel.app   # richiede Chrome in .chrome/
npx lighthouse https://axsenkurtoski.vercel.app/ --output=html,json --output-path=audit/lighthouse/home-mobile --quiet
node scripts/audit-lh-summary.mjs
```

## 🤖 Verifiche automatiche (GitHub Actions)

`.github/workflows/verifiche.yml` parte **a ogni push** e blocca il run se qualcosa peggiora:
`npm ci` → `tsc --noEmit` → `eslint` → `build` → `seo:check` → `audit:links` sul sito appena costruito
(`next start` su `127.0.0.1:3000`, con `NEXT_PUBLIC_SITE_URL` puntato lì così canonical, sitemap e link assoluti
sono coerenti con l'indirizzo visitato). Report del run allegato come artefatto `audit-link`.

L'audit link gira con `--fail-on=internal`: bloccano i problemi che questo repo può correggere (link interni rotti,
sitemap/robots incoerenti, canonical sbagliato, 404), mentre i link verso siti di terze parti restano nel log e
nell'artefatto senza far fallire la verifica — rispondono 403/999 ai bot e non dipendono dal codice.
Per una verifica più severa anche sugli esterni: `--fail-on=all` (default) o `--fail-on=external`.

Report locale della stessa verifica: `audit/raw/ci-locale/`.

## 🚦 Stato immediato (dopo il fix del dominio)

1. Rinomina il progetto Vercel (C1) → 2. rinomina gli account social (H1) → 3. commit + push → 4. verifica con gli script qui sopra → 5. Search Console (M4).

Nessun commit, push o deploy è stato eseguito da questo audit: le modifiche sono nel working tree, pronte per te.

# Audit completo — Ahsen Kurtoski (30 settembre 2026)

Kit di audit + report per il sito personale. Verificato sul **sito realmente servito** (all'epoca `axsenkurtoski.vercel.app`, che oggi fa 307 verso il dominio ufficiale) e sul repo locale, con: build di produzione, TypeScript, ESLint, Lighthouse 13.5 (Chrome for Testing locale), crawler link, sweep responsive su 7 viewport, simulazione Googlebot per UA, MCP Vercel.

> **Stato al 30/09/2026: tutto applicato, committato e deployato** (commit `c3bc58c` su `main`): handle social → `AhsenKurtoski`, brand → "Ahsen Studio", link del sito dello studio aggiornato, fix a11y/semantica, kit di audit riutilizzabile e GitHub Action di verifica.
>
> Le misure "prima" di questo report restano quelle dell'audit e sono **etichettate come tali**: i numeri "dopo" sono misurati sul sito live dopo il deploy. Prima → dopo in [fixes-applied.md](fixes-applied.md).

---

## 🔥 I tre numeri che contano

1. **Il dominio ufficiale ora risponde 200** ✅ (durante l'audit era 404, con canonical e sitemap "canonicalizzati verso il vuoto"). Il progetto Vercel è stato rinominato `axsenkurtoski` → `ahsenkurtoski` e il vecchio dominio fa **307** verso il nuovo. Vedi [action plan, C1](action-plan.md).
2. **Home mobile: Lighthouse 86** (LCP 2,61 s, TBT 421 ms) misurato sul sito live dopo i fix; durante l'audit era **71** (LCP 3,10 s, TBT 930 ms). Blog e contatti passano da 72/84 a **97**. Il resto è solido: CLS 0, TTFB 70–88 ms, zero terze parti, zero errori JS. Cause e fix in [performance report](performance-report.md).
3. **Accessibilità 100/100** su home, /chi-sono, /blog, /contatti e pagine tag (misurata sul live; durante l'audit /chi-sono era **81**): contrasto, HTML di /chi-sono, `<h1>` su tutte le pagine, etichetta del logo e form sistemati. Prima → dopo in [fixes-applied.md](fixes-applied.md).

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

Il crawler verifica anche che ogni pagina abbia **un solo `<h1>`** e nessun salto nella gerarchia dei titoli, oltre a canonical, meta robots, JSON-LD e 404 reali.

L'audit link gira con `--fail-on=internal`: bloccano i problemi che questo repo può correggere (link interni rotti,
sitemap/robots incoerenti, canonical sbagliato, 404), mentre i link verso siti di terze parti restano nel log e
nell'artefatto senza far fallire la verifica — rispondono 403/999 ai bot e non dipendono dal codice.
Per una verifica più severa anche sugli esterni: `--fail-on=all` (default) o `--fail-on=external`.

Report locale della stessa verifica: `audit/raw/ci-locale/`.

## 🚦 Stato immediato (dopo il fix del dominio)

1. Rinomina il progetto Vercel (C1) → 2. rinomina gli account social (H1) → 3. commit + push → 4. verifica con gli script qui sopra → 5. Search Console (M4).

Tutto questo è nel commit `c3bc58c` su `main`, deployato e verificato sul dominio ufficiale (audit link a 0 problemi, Lighthouse a11y 100/100). La verifica automatica in [`.github/workflows/verifiche.yml`](../.github/workflows/verifiche.yml) ripete build, typecheck, lint, `seo:check` e audit link a ogni push.

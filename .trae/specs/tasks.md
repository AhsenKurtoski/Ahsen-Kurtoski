# Tasks: Deploy + SEO + Verifica completa

> Origine: [spec.md](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/.trae/specs/spec.md)
> Copertura AC: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7

---

## Task 1: Configura next.config.ts con SEO e sicurezza base

- **Priorità**: high
- **Dipendenze**: nessuna
- **AC coperti**: AC-1, AC-2, NF-3, F-18
- **Cosa fare**:
  1. Aprire [next.config.ts](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/next.config.ts).
  2. Aggiungere:
     - `trailingSlash: false` (mantiene URL puliti, senza slash finale duplicato).
     - `compress: true`.
     - Blocco `headers()` con security headers base:
       - `X-Frame-Options: DENY`
       - `X-Content-Type-Options: nosniff`
       - `Referrer-Policy: strict-origin-when-cross-origin`
       - `Permissions-Policy` restrittivo ma non bloccante (nessuna camera/microfono/geolocazione).
     - Opzionalmente: `poweredByHeader: false`.
  3. Verificare che la sintassi sia compatibile con Next.js 16 (`async headers()`, return array con `source` e `headers`).

### Test Requirements (TR)

- **TR-1.1 (rule)** — `next.config.ts` esporta una funzione `headers` valida, non ha errori di sintassi.
  - Evidenza: `next build` non fallisce con errore di parsing della config.
- **TR-1.2 (rule)** — Build dopo la modifica non introduce regressioni (vedi Task 3).

---

## Task 2: Pulisci placeholder critici e aggiungi env CONTACT_EMAIL

- **Priorità**: high
- **Dipendenze**: nessuna
- **AC coperti**: AC-3, NF-4, F-17
- **Cosa fare**:
  1. Modificare [src/lib/site.ts](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/lib/site.ts) in modo che:
     - `email: process.env.CONTACT_EMAIL ?? "ahsen@example.com"`.
  2. Aggiornare [.env.example](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/.env.example) aggiungendo:
     - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
     - `CONTACT_EMAIL=tuoindirizzo@esempio.com`
     - `RESEND_API_KEY=` (vuoto, opzionale)
     - `CONTACT_FROM=` (vuoto, opzionale)
  3. Verificare che l'email `ahsen@example.com` rimanga solo come default e che il `mailto:` usi sempre `site.email` (già vero in layout, pagina home, contatti).
  4. Aggiungere un piccolo avviso nella pagina contatti se l'email è ancora il fallback `@example.com`: qualcosa tipo "⚠️ Configura `CONTACT_EMAIL` per ricevere i messaggi a un indirizzo reale." solo se la mail contiene `example.com`.

### Test Requirements (TR)

- **TR-2.1 (rule)** — `.env.example` contiene `NEXT_PUBLIC_SITE_URL`, `CONTACT_EMAIL`, `RESEND_API_KEY`, `CONTACT_FROM`.
- **TR-2.2 (rule)** — `lib/site.ts` legge `CONTACT_EMAIL` da env con fallback sicuro.
- **TR-2.3 (rule)** — Se email == fallback, la pagina contatti mostra l'avviso di configurazione.

---

## Task 3: Esegui lint, type-check e build di produzione

- **Priorità**: high
- **Dipendenze**: Task 1, Task 2 (devono essere completati o almeno non conflittuali)
- **AC coperti**: AC-1, F-1, F-2, F-3
- **Cosa fare**:
  1. Installare dipendenze se `node_modules` manca o è incompleto: `npm install`.
  2. Eseguire:
     - `npx tsc --noEmit` — type check TypeScript.
     - `npm run lint` (`next lint`) — ESLint.
     - `npm run build` (`next build`) — build di produzione.
  3. Se ci sono errori:
     - Errori TS/JS: correggere nei file sorgenti.
     - Warning ESLint non bloccanti: lasciare solo se a livello "warn"; se "error" correggere.
  4. Ripetere finché tutti e 3 i comandi passano con exit code 0.

### Test Requirements (TR)

- **TR-3.1 (rule)** — `npx tsc --noEmit` esce con 0.
- **TR-3.2 (rule)** — `npm run lint` esce con 0.
- **TR-3.3 (rule)** — `npm run build` esce con 0 e produce `.next/standalone` o cartella build completa.
- **TR-3.4 (rubric, 0-2, soglia ≥ 2)** — Pulizia output comandi.
  - `2 = zero warning`
  - `1 = solo warning non bloccanti`
  - `0 = errori`

---

## Task 4: Verifica sistematica SEO tecnico

- **Priorità**: medium
- **Dipendenze**: Task 1, Task 2, Task 3
- **AC coperti**: AC-2, AC-6, F-5, F-6, F-7, F-8, F-9, F-10, F-11, F-12
- **Cosa fare**:
  1. Avviare il dev server (`npm run dev`) oppure ispezionare staticamente i file:
     - Verificare [robots.ts](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/robots.ts) → contiene `Allow: /` e `Sitemap: <site.url>/sitemap.xml`.
     - Verificare [sitemap.ts](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/sitemap.ts) → include statiche + post + tag, URL assoluti con `${site.url}`.
     - Verificare in [layout.tsx](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/layout.tsx):
       - `metadataBase: new URL(site.url)`.
       - `alternates.canonical`, `openGraph`, `twitter`, `robots.index/follow` presenti.
       - `<html lang="it">`.
       - JSON-LD `Person` + `WebSite` iniettati.
     - Verificare in ogni pagina ([chi-sono](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/chi-sono/page.tsx), [blog](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/blog/page.tsx), [contatti](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/contatti/page.tsx), [slug articolo](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/blog/%5Bslug%5D/page.tsx), [tag](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/blog/tag/%5Btag%5D/page.tsx)):
       - `metadata.title` + `description` + `canonical` + `openGraph` presenti.
       - `BlogPosting` JSON-LD negli articoli.
       - `FAQPage` JSON-LD in contatti.
     - Verificare [opengraph-image.tsx](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/opengraph-image.tsx) e [blog/[slug]/opengraph-image.tsx](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/blog/%5Bslug%5D/opengraph-image.tsx) esistono e usano `site.url`/`site.initials`.
     - Verificare [feed.xml/route.ts](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/feed.xml/route.ts) produce XML valido.
     - Verificare [manifest.ts](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/manifest.ts) ha `start_url`, icone, lingua.
  2. Se manca qualcosa:
     - Aggiungere metadata mancanti (es. canonical se assente).
     - Assicurarsi che tutti gli URL in `openGraph.url`, `twitter`, JSON-LD siano assoluti.

### Test Requirements (TR)

- **TR-4.1 (rule)** — `robots.ts` contiene almeno 1 regola `Allow: /` e link a sitemap.
- **TR-4.2 (rule)** — `sitemap.ts` restituisce almeno 4 URL statiche + n° articoli + n° tag.
- **TR-4.3 (rule)** — Tutte le 5 pagine pubbliche (home, chi-sono, blog, contatti, articolo) hanno:
  - title non vuoto
  - description non vuoto
  - canonical
  - openGraph.type + openGraph.url
- **TR-4.4 (rule)** — JSON-LD totali:
  - 1 Person + 1 WebSite nel layout
  - 1 FAQPage nella pagina contatti
  - 1 BlogPosting per ogni articolo
- **TR-4.5 (rule)** — Feed.xml e manifest.ts esportano funzione valida e non contengono path hardcoded assoluti.
- **TR-4.6 (rule)** — `<html lang="it")` in root layout.

---

## Task 5: Verifica funzionalità end-to-end (form + API + 404 + navigazione)

- **Priorità**: medium
- **Dipendenze**: Task 3
- **AC coperti**: AC-5, F-13, F-14, F-15, F-16
- **Cosa fare**:
  1. Avviare dev o build+start locale.
  2. Verificare:
     - `/not-found` o URL inesistente → 404 con pagina custom [not-found.tsx](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/app/not-found.tsx).
     - Link da home → chi-sono, blog, contatti: status 200.
     - Da pagina blog → clic su un articolo → 200.
     - Da pagina blog → clic su un tag → 200.
  3. Testare l'API:
     - `POST /api/contatti` → body `{}` → deve rispondere 400 con `ok:false`.
     - `POST /api/contatti` → body `{name:"Test", email:"a@b.com", message:"Ciao questo è un messaggio di test lungo abbastanza"}` → deve rispondere 200 (honeypot vuoto) oppure 503 se non c'è RESEND_API_KEY; comunque mai 500.
     - `POST /api/contatti` → `{website: "bot"}` → deve rispondere 200 ok:true (honeypot).

### Test Requirements (TR)

- **TR-5.1 (rule)** — 4 URL principali + 1 articolo + 1 tag restituiscono 200.
- **TR-5.2 (rule)** — URL inesistente restituisce 404.
- **TR-5.3 (rule)** — POST /api/contatti con dati vuoti → 400 ok:false.
- **TR-5.4 (rule)** — POST /api/contatti con dati validi → status in {200, 503, 429}, ma MAI 500.
- **TR-5.5 (rule)** — POST /api/contatti con honeypot compilato → 200 ok:true.

---

## Task 6: Deploy del progetto su Vercel (gratuito)

- **Priorità**: high
- **Dipendenze**: Task 1, 2, 3, 4, 5 (tutti green)
- **AC coperti**: AC-4, NF-1, F-4
- **Cosa fare**:
  1. Usare lo strumento `deploy_to_remote` con target `vercel`.
  2. Durante il deploy, impostare:
     - Variabile d'ambiente `NEXT_PUBLIC_SITE_URL` = URL pubblico finale fornito da Vercel.
     - (Opzionale) Settare `CONTACT_EMAIL` se l'utente l'ha fornita.
  3. Salvare l'URL pubblico generato (es. `https://ahsen-kurtoski-xxxx.vercel.app`) come evidenza.
  4. Dopo il deploy, aggiornare nel codice il fallback di `site.url` in [lib/site.ts](file:///c:/Users/anelk/Desktop/Antigravity/ahsen-kurtoski/src/lib/site.ts) con l'URL effettivo appena deployato, così se `NEXT_PUBLIC_SITE_URL` non è settato in locale rimane quello di produzione corretto (non `ahsenkurtoski.com` inesistente).

### Test Requirements (TR)

- **TR-6.1 (rule)** — Deploy terminato con successo, URL pubblico disponibile (https).
- **TR-6.2 (rule)** — `site.url` default in `lib/site.ts` aggiornato all'URL Vercel reale.
- **TR-6.3 (rule)** — `NEXT_PUBLIC_SITE_URL` impostata come env sul progetto Vercel (se visibile).

---

## Task 7: Verifica post-deploy (stabilità e raggiungibilità)

- **Priorità**: high
- **Dipendenze**: Task 6
- **AC coperti**: AC-4, AC-7, NF-2
- **Cosa fare**:
  1. Per ognuno dei seguenti path, fare una richiesta GET all'URL deployato e controllare status code e Content-Type atteso:
     - `/` → 200 text/html
     - `/chi-sono` → 200 text/html
     - `/blog` → 200 text/html
     - `/contatti` → 200 text/html
     - `/blog/<slug-esistente>` → 200 text/html
     - `/blog/tag/<tag-esistente>` → 200 text/html
     - `/robots.txt` → 200 text/plain
     - `/sitemap.xml` → 200 application/xml (o text/xml)
     - `/feed.xml` → 200 application/xml
     - `/manifest.webmanifest` → 200 application/manifest+json
     - `/opengraph-image` → 200 image/png
     - `/pagina-inesistente-12345` → 404
  2. Aprire la home nel browser (tramite snapshot se disponibile) e verificare:
     - Nessun errore critico in console.
     - Link cliccabili e immagini/icone caricate.
  3. Testare anche l'API `/api/contatti` su deployato con una POST minimale: deve rispondere 400 o 503, non 500.

### Test Requirements (TR)

- **TR-7.1 (rule)** — Tutti gli 11 endpoint elencati sopra hanno status corretto.
- **TR-7.2 (rule)** — `/api/contatti` POST su deployato: status in {400, 503, 429, 200}, mai 500.
- **TR-7.3 (rubric, 0-5, soglia ≥ 4)** — Stabilità generale (tempi + errori console).
  - `5 = tutto < 800ms, zero errori`
  - `4 = tutto < 1.5s, zero errori`
  - `3 = qualche warning, tutto funziona`
  - `2 = lento ma funzionante`
  - `1 = errori JS bloccanti`

---

## Task 8: Produci guida per indicizzazione Google (Search Console)

- **Priorità**: medium
- **Dipendenze**: Task 6, Task 7
- **AC coperti**: AC-6, AC-7 (completano la parte SEO non automatizzabile)
- **Cosa fare**:
  1. Creare un file `GUIDA-SEO.md` nella root (non pushare a meno che l'utente non voglia) o in `.trae/specs/` con:
     - Introduzione: "L'indicizzazione richiede da ore a giorni. Esegui questi passaggi dal tuo account Google."
     - Passo 1: Vai a https://search.google.com/search-console → Aggiungi proprietà → "Prefisso URL" → incolla URL Vercel.
     - Passo 2: Verifica proprietà tramite file HTML (caricare in `public/google<codice>.html`) o tramite meta tag in layout.tsx.
     - Passo 3: Invia `/sitemap.xml` tramite menu "Sitemap".
     - Passo 4: Richiedi indicizzazione della home in "Controllo URL".
     - Passo 5: Bing Webmaster Tools (opzionale, stesso flusso).
     - Passo 6: Schema.org validator: incolla i JSON-LD dalle pagine su https://validator.schema.org per conferma.
     - Passo 7: PageSpeed Insights: https://pagespeed.web.dev per valutare performance.
  2. Riferire all'utente che questi passaggi devono essere eseguiti manualmente.

### Test Requirements (TR)

- **TR-8.1 (rule)** — File guida creato con passaggi concreti e URL.
- **TR-8.2 (rule)** — Guida menziona sia invio sitemap sia verifica proprietà.

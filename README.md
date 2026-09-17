# Axsen Kurtoski — Sito personale

Sito personale ufficiale di **Axsen Kurtoski**: chi sono, competenze, progetti e blog.
Costruito con Next.js + Tailwind CSS, ottimizzato per farsi trovare su Google
(SEO completa, dati strutturati, sitemap, Open Graph).

## 🚀 Avviare il sito

```bash
npm install     # solo la prima volta
npm run dev       # sviluppo → http://localhost:3000
npm run build     # build di produzione
npm start         # avvia la build di produzione
npm run seo:check # controlla che ogni pagina abbia i dati che Google legge
npm run seo:live   # controlla il sito PUBBLICATO (indicizzabilità reale)
npm run indexnow   # segnala gli URL a Bing/DuckDuckGo/Yandex
npm run email:test # prova l'invio del form di contatto
npm run icons     # rigenera favicon e icone PNG
```

Prima di tutto: **[PREREQUISITI.md](PREREQUISITI.md)** — cosa serve davvero per essere
trovato su Google, in che ordine, con quali tempi realistici e quali pratiche sono
inutili (spoiler: il "ping" della sitemap è morto dal 2023 e Google ignora IndexNow).

### Controllo SEO automatico

Dopo `npm run build`, lancia `npm run seo:check`: esamina le pagine generate e dice,
per ognuna, se mancano title, description, canonical, Open Graph, immagine social
o dati strutturati. Segnala anche i contenuti ancora segnaposto e gli URL non
presenti nella sitemap. Se trova un errore blocca il comando (esce con codice 1),
quindi puoi usarlo anche in una pipeline di deploy.

## ✏️ Cosa personalizzare (in ordine)

### 1. I tuoi dati → `src/lib/site.ts`

Qui c'è tutto quello che riguarda te:

- `name`, `firstName`, `initials` — nome e monogramma
- `roles` — i ruoli che appaiono con l'effetto typing nella home
- `shortBio` / `longBio` — biografia breve e completa
- `email` — **⚠️ sostituisci `axsen@example.com` con la tua email vera**
- `location`, `availability`
- `socials` — GitHub, LinkedIn, Instagram, X, YouTube (lascia `""` per nascondere un'icona)
- `skills` — competenze e percentuali
- `timeline` — le tappe del tuo percorso
- `url` — il dominio del sito (vedi "Pubblicare online")

### 2. Progetti e servizi → `src/app/page.tsx`

In cima al file trovi gli array `projects` (progetti in evidenza) e `services`
(cosa sai fare). Modifica titoli, descrizioni, tag e link.

### 3. Articoli del blog → `src/content/posts/*.md`

Ogni articolo è un file markdown. Per pubblicarne uno nuovo, crea
`src/content/posts/titolo-articolo.md`:

```md
---
title: Il titolo dell'articolo
excerpt: Una frase di riassunto che appare nelle card e su Google.
date: 2026-10-01
tags: Web, Tutorial
---

Qui scrivi il testo in **markdown**: paragrafi, liste, link, titoli con `##`,
citazioni con `>` e blocchi di codice con tre backtick.
```

Il file viene indicizzato automaticamente in `/blog`, nella home, nella sitemap
e nell'articolo correlato. Per modificare un articolo esistente è sufficiente
aprire il suo file.

### 4. Immagine social (Open Graph)

Le immagini che appaiono condividendo il sito su WhatsApp/Instagram/LinkedIn sono
generate automaticamente, 1200×630, una per pagina:

- home → `src/app/opengraph-image.tsx`
- ogni articolo → `src/app/blog/[slug]/opengraph-image.tsx` (con il titolo dell'articolo)
- chi-sono, contatti, blog e archivi tag → `src/app/og/route.tsx`, richiamato
dall'helper `ogImage()` di `src/lib/seo.ts`

Il disegno è unico e sta in `src/lib/og-template.tsx`: cambia qui colori o testo
per aggiornare tutte le immagini in una volta. Se preferisci una tua foto,
caricala in `public/` e indicala nelle `metadata` di `src/app/layout.tsx`.

Le icone del sito sono in `public/` (`icon.svg`, `favicon.ico`, `icon-192.png`,
`icon-512.png`, `apple-touch-icon.png`) e mostrano il monogramma AK con gradiente.
Per rigenerarle dopo aver cambiato colori o iniziali:

```bash
node scripts/generate-icons.mjs
```

## 🔍 SEO: cosa è già pronto

Il sito è già ottimizzato per la query **"Axsen Kurtoski"**:

| Cosa | Dove |
| --- | --- |
| Titoli e descrizioni unici per ogni pagina | `metadata` in ogni `page.tsx` |
| Dati strutturati `Person` (chi è Axsen Kurtoski) | `src/app/layout.tsx` |
| Dati strutturati `BlogPosting` per gli articoli | `src/app/blog/[slug]/page.tsx` |
| Sitemap XML (pagine, articoli e archivi tag) | `src/app/sitemap.ts` → `/sitemap.xml` |
| Feed RSS del blog | `src/app/feed.xml/route.ts` → `/feed.xml` |
| Archivi per tag (`/blog/tag/...`) | `src/app/blog/tag/[tag]/page.tsx` |
| Breadcrumb con dati strutturati `BreadcrumbList` | `src/components/breadcrumbs.tsx` |
| FAQ con dati strutturati `FAQPage` | `src/app/contatti/page.tsx` |
| robots.txt | `src/app/robots.ts` → `/robots.txt` |
| Open Graph + Twitter Card su ogni pagina | `metadata` delle pagine + `src/lib/seo.ts` |
| Immagine social 1200×630 dedicata a ogni pagina | `opengraph-image.tsx` + `src/app/og/route.tsx` |
| Manifest installabile su mobile | `src/app/manifest.ts` |
| HTML statico, veloce e mobile-first | build con prerendering |

## 📬 Far funzionare il form di contatto

Il form invia i messaggi tramite [FormSubmit](https://formsubmit.co): **nessun account,
nessuna API key, nessun costo**. La chiamata parte dal server del sito, quindi il tuo
indirizzo email non compare mai nell'HTML e i bot che leggono la pagina non lo trovano.

### 1. Imposta l'indirizzo che riceve i messaggi

| Dove | Come |
| --- | --- |
| In locale | crea il file `.env.local` con la riga qui sotto |
| Su Vercel | **Settings → Environment Variables**, poi **Redeploy** |

```bash
CONTACT_EMAIL=cshop0784@gmail.com
```

Lo stesso indirizzo è anche quello mostrato nella pagina Contatti e nel footer: quello
che scrivi qui è quello che i visitatori vedono.

### 2. Attiva l'indirizzo (una volta sola)

Alla **prima** richiesta FormSubmit manda un'email di conferma all'indirizzo indicato:
aprila e clicca il link di attivazione. Finché non lo fai, i messaggi non vengono
recapitati. È una protezione loro contro l'uso dell'indirizzo da parte di terzi.

### 3. Prova che funzioni

```bash
npm run email:test                     # invia a CONTACT_EMAIL
npm run email:test -- altra@email.com   # oppure a un indirizzo preciso
```

Il comando invia un messaggio di prova con la stessa configurazione del form e ti dice
in chiaro se serve ancora l'attivazione, mostrando la risposta di FormSubmit così com'è.

Senza account configurato il form non si rompe: mostra un avviso chiaro e propone
il link `mailto:` come alternativa. L'endpoint è in `src/app/api/contatti/route.ts`
e include validazione dei campi, limite di 5 invii ogni 10 minuti per IP e un campo
nascosto anti-spam.

## 🌐 Pubblicare online

### Deploy su Vercel (consigliato, gratuito)

1. Crea un account su [vercel.com](https://vercel.com) e importa il repository.
2. Vercel riconosce Next.js automaticamente: premi **Deploy**.
3. Vai in **Settings → Environment Variables** e aggiungi:
   - `NEXT_PUBLIC_SITE_URL` = `https://axsenkurtoski.vercel.app`
4. In **Settings → Domains** puoi collegare in un secondo momento un dominio
   personale (es. `axsenkurtoski.com`): quando lo fai, aggiorna anche
   `NEXT_PUBLIC_SITE_URL` e rifai il deploy.

> L'indirizzo ufficiale è **https://axsenkurtoski.vercel.app** ed è già il valore
> predefinito nel codice: la variabile d'ambiente serve solo se cambi dominio.

### Farsi indicizzare da Google (importante!)

> Versione completa con tutti i prerequisiti, i tempi e le verifiche: **[PREREQUISITI.md](PREREQUISITI.md)**.

1. Apri [Google Search Console](https://search.google.com/search-console) e
   aggiungi la proprietà scegliendo **Prefisso URL** con
   `https://axsenkurtoski.vercel.app`. La scheda *Dominio* non è utilizzabile:
   richiede un record DNS TXT e tu non controlli il DNS di `vercel.app`.
2. Verifica la proprietà con uno dei due metodi già predisposti:
   - **File HTML** (quello in uso): il file di Google è già in
     `public/google2783a9147b2337cb.html`, quindi viene servito su
     `https://axsenkurtoski.vercel.app/google2783a9147b2337cb.html`.
     **Non cancellarlo**: Search Console ricontrolla il token e la verifica
     decade se il file sparisce. Per cambiarlo, metti il nuovo file in `public/`.
   - **Tag HTML**: incolla il codice di Google nella variabile d'ambiente
     `NEXT_PUBLIC_GOOGLE_VERIFICATION` (in locale in `.env.local`, in produzione
     su Vercel) e rifai il deploy.

   ⚠️ Non riattivare `"cleanUrls": true` in `vercel.json`: Vercel
   reindirizzerebbe con 308 ogni URL `.html` alla versione senza estensione, e il
   file di verifica non risponderebbe più 200 all'indirizzo richiesto da Google.
3. Nella sezione **Sitemap** invia: `https://axsenkurtoski.vercel.app/sitemap.xml`.
4. Usa **Controlla URL** sulla home e sui tuoi profili per richiedere l'indicizzazione.
5. Aggiungi il link al sito su **tutti i tuoi profili** (GitHub, Instagram,
   LinkedIn, X, bio): i link in entrata accelerano e rafforzano l'indicizzazione.
6. Usa lo stesso nome e la stessa foto ovunque: Google collega le identità più
   facilmente.
7. Porta pazienza: i primi risultati per il tuo nome compaiono di solito entro
   qualche giorno, a volte qualche settimana.

Consiglio: puoi controllare lo stato dei dati strutturati con
[Rich Results Test](https://search.google.com/test/rich-results).

## 🗂 Struttura del progetto

```
src/
├─ app/
│  ├─ layout.tsx            # layout, SEO globale, dati strutturati Person
│  ├─ page.tsx              # homepage
│  ├─ chi-sono/page.tsx     # biografia, timeline, competenze
│  ├─ blog/page.tsx         # indice articoli
│  ├─ blog/[slug]/page.tsx  # singolo articolo + BlogPosting
│  ├─ contatti/page.tsx     # contatti + form + FAQ
│  ├─ api/contatti/route.ts # invio messaggi del form (FormSubmit)
│  ├─ og/route.tsx          # immagine social generata per le pagine interne
│  ├─ sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg
│  └─ globals.css           # tema e utility CSS
├─ components/              # header, footer, card, icone, animazioni
├─ content/posts/*.md       # articoli del blog (markdown)
├─ lib/
│  ├─ site.ts               # ⚙️ i tuoi dati (nome, bio, social, skill...)
│  ├─ posts.ts              # loader markdown → HTML
│  ├─ seo.ts                # helper per Open Graph e immagini social
│  └─ og-template.tsx       # disegno condiviso delle immagini 1200×630
└─ ../scripts/
   ├─ seo-check.mjs         # verifica SEO dell'output buildato
   └─ generate-icons.mjs    # favicon e icone PNG senza dipendenze
```

## 🎨 Design

- Tema scuro moderno con accento gradiente viola → azzurro
- Barra di avanzamento lettura sugli articoli e pulsante "torna su"
- Animazioni leggere allo scroll (rispettano `prefers-reduced-motion`)
- Layout responsive mobile-first, navigazione con menu hamburger
- Accessibilità: skip link, focus visibile, testi alternativi, contrasto curato

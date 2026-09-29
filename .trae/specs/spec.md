# Spec: Deploy + SEO + Verifica completa sito Ahsen Kurtoski

## Problema

Il progetto **ahsen-kurtoski** (portfolio + blog personale Next.js) esiste già con una struttura di base (pagine, metadata, JSON-LD, sitemap, robots), ma:

1. Non sono stati eseguiti controlli automatizzati (lint, build, TypeScript) per garantire l'assenza di errori.
2. Le configurazioni SEO, sebbene presenti, non sono state verificate in modo sistematico rispetto alle best practice di Google.
3. Il sito non è pubblicato online, quindi nessun utente può cercare "Ahsen Kurtoski" su Google e trovare i contenuti.
4. Non c'è una strategia esplicita di deploy con servizi e dominio **gratuiti**, senza costi per l'utente.
5. Le informazioni personali (email, social, dati di contatto) contengono placeholder (`@example.com`, URL social di esempio) che devono essere revisionati prima della pubblicazione.
6. Non è stata verificata la raggiungibilità e la stabilità del sito dopo il deploy, così come l'indicizzazione Google.

## Utenti

- **Ricercatori**: persone che cercano "Ahsen Kurtoski" o parole chiave correlate su Google.
- **Visitatori**: persone che atterrano sul sito tramite link diretto o risultati di ricerca.
- **Collaboratori**: persone che vogliono contattare Ahsen tramite email o form.

## Obiettivi

1. Pubblicare il sito **immediatamente online** usando servizi e dominio completamente gratuiti (Vercel + dominio .vercel.app).
2. Assicurarsi che tutte le informazioni pubbliche su Ahsen Kurtoski siano accessibili, corrette e non contengano placeholder.
3. Ottimizzare e verificare ogni aspetto SEO (metadata, canonical, robots, sitemap, dati strutturati JSON-LD, OpenGraph, Twitter, velocità) per massimizzare l'indicizzazione Google.
4. Eseguire controlli di qualità (TypeScript, ESLint, build di produzione) per garantire l'assenza di errori a runtime.
5. Verificare che tutte le funzionalità del sito (navigazione, blog, form contatti con fallback mailto, ricerca per tag, dati strutturati) operino correttamente in produzione.
6. Garantire la stabilità del sito e fornire URL pubblici, dimostrando l'accessibilità post-deploy.

## Non-obiettivi

- Acquistare un dominio a pagamento o utilizzare servizi a costo.
- Configurare Google Search Console lato account utente (operazione manuale che richiede accesso Google dell'utente; verrà invece fornita la guida).
- Aggiungere nuovi contenuti arbitrari non presenti nel repository.
- Sostituire la libreria di analisi markdown (non sono installate librerie esterne; il parser interno è sufficiente).

## Requisiti funzionali

| ID | Descrizione |
|---|---|
| F-1 | Build di produzione (`next build`) deve completarsi senza errori. |
| F-2 | TypeScript type-check (`tsc --noEmit`) deve passare senza errori. |
| F-3 | ESLint (`next lint`) deve passare senza errori o warning bloccanti. |
| F-4 | Sito deployato online con dominio gratuito (es. `*.vercel.app`) raggiungibile via HTTPS. |
| F-5 | `/robots.txt` accessibile e permette l'indicizzazione, puntando alla sitemap. |
| F-6 | `/sitemap.xml` accessibile, contiene tutte le rotte statiche + blog + tag, con URL assoluti corretti. |
| F-7 | `NEXT_PUBLIC_SITE_URL` impostato correttamente al dominio di deploy in modo che canonical, sitemap, OpenGraph e JSON-LD siano coerenti. |
| F-8 | Ogni pagina pubblica ha metadata title, description, keywords e canonical tag coerenti. |
| F-9 | JSON-LD di `Person`, `WebSite`, `BlogPosting`, `FAQPage` presenti e validi. |
| F-10 | Immagini OpenGraph generabili (root e per ogni articolo) con URL assoluti corretti. |
| F-11 | Feed RSS `/feed.xml` raggiungibile e valido. |
| F-12 | PWA manifest `/manifest.webmanifest` presente con URL coerenti. |
| F-13 | Pagina 404 personalizzata attiva. |
| F-14 | Form contatti funzionale: in assenza di API key mostra fallback chiaro con mailto. |
| F-15 | API `/api/contatti` non deve crashare; deve validare input, rispettare rate limit e rispondere con JSON coerente. |
| F-16 | Tutti i link interni funzionano (Home, Chi sono, Blog, Contatti, articoli, tag). |
| F-17 | Nomi e email di esempio (`@example.com`, `ahsen@example.com`) sostituiti o segnalati come variabili ambiente `CONTACT_EMAIL`. |
| F-18 | File `next.config.ts` configurato almeno con `trailingSlash`, `compress`, eventuali headers di sicurezza base. |

## Requisiti non funzionali

| ID | Descrizione |
|---|---|
| NF-1 | Deploy eseguito con strumento ufficiale Vercel/Next.js senza costi. |
| NF-2 | Tempo di risposta del sito in produzione accettabile (primo byte < 1s). |
| NF-3 | Tutti gli asset statici (CSS, JS, font) ottimizzati da Next.js in produzione. |
| NF-4 | Dati sensibili (email personali reali) se presenti sono conservati come env var, non hardcoded. |
| NF-5 | Architettura rimane Next.js App Router (nessun passaggio a Pages Router). |
| NF-6 | Lingua del sito e dei metadata resta italiano (`it-IT`). |
| NF-7 | Nessun breaking change alle rotte esistenti. |

## Vincoli

- **Costo zero**: nessun acquisto di dominio, piano a pagamento o servizio a sottoscrizione.
- **Dominio fornito dalla piattaforma**: l'URL pubblico iniziale sarà quello generato automaticamente da Vercel (es. `ahsen-kurtoski-USER.vercel.app`). È possibile aggiornare successivamente il `site.url` verso un altro dominio libero (es. Netlify, Cloudflare Pages) ma Vercel è la scelta consigliata poiché Next.js è sviluppato da Vercel e garantisce massimo supporto.
- **Nessun commit esterno**: ogni modifica rimane locale nel repository finché l'utente non decide di pushare.
- **SEO "white hat"**: tutte le ottimizzazioni SEO devono rispettare le linee guida Google (nessuna keyword stuffing, nessun doorway, ecc.).
- **Accesso account**: l'utente dovrà autenticarsi a Vercel nel proprio browser quando richiesto dallo strumento di deploy, poiché l'agente non ha accesso ai suoi account.

## Dipendenze

- `next@16.3.5` già installato
- `react@19.2.8`, `react-dom@19.2.8` già installati
- `tailwindcss@4` già configurato
- Node.js compatibile con Next.js 16 (ambiente di sviluppo già presente, come dimostrato dalla cartella `.next`)
- `deploy_to_remote` integrato nel toolchain per pubblicare su Vercel

## Assunzioni

1. L'utente possiede (o è disposto a creare) un account gratuito Vercel per completare l'autenticazione nel browser durante il deploy.
2. Se l'utente non comunica un'email reale, il sito pubblicherà l'email placeholder con avviso chiaro che occorre sostituirla tramite env `CONTACT_EMAIL`.
3. I social in `site.ts` sono placeholder; non li modifichiamo senza input utente esplicito (non sono invalidanti per l'indicizzazione).
4. Google Search Console, Bing Webmaster Tools e la presentazione manuale della sitemap non possono essere automatizzati dall'agente in quanto richiedono accesso all'account Google dell'utente; verrà prodotto un documento guida con URL e passaggi.
5. L'indicizzazione Google non avviene istantaneamente (di solito da ore a giorni); la spec garantisce la *correttezza dei segnali* e la *presentabilità per l'indicizzazione*, non l'immediata comparsa tra i risultati.

## Domande aperte

| Q | Domanda | Impatto se non risolta |
|---|---|---|
| Q1 | Email reale di contatto da usare al posto di `ahsen@example.com`? | Verrà lasciato il placeholder con avviso |
| Q2 | URL social reali (GitHub, LinkedIn, Instagram, X) da sostituire a quelli di esempio? | Verranno mantenuti quelli di esempio; funzionalmente validi ma non puntano a profili reali. L'utente potrà sostituirli successivamente in `lib/site.ts`. |
| Q3 | Conferma che Vercel sia il fornitore accettato per il deploy gratuito? | In caso contrario si usa Cloudflare Pages come fallback, ma con integrazione toolchain non diretta. |

---

## Criteri di Accettazione (AC)

### AC-1 (rule) — Build pulita
- Comando `next build` esce con codice 0 e produce output `.next` completo.
- Comando `tsc --noEmit` esce con codice 0.
- Comando `next lint` esce con codice 0.

### AC-2 (rule) — SEO tecnico completo
- `/robots.txt` restituisce 200, contiene `Allow: /` e link a `Sitemap: <site.url>/sitemap.xml`.
- `/sitemap.xml` restituisce 200, contiene almeno: `/`, `/chi-sono`, `/blog`, `/contatti`, tutti gli slug degli articoli, tutti i tag. Ogni URL usa come prefisso il dominio deployato effettivo.
- Tutte le pagine hanno `<link rel="canonical">` corretto e assoluto.
- Head `<html>` ha `lang="it"`.
- Dati strutturati `application/ld+json` presenti in:
  - layout root → Person + WebSite
  - pagina contatti → FAQPage
  - ogni articolo → BlogPosting
- OpenGraph e Twitter card completi su tutte le pagine.

### AC-3 (rule) — Contenuti senza placeholder critici
- Nessun riferimento a `@example.com` in contenuti visibili all'utente, a meno che non sia esplicitamente circondato da un avviso "da sostituire".
- `CONTACT_EMAIL` documentata in `.env.example` e usata come fallback da `lib/site.ts`.

### AC-4 (rule) — Deploy e accessibilità pubblica
- Sito deployato tramite `deploy_to_remote` → Vercel, con preview URL fornito come evidenza.
- Rotta `/`, `/chi-sono`, `/blog`, `/contatti`, `/robots.txt`, `/sitemap.xml`, `/feed.xml`, `/manifest.webmanifest` tutte raggiungibili via HTTPS con status 200.
- Un articolo blog a caso e una pagina tag a caso restituiscono 200.
- `/not-found` (o slug inesistente) restituisce 404 con la pagina custom.

### AC-5 (rule) — Funzionalità form contatti
- Chiamata POST a `/api/contatti` con payload vuoto restituisce 400 e JSON `ok:false`.
- Chiamata POST a `/api/contatti` con nome/email/messaggio validi restituisce 200 o 503 a seconda della presenza di `RESEND_API_KEY`, ma **non** 500 generico.

### AC-6 (rubric) — Qualità SEO percepita (scala 0-5, soglia ≥ 4)
- `5 = eccellente`: ogni pagina ha title/description univoci, canonical corretti, JSON-LD multipli, immagini OG generate, sitemap/robots coerenti, URL semanticamente puliti.
- `4 = buono`: tutti i segnali tecnici essenziali, 1-2 aspetti minori non perfetti (es. titolo un po' lungo).
- `3 = sufficiente`: metadata presenti ma alcuni duplicati o poco specifici.
- `2 = debole`: parti essenziali mancanti.
- `1 = assente o sbagliato`.

Fonte di evidenza: ispezione manuale sorgenti HTML + chiamate curl ai file robots/sitemap + validazione JSON-LD con schema validator (ispezione struttura).

### AC-7 (rubric) — Stabilità post-deploy (scala 0-5, soglia ≥ 4)
- `5 = perfetta`: tutte le rotte rispondono < 800 ms, zero errori console JS su home e blog.
- `4 = buona`: tutte le rotte 200/404 corrette, tempi di risposta < 1.5s, nessun errore bloccante.
- `3 = sufficiente`: qualche warning ma tutto funziona.
- `2 = problemi minori ma non bloccanti`.
- `1 = errori che impediscono l'uso`.

Fonte di evidenza: ispezione endpoint deployato tramite curl/snapshot browser (se disponibile) + status code.

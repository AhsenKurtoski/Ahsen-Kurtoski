# Prerequisiti per essere trovato su Google

Questo documento elenca **tutto ciò che serve davvero** perché cercando "Ahsen Kurtoski"
compaiano informazioni corrette, cosa è già a posto e cosa tocca a te. Alla fine ci sono
le pratiche inutili che girano online, così non perdi tempo.

---

## ⚠️ La verità sui tempi (leggila prima)

Nessuno — né io né un tool a pagamento — può farti indicizzare "subito". Lo dice
[Google stesso](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl):

> *"Crawling can take anywhere from a few days to a few weeks."*
> *"Requesting a crawl does not guarantee that inclusion in search results will happen instantly or even at all."*

Tempi realistici per un sito nuovo con un dominio nuovo:

| Cosa | Tempo tipico |
| --- | --- |
| Google scopre la home dopo il deploy | poche ore — 2 giorni |
| Indicizzazione di home e `/chi-sono` | 1 — 5 giorni |
| Compaiono cercando "Ahsen Kurtoski" | 2 giorni — 3 settimane |
| Indicizzazione di tutti gli articoli e archivi | 1 — 6 settimane |
| Pannello di conoscenza (riquadro con foto/ruolo) | mesi, e non è garantito |

Chi promette "prima pagina in 24 ore" vende fumo.

---

## ✅ Prerequisiti tecnici (già a posto nel codice)

Verificali in qualsiasi momento con `npm run seo:check` (sulla build) e
`npm run seo:live -- https://tuo-dominio.com` (sul sito pubblicato).

| Prerequisito | Stato |
| --- | --- |
| Sito raggiungibile e **HTTPS** | lo ottieni gratis su Vercel |
| `robots.txt` che permette la scansione (nessun `Disallow: /`) | ✅ generato |
| Nessun `noindex` in meta o header | ✅ nessuno |
| `sitemap.xml` con **`lastmod` veritiero** | ✅ date reali, non l'ora della build |
| Un solo URL per pagina (canonical assoluto, niente doppioni con/senza slash) | ✅ |
| `title` e `description` unici per ogni pagina | ✅ 15/15 verificate |
| Contenuto presente nell'HTML servito (non solo JavaScript) | ✅ pagine prerenderizzate |
| Dati strutturati validi (`Person`, `FAQPage`, `BlogPosting`, `BreadcrumbList`) | ✅ |
| Immagine social 1200×630 su ogni pagina (anteprime su WhatsApp/LinkedIn) | ✅ |
| 404 con stato 404 (niente soft-404) | ✅ |
| Mobile-friendly e veloce | ✅ mobile-first, HTML statico |
| Indirizzo ufficiale configurato: `https://ahsenkurtoski.vercel.app` | ✅ predefinito nel codice |
| Dominio personale (opzionale: `*.vercel.app` è indicizzabile) | ⬜ solo se ne acquisti uno |
| Proprietà verificata su Search Console + sitemap inviata | ⬜ tocca a te |

---

## 🔧 Cosa fare tu, nell'ordine esatto

1. **Pubblica il sito** su Vercel → `GUIDA-DEPLOY.md` (10 minuti, gratis).
   L'indirizzo ufficiale `https://ahsenkurtoski.vercel.app` è già il valore
   predefinito, quindi canonical, sitemap e immagini social sono corretti anche
   senza configurare nulla. Se poi acquisti un dominio tuo, imposta
   `NEXT_PUBLIC_SITE_URL` con quello nuovo e rifai il deploy.
2. **Verifica il sito pubblicato** (prerequisiti reali, non la build locale):
   ```bash
   npm run seo:live -- https://ahsenkurtoski.vercel.app
   ```
3. **Search Console**: aggiungi la proprietà e verifica con il tag HTML
   (`GUIDA-SEO.md`, passo 1). Poi **invia la sitemap** (`/sitemap.xml`).
4. **Chiedi l'indicizzazione** di home, `/chi-sono`, `/blog`, `/contatti` con
   **Controlla URL → Richiedi indicizzazione**. C'è una quota: non ripetere la
   stessa richiesta, non accelera.
5. **Metti il link al sito nelle tue bio** (GitHub, Instagram, LinkedIn, X, firma
   email, curriculum). Questo è il prerequisito **non tecnico** più importante: un
   dominio nuovissimo con zero link in entrata viene scansionato con calma, mentre
   i link dai tuoi profili danno a Google un motivo per visitarlo e, insieme al
   `sameAs` nei dati strutturati, gli fanno collegare il nome "Ahsen Kurtoski"
   alla persona giusta.
6. **Bing e DuckDuckGo**: è già automatico. Ogni `git push` su `main` fa partire la
   GitHub Action `.github/workflows/indexnow.yml`, che segnala solo le pagine
   cambiate (Bing, quindi DuckDuckGo, più Yandex, Seznam e Naver). Non devi fare
   niente. Se vuoi farlo a mano:
   ```bash
   npm run indexnow:changed   # solo le pagine cambiate
   npm run indexnow           # tutto il sito
   ```
   Bing alimenta anche DuckDuckGo. Brave, invece, non partecipa a IndexNow: per
   Brave c'è solo <https://search.brave.com/submit-url> e i backlink.
7. **Controlla dopo 2-3 giorni** cercando `Ahsen Kurtoski` e
   `site:ahsenkurtoski.vercel.app`.

---

## ❌ Cose inutili o dannose (verificate sulle fonti Google)

- **"Ping" della sitemap**: l'endpoint è stato **disattivato da Google nel 2023**
  ([annuncio ufficiale](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)).
  Gli script che lo chiamano ottengono un 404 e non fanno nulla. La sitemap si
  invia da Search Console o si dichiara in `robots.txt` (già fatto).
- **Google Indexing API**: funziona **solo** per annunci di lavoro (`JobPosting`) e
  livestream (`BroadcastEvent`) — [documentazione](https://developers.google.com/search/apis/indexing-api/v3/quickstart).
  Per un sito personale non è utilizzabile, anche se trovi tutorial che lo
  suggeriscono.
- **IndexNow**: ottimo, ma **Google non partecipa**. Serve per Bing/DuckDuckGo/
  Yandex/Seznam/Naver. Per Google vale solo Search Console + sitemap.
- **`lastmod` sempre aggiornato a ogni build**: Google lo usa per programmare le
  scansioni, ma solo se corrisponde alla realtà. Se dichiari modifiche che non ci
  sono, smette di fidarsi. Nel progetto ora le date sono vere: quando cambi i
  testi aggiorna `updated` in `src/lib/site.ts`.
- **Ripetere "Richiedi indicizzazione"**: c'è una quota e per lo stesso URL non
  accelera nulla.
- **Keyword stuffing, testo nascosto, pagine civetta**: penalizzazioni, e per una
  ricerca sul tuo nome non servono a niente.
- **Cambiare dominio dopo l'indicizzazione**: si ricomincia da capo.

---

## 🎯 Il vero prerequisito per la ricerca "Ahsen Kurtoski"

Per una **ricerca di marca** (il tuo nome) Google deve capire che esiste una persona
con quel nome, che ha un sito, e che quello è il sito giusto. Servono tre cose, in
quest'ordine di importanza:

1. **Il nome scritto in modo identico e coerente** — nel `<title>`, nella
   descrizione, nella pagina "Chi è Ahsen Kurtoski", nei dati `Person`
   (`name` + `alternateName`) e sulle tue bio sociali. Tutto già a posto.
2. **Lo stesso nome e la stessa foto su tutti i profili**, collegati al sito e
   dichiarati in `sameAs`. Più fonti concordano, più Google è sicuro dell'identità.
3. **Contenuti che parlano di te in modo sostanziale** — la pagina `/chi-sono` è
   già costruita per rispondere a "chi è Ahsen Kurtoski". Bio inventata = rischio di
   confusione con altre persone: se il testo non ti rappresenta, va cambiato.

---

## Riepilogo in una riga

Il sito è pronto e verificato; per essere trovato servono **deploy + dominio
impostato + Search Console + link dalle tue bio**, e poi **da qualche giorno a
qualche settimana** di pazienza. Nessuna scorciatoia esiste.

# Guida: farsi trovare su Google (Search Console)

Il sito è già ottimizzato: title e description unici, canonical, `sitemap.xml`, `robots.txt`, feed RSS, dati strutturati `Person`, `WebSite`, `FAQPage`, `BreadcrumbList` e `BlogPosting`, immagini social generate automaticamente.

Però **pubblicare il sito non lo mette automaticamente su Google**. Serve un passaggio finale che solo tu puoi fare, perché richiede il tuo account Google. Ci vuole circa 10 minuti, poi Google indicizza in poche ore o al massimo 2-3 giorni.

---

## Prima di iniziare: il sito deve essere online

Segui `GUIDA-DEPLOY.md` per pubblicare su Vercel (gratis, senza carta di credito). Quando hai il tuo indirizzo (es. `https://ahsen-studio.netlify.app`), torna qui e usa **sempre quell'indirizzo esatto** nei passaggi sotto.

⚠️ **Passaggio da non dimenticare**: dopo il deploy imposta la variabile `NEXT_PUBLIC_SITE_URL` su Vercel con il tuo dominio (istruzioni in `GUIDA-DEPLOY.md`). Senza, canonical, sitemap e dati strutturati puntano al dominio di default e Google capisce male.

---

## 1. Aggiungi la proprietà a Google Search Console

1. Vai su <https://search.google.com/search-console/welcome> e accedi con il tuo account Google.
2. Clicca **Aggiungi proprietà** e scegli la colonna **Prefisso URL** (non quella "Dominio": richiede configurazione DNS).
3. Inserisci l'URL completo del sito, ad esempio `https://ahsen-studio.netlify.app`.
4. Clicca **Continua**.
5. Scegli il metodo di verifica **Tag HTML** (il più semplice): Google ti mostra un tag tipo
   `<meta name="google-site-verification" content="CODICE_LUNGO" />`.
   Copia **solo il codice** e inseriscilo in `src/app/layout.tsx`, dentro l'oggetto `metadata`:

   ```ts
   export const metadata: Metadata = {
     // ...quello che c'è già...
     verification: {
       google: "CODICE_LUNGO",
     },
   };
   ```

6. Salva, rifai il deploy (Vercel lo fa da solo se hai collegato GitHub, altrimenti "Redeploy").
7. Torna su Search Console e clicca **Verifica**. Se non passa subito, attendi 30 secondi e riprova.

---

## 2. Invia la sitemap

1. In Search Console, menu a sinistra → **Indicizzazione → Sitemap**.
2. Nel campo "Inserisci l'URL della sitemap" scrivi:
   ```
   https://ahsen-studio.netlify.app/sitemap.xml
   ```
3. Clicca **Invia**.
4. Dopo qualche minuto lo stato diventa "Operazione riuscita".

---

## 3. Chiedi l'indicizzazione delle pagine più importanti

Per ogni pagina che ti interessa, in Search Console usa la barra in alto **Controllo URL**:

1. Incolla l'URL, ad esempio `https://ahsen-studio.netlify.app/`
2. Attendi l'analisi, poi clicca **Richiedi l'indicizzazione**.
3. Ripeti per `/chi-sono`, `/blog`, `/contatti` e per i primi articoli.

Fallo soprattutto per la home e per `/chi-sono`: sono le pagine che rispondono alla ricerca "chi è Ahsen" e "siti web gratis Belluno".

---

## 4. Verifica i dati strutturati

1. Apri <https://validator.schema.org/>.
2. Scegli **Codice** e incolla il contenuto del blocco `<script type="application/ld+json">` che trovi aprendo il sorgente della pagina (tasto destro → Visualizza sorgente pagina → cerca `ld+json`).
3. Controlla la home (`Person`), i contatti (`FAQPage`) e un articolo (`BlogPosting`).

Puoi usare anche il **Rich Results Test** di Google: <https://search.google.com/test/rich-results>.

---

## 5. Controlli facoltativi ma utili

- **Prestazioni**: <https://pagespeed.web.dev/> — incolla la home e vedi il punteggio mobile.
- **Bing e DuckDuckGo**: <https://www.bing.com/webmasters/about> — stesso flusso di Google. Bing non è "solo Bing": alimenta anche DuckDuckGo.

---

## 6. Dopo 1-3 giorni controlla

1. Cerca su Google il tuo nome: `Ahsen Studio` o `siti web gratis Belluno`.
2. Nella ricerca scrivi `site:ahsen-studio.netlify.app` per vedere quali pagine Google ha già in archivio.
3. Se non compare nulla, torna al punto 3 e richiedi di nuovo l'indicizzazione. La prima volta Google è lento, è normale.

---

## Cosa NON fare

- ❌ Non cambiare dominio (o `NEXT_PUBLIC_SITE_URL`) dopo che Google ha indicizzato.
- ❌ Non rimuovere i canonical né creare pagine con lo stesso contenuto su URL diversi.
- ❌ Non usare tecniche scorrette (keyword stuffing, testo nascosto, pagine civetta): rischi una penalizzazione.

---

## Riepilogo: cosa fa il sito da solo e cosa devi fare tu

| Già fatto (nel codice) | Da fare tu (una volta sola) |
| --- | --- |
| Title e description per ogni pagina | Pubblicare su Vercel |
| Canonical e Open Graph / Twitter Card | Impostare `NEXT_PUBLIC_SITE_URL` |
| `sitemap.xml`, `robots.txt`, `feed.xml` | Iscriversi a Search Console e verificare |
| Dati strutturati Person / FAQ / BlogPosting | Inviare la sitemap |
| Favicon e icone per Android/iOS | Chiedere l'indicizzazione della home |
| Immagini social 1200×630 | Sostituire i contenuti segnaposto con i tuoi (vedi `README.md`) |

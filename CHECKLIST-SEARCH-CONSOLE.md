# Checklist — Google Search Console sul nuovo dominio `ahsenkurtoski.vercel.app`

Obiettivo: spostare l'indicizzazione da `axsenkurtoski.vercel.app` a
`ahsenkurtoski.vercel.app` senza perdere posizioni. Tempo totale: ~20 minuti,
più l'attesa di Google (da pochi giorni a 2-3 settimane).

---

## 0. Prerequisito — Vercel (se non ancora fatto)

- [ ] Dashboard → progetto `axsenkurtoski` → **Settings → General** → rinomina in
      `ahsenkurtoski` → **Save**.
- [ ] Verifica col browser:
      `https://ahsenkurtoski.vercel.app/` deve rispondere **200**;
      `https://axsenkurtoski.vercel.app/` deve **reindirizzare** al nuovo
      (Vercel lo fa da solo dopo la rinomina: 308 permanente).
- [ ] (Solo se il redirect del vecchio dominio non partisse da solo: Settings →
      Domains → rimuovi `axsenkurtoski.vercel.app`, riaggiungilo e impostalo come
      **Redirect to** `ahsenkurtoski.vercel.app` con redirect **Permanent**.)

> ⚠️ Non eliminare il vecchio dominio senza impostare il redirect: servirebbe a
> Google come segnale di migrazione e a chi ha già il vecchio link.

## 0-bis. Già verificato il 01/10/2026 (non serve rifarlo)

Questi prerequisiti sono stati controllati sul dominio ufficiale, quindi puoi
partire direttamente dal §1.

- [x] **File di verifica Google** — <https://ahsenkurtoski.vercel.app/google2783a9147b2337cb.html>
      risponde **200** e contiene `google-site-verification: google2783a9147b2337cb.html`.
- [x] **robots.txt** — `Allow: /` e `Sitemap: https://ahsenkurtoski.vercel.app/sitemap.xml`.
- [x] **sitemap.xml** — **16 URL**, tutti con `<lastmod>`.
- [x] **Dominio** — `ahsenkurtoski.vercel.app` **200**; `axsenkurtoski.vercel.app` **307** verso il nuovo.
- [x] **Scansionabilità e link** — `npm run audit:links -- https://ahsenkurtoski.vercel.app`: 16 pagine, **0 problemi**.
- [x] **Chiave IndexNow** — `78ad937f3d090064954460ece76cbeba.txt` risponde 200 (la usa il workflow a ogni push).

Resta la parte che richiede il tuo accesso a Google: verificare la proprietà
(§1) e inviare la sitemap (§2).

## 1. Nuova proprietà in Search Console

- [ ] Apri <https://search.google.com/search-console> (stesso account Google di prima).
- [ ] Menu in alto a sinistra → **Aggiungi proprietà** → tipo **Prefisso URL**.
- [ ] Inserisci esattamente: `https://ahsenkurtoski.vercel.app/`
      (https + nessuno spazio + slash finale).
- [ ] Come metodo di verifica scegli **File HTML**: Google propone il nome file
      `google2783a9147b2337cb.html` — **è già online nel sito**, non devi
      caricare nulla. Se Google propone un nome diverso, salva il file in
      `public/`, fai commit + push e aspetta il deploy (~1-2 min).
- [ ] Clicca **Verifica**: deve dare esito positivo (il file risponde su qualunque
      dominio del progetto).

## 2. Sitemap e indicizzazione

- [ ] Nella nuova proprietà: menu **Sitemap** → aggiungi `sitemap.xml`
      (l'URL completo diventa `https://ahsenkurtoski.vercel.app/sitemap.xml`) → **Invia**.
- [ ] Strumento **Controllo URL** (barra in alto): incolla
      `https://ahsenkurtoski.vercel.app/` → **Richiedi indicizzazione**.
- [ ] Ripeti per `/chi-sono`: è la pagina che risponde alla ricerca «chi è Ahsen Kurtoski».
- [ ] Facoltativo ma utile: ripeti anche per gli articoli del blog (li trovi nella sitemap).

## 3. Cambio indirizzo (opzionale, accelera la migrazione)

- [ ] Su **entrambe** le proprietà verificate (vecchia e nuova): nuova proprietà →
      **Impostazioni → Cambio di indirizzo** → seleziona `ahsenkurtoski.vercel.app`
      → Google controlla il redirect → **Conferma**.
- [ ] Se il tool segnala che manca il redirect, torna al punto 0 e sistemalo.

## 4. Segnali di supporto (facoltativi ma utili)

- [ ] Profilo Google Business / social: aggiorna i link al sito dove li hai
      pubblicati (LinkedIn, Instagram, bio) così il segnale di collegamento
      passa al nuovo dominio.
- [ ] I tool SEO del repo funzionano col nuovo dominio:
      ```bash
      npm run seo:live -- https://ahsenkurtoski.vercel.app
      npm run indexnow -- https://ahsenkurtoski.vercel.app
      ```
- [ ] Il workflow GitHub (IndexNow) segnala già automaticamente le pagine cambiate
      a Bing/DuckDuckGo/Yandex a ogni push su main: non serve nulla.

## 5. Cosa NON fare

- ❌ Non chiudere/eliminare la **vecchia** proprietà in Search Console: resta
  attiva per monitorare il calo di URL vecchi indicati.
- ❌ Non rimuovere il redirect dal vecchio dominio, nemmeno dopo il cambio
  indirizzo: Google lo usa per mesi.
- ❌ Non inviare la sitemap vecchia nella nuova proprietà (e viceversa).

## 6. Controlli a distanza

| Quando | Cosa controllare |
| --- | --- |
| +2-3 giorni | Controllo URL sulla home: «URL è su Google» deve comparire per il nuovo dominio |
| +1 settimana | Rapporti → **Pagine**: crescono gli URL `ahsenkurtoski.vercel.app`, calano quelli vecchi |
| +2-3 settimane | Ricerca Google: `Ahsen Kurtoski` e `site:ahsenkurtoski.vercel.app` mostrano il nuovo dominio |
| +1 mese | Se la vecchia proprietà non ha più imprescrizioni e il traffico è migrato, puoi ignorarla |

**I numeri al posto dell'occhio.** `npm run index:check` misura due cose: la parte
**tecnica** della migrazione (per ogni pagina della sitemap: la nuova risponde 200,
il canonical punta al dominio ufficiale, la vecchia fa un redirect in un solo salto)
e l'**indice** — quanti URL dei due domini risultano indicizzati — se è configurata
una sorgente (`SERPER_API_KEY` per Google, oppure `GOOGLE_API_KEY` +
`GOOGLE_CSE_ID` per Programmable Search). Ogni esecuzione aggiunge una voce a
`audit/indice-storico.json` con il confronto con la precedente, e il workflow
**«Indice»** lo fa da solo ogni lunedì salvando lo storico nel repo.

Punto di partenza, 01/10/2026: **1 pagina sul dominio ufficiale, 8 sul vecchio**
(parte tecnica 16/16). È il numero da vedere scendere di settimana in settimana
sul dominio vecchio e salire su quello nuovo.

---

Stato del codice: già pronto — `src/lib/site.ts` usa `ahsenkurtoski.vercel.app`
come dominio di riferimento, sitemap/canonical/robots la usano, il file di
verifica Google è in `public/` e la documentazione (README, GUIDE) è aggiornata.

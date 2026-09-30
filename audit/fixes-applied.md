# Fix applicati — accessibilità e semantica (30 settembre 2026)

Correzioni del gruppo **HIGH / MEDIUM / QUICK WIN** dell'[action plan](action-plan.md) già applicate al codice.
Sono nel **working tree: non committate e non deployate** (nessun commit/push/deploy eseguito).

Riferimento ai problemi originali: [audit report](audit-report.md) (H2, H3, H4, M1, L1, M3).

---

## 1. Contrasto del testo — `text-zinc-500` → `text-zinc-400`

| | Prima | Dopo |
|---|---|---|
| Colore | `#71717b` | `#a1a1aa` |
| Rapporto su `#0b0b11` | 4,06:1 ❌ | **~8:1** ✅ |
| Occorrenze | 16 (nodi Lighthouse 6–10 per pagina) | 0 |

Interessati 9 file: `app/page.tsx`, `app/chi-sono/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`,
`app/blog/tag/[tag]/page.tsx`, `app/privacy/page.tsx`, `components/site-footer.tsx`, `components/breadcrumbs.tsx`,
`components/contact-form.tsx` (incluso il `placeholder`).

Extra fuori audit: il separatore `,` fra i siti nel footer passava da `text-zinc-600` (2,6:1, oggi non visibile perché
c'è un solo sito in `site.otherSites`) a `text-zinc-400`, così non tornerà a fallire quando ne aggiungi un secondo.

## 2. Header — `label-content-name-mismatch` sul logo

**Prima:** `<Link aria-label="Ahsen Kurtoski — torna alla home">` con dentro il testo visibile `AK Ahsen Kurtoski`:
l'etichetta non conteneva "AK", quindi axe lo segnalava su **ogni pagina**.

**Dopo:** niente `aria-label`; le iniziali `AK` sono decorative (`aria-hidden`), la destinazione è detta da uno
`<span class="sr-only">— torna alla home</span>`. Nome accessibile calcolato: *"Ahsen Kurtoski — torna alla home"*,
che contiene tutto il testo visibile.

## 3. `/chi-sono` — HTML semantico

- **Timeline:** era `<ol><Reveal><li>…` (il `<div>` di `Reveal` si infilava fra lista e voce → `list` + `listitem`).
  Ora `<ol><li><Reveal>…`: il `<li>` è figlio diretto dell'`<ol>` e l'animazione vive dentro la voce.
  Il pallino della timeline è posizionato in assoluto rispetto al `<li>` (`relative`), quindi resta allineato: verificato a schermo.
- **Info rapide:** era `<dl>` con `<dt>/<dd>` annidati sotto due `<div>` → `definition-list` + `dlitem`.
  Ora è una `<ul>` di `<li>` con `<span>` etichetta + valore (l'elenco è una lista di fatti, non una coppia termine/definizione).

## 4. `<h1>` su tutte le pagine

`SectionHeading` ha una nuova prop `as?: "h1" | "h2"` (default `h2`), quindi la resa visiva non cambia.

- `as="h1"` sulla prima intestazione di `/chi-sono`, `/blog`, `/contatti`, `/privacy`, `/blog/tag/[tag]`.
- Uguale su `/` e `/blog/[slug]`: usavano già un `<h1>` proprio.
- **Effetto collaterale trovato e corretto:** con l'`h1` in cima, le card degli articoli (`<h3>`) creavano un salto
  `h1 → h3` su `/blog` e sulle pagine tag (`heading-order`, a11y 98). `PostCard` ora accetta `headingLevel` (default `3`)
  e le due pagine elenco passano `2`. Nelle pagine articolo le card restano `h3` sotto l'`h2` "Continua a leggere".

**Risultato: 16/16 pagine con esattamente un `<h1>` e nessun salto di livello.**

## 5. Input del form a 16 px su mobile

`inputClass` in `contact-form.tsx`: `text-sm` → **`text-base sm:text-sm`**.
A 390 px gli input tornano 16 px (iOS non zooma più al focus), da tablet in su restano 14 px come prima.
Etichette e ringraziamenti del form passano a `text-zinc-400` (punto 1).

## 6. Effetto macchina da scrivere rispettoso

`components/typing-role.tsx`:

- **`prefers-reduced-motion: reduce`** → nessun timer: mostra il primo ruolo in statico (nessun cursore lampeggiante).
- **Scheda nascosta** (`document.visibilitychange`) → l'effetto si ferma e riparte quando torni sulla scheda: niente
  `setState` ogni 45–90 ms mentre nessuno guarda (CPU e batteria su mobile).

## Verifiche eseguite (dopo le modifiche)

| Controllo | Esito |
|---|---|
| `npx tsc --noEmit` | 0 errori |
| `npx eslint .` | 0 errori |
| `npm run build` | OK (29 route) |
| `npm run seo:check` | 16/16 pagine ok |
| Lighthouse a11y, 7 pagine (build locale) | **100/100 su tutte**, zero audit falliti |
| `/chi-sono` a11y | **81 → 100** |
| `<h1>` per pagina (HTML di build) | 1 su tutte e 16 le pagine |
| Gerarchia titoli (runtime) | nessun salto |
| Input a 390 px / 900 px | 16 px / 14 px |
| `reduced-motion` | testo statico, nessun cursore, stabile dopo 1,2 s |
| Scheda nascosta | testo invariato dopo 1 s |
| Layout a schermo (390 e 900 px) | timeline, card e form invariati |

Dati grezzi dei run "dopo": `audit/raw/after-fix/` (JSON Lighthouse per le 7 pagine).
Screenshot post-fix: `audit/screenshots/after-*.png`.

## Cosa resta aperto

1. **Deploy**: queste modifiche valgono solo quando le committi e ridispleghi (dipendono da C1/C2 dell'action plan).
2. **Tap target 40 px** (QW2: menu mobile e icone social) — non incluso in questo giro.
3. **Title/description** (M2) e i fix 2–4 di performance (M3: `preload: false` per Geist Mono, `inlineCss`, bundle) — non inclusi.
4. **Domino ufficiale 404** (C1) e **handle social da rinominare** (H1): invariati, restano i blocchi principali per l'indicizzazione.

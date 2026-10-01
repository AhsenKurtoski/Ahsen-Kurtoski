# Checklist — verifica manuale dei profili social

Tempo: ~10 minuti. Serve perché **nessuno strumento automatico può controllare
questi link**: LinkedIn risponde `999` e Instagram `200` a *qualunque* username,
Fiverr `403`. Un handle scritto male passa quindi ogni verifica automatica.

> Il caso non è teorico: durante l'audit gli handle di LinkedIn e Instagram erano
> stati **ricostruiti a mano** (`/in/ahsenkurtoski`, `/ahsenkurtoski`) e per giorni
> il sito ha dichiarato in `sameAs` due profili **inesistenti**. Un `sameAs` che
> punta a un profilo sbagliato è peggio di un `sameAs` assente: dichiara a Google
> un'identità che non è la tua.

---

## 0. I valori che devono coincidere

Sono quelli che il sito dichiara nei dati strutturati (`Person` + `ProfessionalService`
in `src/app/layout.tsx`, alimentati da `src/lib/site.ts`): se un profilo dice
qualcosa di diverso, Google legge due identità separate e il collegamento si indebolisce.

| Campo | Valore nel sito |
|---|---|
| Nome | `Ahsen Kurtoski` |
| Ruolo (`jobTitle`) | `Developer & Creatore Digitale` |
| Sito | `https://ahsenkurtoski.vercel.app` |
| Email | `cshop0784@gmail.com` |
| Area servita | `Italia` |
| `sameAs` | GitHub, LinkedIn, Instagram, Fiverr (4 URL) |

## 1. LinkedIn

URL nel sito: `https://www.linkedin.com/in/ahsen-kurtoski-397b00354`

- [ ] **Apri l'URL** da browser (non da strumento automatico): deve mostrare il
      *tuo* profilo, non una pagina «profilo non trovato» e non il profilo di
      un'altra persona.
- [ ] **Nome** visualizzato = `Ahsen Kurtoski` (senza «Axsen»).
- [ ] **Headline** coerente col ruolo del sito (es. *Developer & Creatore Digitale*).
- [ ] **Foto** la stessa usata su GitHub: la coerenza dell'immagine è uno dei
      segnali che Google usa per unire i profili in un'unica persona.
- [ ] **Sito web** nel profilo: sezione *Contatti* → link a
      `https://ahsenkurtoski.vercel.app` (il link in entrata dal profilo al sito
      vale più del solo `sameAs`).
- [ ] **URL pubblico** in *Modifica URL pubblico*: se lo cambi, prendi il valore
      esatto e aggiorna `src/lib/site.ts` (vedi §4).

## 2. Instagram

URL nel sito: `https://www.instagram.com/ahsenstudio`

- [ ] **Apri l'URL** da browser: il profilo deve esistere ed essere il tuo.
- [ ] **Nome** visualizzato (`Ahsen Kurtoski`) e **username** coerenti con quello
      che c'è nel sito.
- [ ] **Bio**: link al sito (`ahsenkurtoski.vercel.app`) nel campo *Sito*.
- [ ] **Foto profilo**: la stessa di GitHub e LinkedIn.

## 3. GitHub e Fiverr (solo conferma)

- [ ] GitHub — `https://github.com/AhsenKurtoski` → risponde **200** e nel profilo
      non c'è più nessun riferimento ad «Axsen». (Questo lo controlla già
      `npm run audit:links`.)
- [ ] Fiverr — `https://www.fiverr.com/s/RV7NzgN` → **apri il link da browser**:
      il bot riceve `403`, quindi finché non lo confermi a mano la verifica
      periodica lo segnala come *senza conferma registrata*.

## 4. Se un URL cambia

1. Aggiorna `socials` in `src/lib/site.ts` (i valori finiscono anche in `sameAs`:
   non c'è nessun altro posto da toccare).
2. Apri il nuovo URL da browser e confermalo (§1–§3).
3. Aggiungilo a `CONFERMATI_A_MANO` in `scripts/audit-links.mjs` con la data:
   è il registro delle verifiche fatte a mano.
4. Riesegui la verifica:
   `npm run audit:links -- https://ahsenkurtoski.vercel.app` e
   `npm run seo:check` (che controlla che `sameAs` contenga davvero i 4 URL).

## 5. Cosa NON può fare l'automazione

| Controllo | Coperto da | Limite |
|---|---|---|
| Link interno/esterno raggiungibile | `npm run audit:links` | i social rispondono uguale per qualunque username |
| `sameAs` presente e popolato | `npm run seo:check` | dice che *c'è*, non che *esiste* |
| Profilo esistente e corretto | **questa checklist** | richiede un umano: è il motivo per cui esiste |

## 6. Esito della verifica

| Data | LinkedIn | Instagram | GitHub | Fiverr |
|---|---|---|---|---|
| 01/10/2026 | **da confermare**: l'URL apre l'authwall di LinkedIn (serve il login); l'handle non compare in nessuna ricerca pubblica (neutro) | **esiste**: il titolo della pagina è «Ahsen Kırdar ♟️ (@ahsenstudio)»; bio e link al sito non visibili senza login | 200 verificato anche da bot | **da aprire e confermare** (403 ai bot) |

`sameAs` aggiornato ai 4 URL e verificato nell'HTML di build; i due URL social sono
registrati come confermati dal proprietario in `CONFERMATI_A_MANO`
(`scripts/audit-links.mjs`).

### Un punto aperto, trovato proprio facendo questa verifica

Il profilo Instagram `ahsenstudio` **esiste**, ma il suo nome visualizzato è
**«Ahsen Kırdar»**, mentre il sito dichiara `Ahsen Kurtoski` (in `site.name`, nel
`<title>`, nei dati strutturati e nell'`alternateName`). Un conteggio automatico
non poteva accorgersene: il titolo della pagina è l'unico punto in cui quel nome
compare, e nessuno strumento lo confronta con il nome del sito.

Due strade, entrambe legittime:

1. **Allineare il profilo al sito**: nome visualizzato `Ahsen Kurtoski`
   (o `Ahsen Kurtoski · Developer`). Coerenza nome-ovunque è uno dei segnali che
   Google usa per collegare una persona a un unico insieme di profili. Se scegli
   questa strada, `Ahsen Kırdar` si può togliere da `alternateNames`.
2. **Dichiarare entrambi i nomi nel sito** — **strada scelta il 01/10/2026**:
   `src/lib/site.ts` ha `alternateNames: ["Ahsen", "Kurtoski", "Ahsen Kırdar"]`,
   che alimenta `alternateName` nel `Person` dei dati strutturati. Google legge
   così un'informazione esplicita invece di due indizi incoerenti, senza toccare
   né il nome pubblico del sito né il profilo Instagram.

In ogni caso, dopo una modifica: aggiornare la tabella qui sopra e rieseguire
`npm run audit:links -- https://ahsenkurtoski.vercel.app`.

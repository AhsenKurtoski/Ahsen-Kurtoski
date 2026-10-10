# Guida: pubblica il sito su Vercel (GRATIS, 2 minuti)

Questo progetto è già pronto per essere pubblicato su **Vercel** (piano Hobby, dominio gratuito `*.vercel.app`, carta di credito NON richiesta).

---

## Opzione A (RACCOMANDATA): 1-click dalla Dashboard Vercel — NESSUN TERMINALE

1. Vai su <https://vercel.com/new> e accedi con il tuo account (crealo se non ce l'hai - gratis, anche con GitHub/Google).
2. Clicca **"Add New → Project"**.
3. Se il codice è già su GitHub: scegli il repository.
   - Se NON usi GitHub: clicca **"Deploy"** nella sezione "Deploy Using CLI" oppure scegli **"Import Third-Party Git Repository"** o **"Upload"** nella sezione "You can also deploy a local project".
4. Nella schermata "Configure Project":
   - **Framework Preset**: dovrebbe rilevare automaticamente `Next.js` (in caso contrario sceglilo tu).
   - **Root Directory**: lascia vuota (se hai clonato la cartella).
   - **Build Command**: `next build` (dovrebbe essere già compilato).
   - **Install Command**: `npm install`.
5. Nella sezione **Environment Variables**, aggiungi **obbligatoriamente**:

   | Name                   | Value                                                       |
   | ---------------------- | ----------------------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL` | `https://ahsen-studio.netlify.app` (è già il valore predefinito nel codice, ma mettilo per chiarezza) |
   | `CONTACT_EMAIL`        | `cshop0784@gmail.com` — indirizzo che riceve i messaggi del form |

> Il form usa **FormSubmit** e non richiede chiavi API: ricordati solo di cliccare il
> link di conferma che ti arriva alla prima richiesta (vedi README).

6. Clicca **Deploy**. Entro 1-2 minuti il sito è online!

---

## Opzione B: Da terminale locale (CLI Vercel)

Apri un terminale dentro la cartella del progetto e incolla:

```bash
npm i -g vercel
vercel login
vercel
```

Segui le domande:

- Set up and deploy? `Y`
- Scope: scegli il tuo account personale
- Link to existing project? `N`
- Project name: `ahsen-studio` (o quello che vuoi)
- Directory: `./`
- Framework: `Next.js` (dovrebbe rilevarlo)
- Build command: lascia il default
- Install command: lascia il default
- Want to modify these settings? `N`

Quando la build finisce, salva l'URL che ti mostra (es. `https://ahsen-kurtoski-abc.vercel.app`).

---

## ⚠️ IMPOSTA SUBITO DOPO IL DEPLOY `NEXT_PUBLIC_SITE_URL`

Senza questo passaggio **canonical, sitemap, OpenGraph e JSON-LD useranno l'URL di default e quindi Google non indicizzerà bene.

1. Vai su <https://vercel.com/dashboard> → entra nel progetto → **Settings → Environment Variables**.
2. Aggiungi (o modifica) la variabile:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://ahsen-studio.netlify.app` (sostituisci con il tuo URL **SENZA slash finale `/`)
   - **Environment**: seleziona **Production, Preview, Development**
3. Clicca **Save**.
4. Rientra nella scheda **Deployments**, clicca in alto a destra **⋯ sull'ultimo deploy → **Redeploy** (senza cache).

---

## Come verificare che tutto funzioni

Dopo il deploy, apri questi URL (sostituisci con il tuo dominio):

| Endpoint | Cosa controllare |
|---|---|
| `https://TUO.vercel.app/ | Home caricata, senza errori |
| `https://TUO.vercel.app/robots.txt | Allow: / + Sitemap |
| `https://TUO.vercel.app/sitemap.xml | 4 statiche + articoli + tag |
| `https://TUO.vercel.app/feed.xml | RSS |
| `https://TUO.vercel.app/manifest.webmanifest | PWA manifest |
| `https://TUO.vercel.app/blog/benvenuto-nel-mio-mondo-digitale | Articolo OK |
| `https://TUO.vercel.app/blog/tag/web | Archivio tag OK |
| `https://TUO.vercel.app/pagina-che-non-esiste-1234567 | 404 personalizzata |

Se tutti gli stati sono OK, il sito è pubblico e Google può indicizzarlo!

---

## Alternative GRATUITE se non vuoi usare Vercel

- **Cloudflare Pages**: <https://pages.cloudflare.com> (stesso flusso, dominio `*.pages.dev`)
- **Netlify**: <https://app.netlify.com/drop> (trascina la cartella, dominio `out buildata dopo `next build`)

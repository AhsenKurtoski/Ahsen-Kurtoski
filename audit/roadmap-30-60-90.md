# Roadmap 30–60–90 giorni — Ahsen Kurtoski

Obiettivo del trimestre: **il sito è la fonte ufficiale e verificabile di "Ahsen Kurtoski" su Google**, veloce su mobile, indicizzato correttamente, con un'identità coerente (nome, dominio, handle) su tutte le piattaforme.

---

## 🗓️ Giorni 1–30 — Fondamenta (fix e migrazione)

**Settimana 1 — sbloccare tutto**
- [ ] C1: rinomina progetto Vercel → `ahsenkurtoski`; verifica 200 sul nuovo + 308 dal vecchio (2 min).
- [ ] H1: rinomina account GitHub/LinkedIn/Instagram ad `AhsenKurtoski` (o ripristina i vecchi handle).
- [ ] C2: commit + push delle modifiche già applicate (handle, brand, data).
- [ ] Verifica post-deploy: `npm run seo:live` e `npm run audit:links` sul dominio nuovo (tutto verde).

**Settimana 2 — Search Console e accessibilità**
- [ ] M4: proprietà + verifica + sitemap + richieste indicizzazione (home, /chi-sono) + Cambio di indirizzo sulla proprietà vecchia.
- [ ] H2: contrasto `text-zinc-500` → `text-zinc-400`.
- [ ] H3/H4: fix semantici `/chi-sono` + aria-label header.
- [ ] QW1/QW2: input 16 px, tap target 44 px.

**Settimane 3–4 — contenuti e on-page**
- [ ] M1: H1 su tutte le pagine.
- [ ] M2: title/description della tabella proposta.
- [ ] H5: aggiorna il sito Netlify dello studio.
- [ ] Controlli: GSC Copertura (crescono gli URL del nuovo dominio), query `site:ahsenkurtoski.vercel.app`, primi `Ahsen Kurtoski` in SERP.

**KPI a 30 giorni:** dominio nuovo 200 + vecchio 308; sitemap inviata e letta; 16/16 pagine indicizzabili; A11y ≥ 98; nessun link rotto.

---

## 🗓️ Giorni 31–60 — Velocità e contenuti

- [ ] M3: performance mobile — typing con reduced-motion/pausa, preload mono off, misurazione prima/dopo (target Perf ≥85, LCP ≤2,5 s, TBT ≤200 ms).
- [ ] Valutare `experimental.inlineCss` con misurazione; bundle analyzer e `dynamic()` per i widget non critici.
- [ ] 2–4 nuovi articoli (uno "pillar" tecnico, uno narrativo) seguendo il template del blog; `lastmod` e `updated` veri.
- [ ] Ottimizzare gli `excerpt` degli articoli più vecchi (contenuto + description).
- [ ] Bio e link al sito aggiornati ovunque (GitHub, Instagram, LinkedIn, Fiverr, firma email).
- [ ] Primo report mensile GSC: query sul nome vs query su argomenti; pagine scansionate/indicizzate.

**KPI a 60 giorni:** home+chi-sono+blog indicizzati; CWV lab "buoni" su tutte le pagine; 6–8 articoli totali; primi clic da query di marca.

---

## 🗓️ Giorni 61–90 — Autorità e consolidamento

- [ ] Dominio personale (es. `ahsenkurtoski.com`): acquisto, configurazione, 301 permanente dal `.vercel.app`, aggiornamento `NEXT_PUBLIC_SITE_URL` + GSC (nuova proprietà o cambio indirizzo).
- [ ] 2–4 articoli con link interni incrociati e aggiornamento dei contenuti esistenti.
- [ ] 3–5 link in entrata "veri": profilo GitHub con sito in evidenza, Fiverr, directory sviluppatori, eventuale guest post.
- [ ] Revisione completa con questo kit di script (`audit:links`, `audit:responsive`, Lighthouse) e aggiornamento dell'action plan.
- [ ] Valutare PWA/service worker solo se porta valore reale ai lettori (e aggiornare l'informativa se cambia qualcosa sui dati).
- [ ] Pianificare il trimestre successivo: content cluster sul nome (progetti, collaborazioni, retrospettive).

**KPI a 90 giorni:** 10+ articoli; query di marca in top 3; CWV field data "buoni" (quando CrUX avrà dati); identità coerente al 100% (dominio, nome, foto, sameAs).

---

## Abitudini ricorrenti (ogni mese, 15 minuti)

1. `npm run seo:check` dopo ogni build importante; `npm run seo:live` mensile.
2. GSC: query, pagine, errori di scansione; non ripetere richieste di indicizzazione.
3. Aggiornare `updated` in `src/lib/site.ts` quando cambiano i contenuti (lastmod veritiero).
4. Prima di ogni modifica grossa: `npm run audit:responsive` + un run Lighthouse.

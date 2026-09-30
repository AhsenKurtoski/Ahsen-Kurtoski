# Roadmap 30–60–90 giorni — Ahsen Kurtoski

Obiettivo del trimestre: **il sito è la fonte ufficiale e verificabile di "Ahsen Kurtoski" su Google**, veloce su mobile, indicizzato correttamente, con un'identità coerente (nome, dominio, handle) su tutte le piattaforme.

---

## 🗓️ Giorni 1–30 — Fondamenta (fix e migrazione)

**Settimana 1 — sbloccare tutto** ✅ (tutto fatto il 30/09/2026)
- [x] C1: rinomina progetto Vercel → `ahsenkurtoski`; verificato 200 sul nuovo + **307** dal vecchio (nel piano era previsto 308; Vercel risponde 307).
- [x] H1: account rinominati ad `AhsenKurtoski` — GitHub 200 e Instagram 200 verificati; LinkedIn risponde 999 ai bot, **conferma manuale** ancora da fare.
- [x] C2: commit `c3bc58c` + push su `main`.
- [x] Verifica post-deploy: `seo:live` («il sito è scansionabile e indicizzabile», 16/16) e `audit:links` (0 problemi, 0 avvisi) sul dominio ufficiale.

**Settimana 2 — Search Console e accessibilità** (accessibilità fatta, GSC da fare)
- [ ] M4: proprietà + verifica + sitemap + richieste indicizzazione (home, /chi-sono) + Cambio di indirizzo sulla proprietà vecchia. **Unico blocco rimasto della settimana: serve il tuo accesso a Search Console.**
- [x] H2: contrasto `text-zinc-500` → `text-zinc-400` (deployato; a11y 100/100 sul live).
- [x] H3/H4: fix semantici `/chi-sono` + etichetta del logo nell'header.
- [x] QW1: input del form a 16 px su mobile. [ ] QW2: tap target 44 px — **ancora aperto**.

**Settimane 3–4 — contenuti e on-page**
- [x] M1: H1 su tutte le pagine (1 per pagina su 16/16, verificato dal crawler).
- [ ] M2: title/description della tabella proposta — **aperto**.
- [ ] H5: aggiorna i testi del sito Netlify dello studio (sottodominio già rinominato e link sistemato; restano `<title>` e description).
- [ ] Controlli: GSC Copertura (crescono gli URL del nuovo dominio), query `site:ahsenkurtoski.vercel.app`, primi `Ahsen Kurtoski` in SERP.

**KPI a 30 giorni:** dominio nuovo 200 + vecchio 307 ✅; sitemap inviata e letta ⬜ (dipende da M4); 16/16 pagine indicizzabili ✅; A11y ≥ 98 ✅ (100/100 sul live); nessun link rotto ✅ (audit link 0 problemi).

---

## 🗓️ Giorni 31–60 — Velocità e contenuti

- [x] M3 (fix 1): typing con reduced-motion/pausa a scheda nascosta — deployato; misure dopo: home 83–86, blog 97, contatti 97.
- [ ] M3 (fix 2–4): preload mono off, CSS render-blocking, bundle — **aperti**; obiettivo LCP ≤2,5 s stabile su home (oggi 2,45–2,65 s) e TBT ≤200 ms (oggi 393–546 ms).
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

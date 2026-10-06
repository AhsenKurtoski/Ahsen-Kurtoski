# Roadmap 30–60–90 giorni — Ahsen Kurtoski

Obiettivo del trimestre: **il sito è la fonte ufficiale e verificabile di "Ahsen Kurtoski" su Google**, veloce su mobile, indicizzato correttamente, con un'identità coerente (nome, dominio, handle) su tutte le piattaforme.

---

## 🗓️ Giorni 1–30 — Fondamenta (fix e migrazione)

**Settimana 1 — sbloccare tutto** ✅ (tutto fatto il 30/09/2026)
- [x] C1: rinomina progetto Vercel → `ahsenkurtoski`; verificato 200 sul nuovo + **307** dal vecchio (nel piano era previsto 308; Vercel risponde 307).
- [x] H1: chiuso il 01/10/2026. GitHub rinominato → 200; LinkedIn e Instagram **non** erano stati rinominati e gli URL nel codice erano inventati (`/in/ahsenkurtoski`, `/ahsenkurtoski`): ora ci sono i profili veri, `/in/ahsen-kurtoski-397b00354` e `/ahsenstudio`, come 4 `sameAs` nei dati strutturati. Resta la conferma manuale dal browser (i bot ricevono 999/200 su qualunque handle).
- [x] C2: commit `c3bc58c` + push su `main`.
- [x] Verifica post-deploy: `seo:live` («il sito è scansionabile e indicizzabile», 16/16) e `audit:links` (0 problemi, 0 avvisi) sul dominio ufficiale.

**Settimana 2 — Search Console e accessibilità** (accessibilità fatta, GSC da fare)
- [ ] M4: proprietà + verifica + sitemap + richieste indicizzazione (home, /chi-sono) + Cambio di indirizzo sulla proprietà vecchia. **Unico blocco rimasto della settimana: serve il tuo accesso a Search Console.**
- [x] H2: contrasto `text-zinc-500` → `text-zinc-400` (deployato; a11y 100/100 sul live).
- [x] H3/H4: fix semantici `/chi-sono` + etichetta del logo nell'header.
- [x] QW1: input del form a 16 px su mobile. [ ] QW2: tap target 44 px — **ancora aperto**.

**Settimane 3–4 — contenuti e on-page**
- [x] M1: H1 su tutte le pagine (1 per pagina su 16/16, verificato dal crawler).
- [x] M2: title e description riscritti il 01/10/2026 — title 32–60 e description 140–153 su 16/16 pagine, soglie ora imposte da `seo:check` (evidenze in [fixes-applied.md §7](fixes-applied.md#7-title-e-meta-description-lunghezze-ideali)). **Deployato il 01/10/2026 (commit `f480b5e`).**
- [ ] H5: aggiorna i testi del sito Netlify dello studio (sottodominio già rinominato e link sistemato; restano `<title>` e description).
- [ ] Controlli: GSC Copertura (crescono gli URL del nuovo dominio), query `site:ahsenkurtoski.vercel.app`, primi `Ahsen Kurtoski` in SERP.

**KPI a 30 giorni:** dominio nuovo 200 + vecchio 307 ✅; sitemap inviata e letta ⬜ (dipende da M4); 16/16 pagine indicizzabili ✅; A11y ≥ 98 ✅ (100/100 sul live); nessun link rotto ✅ (audit link 0 problemi).

---

## 🗓️ Giorni 31–60 — Velocità e contenuti

- [x] M3 (fix 1): typing con reduced-motion/pausa a scheda nascosta — deployato; misure dopo: home 83–86, blog 97, contatti 97.
- [x] M3 (fix 2–4): mono non più precaricato (−23 KB dove non serve), `Reveal` senza JS con animazione CSS scroll-driven, bundle analizzato (il resto del JS è il runtime del framework). `browserslist` provato e **scartato**; `inlineCss` provato con due build affiancate e **adottato** (LCP simulato −253 ms in 6 round su 6). Misure: home mobile 258 → **233 KB**, Perf mediana 92 → **94**, TBT mediana 210 → **170 ms** (in locale; deployate il 01/10/2026). Sul LCP: i 2,6–2,8 s sono **stima della simulazione**, non un ritardo del dipinto — l'LCP osservato coincide con l'FCP (0,8–1,0 s in locale, 3,4 s su 3G reale) in 11 run su 11, e l'A/B su `font-display: optional` ha respinto l'ipotesi del cambio font. Verifica indipendente fatta su **PageSpeed Insights**: prima del deploy mobile **Perf 96, LCP 2,4 s, TBT 70 ms, CLS 0** (soglie CWV già rispettate), desktop **Perf 100, LCP 0,52 s, TBT 0**; **dopo il deploy del 01/10/2026 mobile Perf 100, LCP 1,7 s, TBT 20 ms**, desktop **Perf 100, LCP 0,6 s**; nessun dato di campo CrUX perché il traffico è troppo basso. In 16 run su 16, su quattro ambienti, l'LCP osservato coincide con il primo paint. Rilievi PSI residui, tutti di framework: 14 KiB di JS legacy e 28 KiB non usato (il CSS bloccante è sparito con `inlineCss`).
- [x] `experimental.inlineCss` valutato con misurazione e **adottato** (01/10/2026): A/B con due build affiancate e run alternati → **LCP simulato −253 ms in 6 round su 6**, TBT invariato, **+0,35 KB brotli in prima visita**, +7,4 KB per navigazione client-side (Next duplica il CSS nel payload RSC). Bundle analyzer fatto; `dynamic()` per `BackToTop`/`ReadingProgress` valutato e **non applicato** (~1 KB ciascuno e servono al primo paint).
- [x] Guardia di performance in CI (01/10/2026): `npm run perf:budget` misura peso della prima visita e risorse che bloccano il rendering sull'HTML servito, e fallisce se ricompare un CSS render-blocking (provata nei due sensi: con `inlineCss` spento esce con codice 1). Nella stessa passata sono stati dichiarati i nomi alternativi — «Ahsen Kırdar», il nome del profilo Instagram — in `alternateName`.
- [ ] 2–4 nuovi articoli (uno "pillar" tecnico, uno narrativo) seguendo il template del blog; `lastmod` e `updated` veri.
- [x] `excerpt` e description degli articoli portati nel range ideale (01/10/2026); resta da rivedere il **corpo** dei più vecchi.
- [ ] Bio e link al sito aggiornati ovunque (GitHub, Instagram, LinkedIn, firma email).
- [ ] Primo report mensile GSC: query sul nome vs query su argomenti; pagine scansionate/indicizzate.

**KPI a 60 giorni:** home+chi-sono+blog indicizzati; CWV lab "buoni" su tutte le pagine (per l'LCP leggere la nota in [performance report §0b](performance-report.md): il valore dei report è simulato, il dipinto reale coincide con l'FCP); 6–8 articoli totali; primi clic da query di marca.

---

## 🗓️ Giorni 61–90 — Autorità e consolidamento

- [ ] Dominio personale (es. `ahsenkurtoski.com`): acquisto, configurazione, 301 permanente dal `.vercel.app`, aggiornamento `NEXT_PUBLIC_SITE_URL` + GSC (nuova proprietà o cambio indirizzo).
- [ ] 2–4 articoli con link interni incrociati e aggiornamento dei contenuti esistenti.
- [ ] 3–5 link in entrata "veri": profilo GitHub con sito in evidenza, directory sviluppatori, eventuale guest post.
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

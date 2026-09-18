import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { formatDate } from "@/lib/posts";
import { ogImage } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Informativa privacy e cookie",
  description:
    "Nessun cookie di tracciamento: gli unici dati che ricevo sono quelli che scrivi nel form dei contatti, e li uso solo per risponderti.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Informativa privacy e cookie",
    description:
      "Nessun cookie di tracciamento: gli unici dati sono quelli che scrivi nel form, e servono solo a risponderti.",
    url: `${site.url}/privacy`,
    type: "website",
    images: [
      ogImage({
        title: "Informativa privacy",
        subtitle: "Nessun cookie di tracciamento, solo i dati del form",
      }),
    ],
  },
};

/** Le date di questa pagina finiscono nei dati strutturati come segnale di aggiornamento */
const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Informativa privacy e cookie",
  url: `${site.url}/privacy`,
  inLanguage: "it-IT",
  isPartOf: { "@type": "WebSite", name: `${site.name} — Sito ufficiale`, url: site.url },
  dateModified: site.privacyUpdated,
  about: {
    "@type": "Thing",
    name: "Informativa sul trattamento dei dati personali e uso dei cookie",
  },
};

/** Elenco dei diritti, con link all'autorità di controllo */
function RightsList() {
  const rights = [
    "sapere se conservo tuoi dati e ottenerne una copia (accesso)",
    "far correggere dati sbagliati o incompleti (rettifica)",
    "far cancellare i tuoi dati, ad esempio i messaggi che mi hai inviato",
    "limitare o opporti al trattamento, quando previsto dal GDPR",
    "ricevere i dati che mi hai dato in un formato leggibile (portabilità)",
  ];

  return (
    <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-zinc-400">
      {rights.map((right) => (
        <li key={right} className="flex gap-2.5">
          <Icon name="check" className="mt-0.5 size-4 shrink-0 text-[#00d4ff]" />
          <span>{right}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
      <JsonLd data={pageJsonLd} />
      <Breadcrumbs items={[{ label: "Privacy" }]} />

      <div className="mt-6 flex flex-col gap-4">
        <SectionHeading
          eyebrow="Privacy e cookie"
          title="Informativa privacy"
          description="In chiaro, senza avvocatese: questo sito non ti traccia, non usa cookie di profilazione e non ha nessun database di utenti."
        />
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Ultimo aggiornamento: {formatDate(site.privacyUpdated)}
        </p>
      </div>

      {/* Riassunto: la frase che conta, prima dei dettagli */}
      <Reveal className="mt-10">
        <div className="card border-l-2 border-l-[#7c6cff] p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-white">In sintesi</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
            Uso <strong className="text-white">solo i dati che mi dai tu</strong> nel
            form dei contatti — nome, email e il testo del messaggio — e li uso{" "}
            <strong className="text-white">
              unicamente per leggere la tua richiesta e risponderti
            </strong>
            . Nient&apos;altro: niente newsletter, niente pubblicità, niente
            profilazione, niente dati venduti o ceduti a terzi per scopi commerciali.
            Se non compili il form, di te non raccolgo nulla.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              "Nessun cookie di tracciamento",
              "Nessun Google Analytics",
              "Nessun pixel pubblicitario",
              "Nessuna newsletter",
            ].map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal className="mt-12">
        <div className="flex flex-col gap-10 text-sm leading-relaxed text-zinc-400 sm:text-base">
          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Chi tratta i tuoi dati
            </h2>
            <p>
              Il titolare del trattamento è{" "}
              <strong className="text-zinc-200">{site.name}</strong>, persona fisica
              che gestisce questo sito senza una struttura alle spalle. Per qualunque
              cosa riguardi i tuoi dati puoi scrivermi a{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-[#00d4ff] underline decoration-dotted underline-offset-4 hover:text-white"
              >
                {site.email}
              </a>
              .
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Quali dati raccolgo e perché
            </h2>
            <p>
              Gli unici dati personali che ricevo sono quelli che scrivi
              volontariamente nel form della pagina Contatti:
            </p>
            <ul className="flex flex-col gap-2">
              <li className="flex gap-2.5">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-[#00d4ff]" />
                <span>
                  <strong className="text-zinc-200">nome</strong>, per sapere come
                  rivolgermi a te;
                </span>
              </li>
              <li className="flex gap-2.5">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-[#00d4ff]" />
                <span>
                  <strong className="text-zinc-200">indirizzo email</strong>, per
                  risponderti;
                </span>
              </li>
              <li className="flex gap-2.5">
                <Icon name="check" className="mt-0.5 size-4 shrink-0 text-[#00d4ff]" />
                <span>
                  <strong className="text-zinc-200">messaggio</strong>, cioè quello che
                  mi racconti.
                </span>
              </li>
            </ul>
            <p>
              La finalità è una sola:{" "}
              <strong className="text-zinc-200">
                leggere la tua richiesta e risponderti
              </strong>
              . La base giuridica è l&apos;articolo 6, paragrafo 1, lettera b) del GDPR:
              il trattamento è necessario per rispondere a una richiesta che hai fatto
              tu (misure precontrattuali). Non c&apos;è nessun consenso da spuntare per
              questo, perché non c&apos;è nessun trattamento ulteriore: se non vuoi che
              io tratti questi dati, semplicemente non inviare il form.
            </p>
            <p>
              Il modulo ha anche un campo nascosto che serve solo a fermare i bot
              (le cosiddette &laquo;esche&raquo;): se viene compilato, il messaggio non
              mi arriva e quei dati vengono buttati via senza essere letti né salvati.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Dove finiscono i messaggi
            </h2>
            <p>
              Il sito non ha un database e non salva i messaggi sul server. Quando premi
              &laquo;Invia messaggio&raquo; succede questo, in ordine:
            </p>
            <ol className="flex flex-col gap-2.5">
              <li className="flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold text-zinc-200">
                  1
                </span>
                <span>
                  il messaggio arriva al server di questo sito, ospitato su{" "}
                  <strong className="text-zinc-200">Vercel</strong>, che lo controlla (per
                  esempio per limitare gli abusi) e lo gira subito;
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold text-zinc-200">
                  2
                </span>
                <span>
                  il server lo affida a <strong className="text-zinc-200">FormSubmit</strong>{" "}
                  (formsubmit.co), un servizio che inoltra i moduli via email;
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold text-zinc-200">
                  3
                </span>
                <span>
                  il messaggio arriva nella mia casella email (
                  <strong className="text-zinc-200">Gmail</strong>), dove resta finché
                  serve per risponderti.
                </span>
              </li>
            </ol>
            <p>
              Vercel, FormSubmit e Google sono fornitori indipendenti: trattano i dati
              per erogare il proprio servizio e possono farlo anche fuori dall&apos;Unione
              Europea, sulla base delle clausole contrattuali standard previste dal GDPR.
              Io non ho alcun controllo sui loro sistemi, quindi se ti serve il dettaglio
              di come trattano i dati per conto proprio, la fonte corretta sono le loro
              informative.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Per quanto tempo li conservo
            </h2>
            <p>
              I messaggi restano nella mia casella email per il tempo necessario a
              risponderti e a tenere traccia dello scambio; se non c&apos;è più motivo di
              conservarli li cancello, e comunque entro <strong>24 mesi</strong>. I
              messaggi a cui non è servito rispondere (spam, richieste duplicate) vengono
              eliminati prima. Sul sito non c&apos;è nessun archivio: se cancelli il
              messaggio dalla casella, quel messaggio non esiste più da nessuna parte.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Cookie e strumenti di tracciamento
            </h2>
            <p>
              Questo sito <strong className="text-zinc-200">non usa cookie</strong>: né
              tecnici, né di profilazione, né di terze parti. Non c&apos;è Google
              Analytics, non ci sono pixel pubblicitari, non ci sono pulsanti social che
              ti tracciano mentre leggi, e persino i caratteri tipografici vengono
              serviti da questo sito invece che da un servizio esterno.
            </p>
            <p>
              Per questo non trovi un pulsante &laquo;Rifiuta&raquo;: non c&apos;è nulla da
              rifiutare, e un consenso chiesto quando non serve sarebbe solo una perdita
              di tempo per te. L&apos;avviso che vedi alla prima visita serve a dirtelo in
              chiaro.
            </p>
            <p>
              Una sola informazione viene salvata nel tuo browser: una piccola preferenza
              locale (nello spazio <code className="rounded bg-white/10 px-1.5 py-0.5 text-[13px] text-zinc-200">localStorage</code>,
              chiave{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[13px] text-zinc-200">
                ak-avviso-cookie
              </code>
              ) che ricorda soltanto che hai già letto l&apos;avviso, così non te lo
              rimostro a ogni pagina. Non identifica nessuno, non esce dal tuo browser,
              non viene mai inviata a me: puoi cancellarla svuotando i dati del sito dalle
              impostazioni del browser.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Cosa fanno i fornitori di hosting
            </h2>
            <p>
              Come tutti i siti web, il fornitore che ospita queste pagine può registrare
              dati tecnici di connessione (per esempio indirizzo IP, data e ora, pagina
              richiesta e tipo di browser) per far funzionare il servizio, prevenire
              abusi e garantire la sicurezza. Non uso quei registri per profilare chi
              visita il sito, non li incrocio con altro e non li ho scelti io: sono parte
              del funzionamento normale di un servizio di hosting.
            </p>
            <p>
              Il form di contatto ha anche una protezione anti-abuso: il server tiene
              temporaneamente in memoria il numero di invii da un certo indirizzo IP
              (massimo 5 ogni 10 minuti). È un&apos;informazione che vive solo nella
              memoria del server e si azzera da sola; non viene scritta su disco né
              usata per altro.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              I tuoi diritti
            </h2>
            <p>
              In qualunque momento puoi chiedermi, scrivendo a{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-[#00d4ff] underline decoration-dotted underline-offset-4 hover:text-white"
              >
                {site.email}
              </a>
              :
            </p>
            <RightsList />
            <p>
              Rispondo entro un mese, di solito molto prima. Se ritieni che i tuoi dati
              siano stati trattati in modo scorretto puoi rivolgerti all&apos;autorità di
              controllo italiana, il{" "}
              <a
                href="https://www.garanteprivacy.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00d4ff] underline decoration-dotted underline-offset-4 hover:text-white"
              >
                Garante per la protezione dei dati personali
              </a>
              , oppure all&apos;autorità giudiziaria.
            </p>
          </article>

          <article className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Minori e modifiche
            </h2>
            <p>
              Il form non è pensato per i minori: se hai meno di 14 anni, chiedi a chi
              esercita la responsabilità genitoriale prima di scrivermi.
            </p>
            <p>
              Se un giorno cambierò qualcosa in questo sito — per esempio aggiungendo un
              servizio che raccoglie statistiche — aggiornerò questa pagina e la data in
              alto <em>prima</em> di attivarlo, così potrai leggere cosa cambia.
            </p>
          </article>
        </div>
      </Reveal>

      <Reveal className="mt-14">
        <div className="card flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Hai una domanda sui tuoi dati?
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Scrivimi: anche solo per chiedere cosa conservo su di te.
            </p>
          </div>
          <Link
            href="/contatti"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Vai ai contatti
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

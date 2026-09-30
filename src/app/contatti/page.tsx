import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm, CopyEmailButton } from "@/components/contact-form";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SocialLinks } from "@/components/social-links";
import { ogImage } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Contatta Ahsen Kurtoski: email, social e form per collaborazioni, progetti o semplici domande.",
  keywords: ["contattare Ahsen Kurtoski", "Ahsen Kurtoski email"],
  alternates: { canonical: "/contatti" },
  openGraph: {
    title: "Contatti — Ahsen Kurtoski",
    description:
      "Scrivi ad Ahsen Kurtoski per collaborazioni, progetti o domande.",
    url: `${site.url}/contatti`,
    type: "website",
    images: [
      ogImage({
        title: "Contatti",
        subtitle: "Email, social e form per scrivermi",
      }),
    ],
  },
};

const faqs = site.faqs;

/** Dati strutturati FAQPage: Google può mostrare queste domande nei risultati */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function ContattiPage() {
  const emailIsPlaceholder = site.email.includes("example.com");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <JsonLd data={faqJsonLd} />
      <Breadcrumbs items={[{ label: "Contatti" }]} />

      <Reveal className="mt-6 flex flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow="Contatti"
          title="Parliamo dei tuoi progetti"
          description="Hai una domanda, un'idea o vuoi semplicemente salutarmi? Scegli il canale che preferisci: rispondo sempre."
        />

        {emailIsPlaceholder && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            ⚠️ L&apos;email di contatto è ancora un placeholder: configura{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">
              CONTACT_EMAIL
            </code>{" "}
            tra le variabili d&apos;ambiente per ricevere i messaggi a un
            indirizzo reale.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <Reveal>
            <ContactForm />
          </Reveal>

          <div className="flex flex-col gap-5">
            <Reveal delay={90}>
              <div className="card flex flex-col gap-4 p-6">
                <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#00d4ff]">
                  <Icon name="mail" className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-white">Email diretta</h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    Il modo più veloce per raggiungermi.
                  </p>
                </div>
                <p className="break-all font-mono text-sm text-[#00d4ff]">
                  {site.email}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${site.email}`}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-4 py-2 text-xs font-semibold text-white"
                  >
                    <Icon name="mail" className="size-4" />
                    Scrivi adesso
                  </a>
                  <CopyEmailButton />
                </div>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="card flex flex-col gap-4 p-6">
                <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#7c6cff]">
                  <Icon name="globe" className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-white">Social</h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    Seguimi per vedere i progetti mentre li costruisco.
                  </p>
                </div>
                <SocialLinks />
                <p className="inline-flex items-center gap-2 text-sm text-zinc-400">
                  <Icon name="map-pin" className="size-4" />
                  {site.location}
                </p>
              </div>
            </Reveal>

            <Reveal delay={230}>
              <div className="card flex flex-col gap-4 p-6">
                <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#00d4ff]">
                  <Icon name="fiverr" className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-white">Servizi su Fiverr</h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    Preferisci fare tutto dall&apos;app? Puoi ordinare i miei servizi
                    direttamente su Fiverr, con pagamento protetto.
                  </p>
                </div>
                <a
                  href={site.socials.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Vedi il mio profilo
                  <Icon name="arrow-up-right" className="size-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Domande frequenti
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 80}>
                <div className="card h-full p-6">
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {faq.answer}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

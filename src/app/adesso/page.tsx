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
  title: "Adesso",
  description:
    "Cosa sta imparando e costruendo Ahsen Kurtoski proprio adesso: le cose su cui sta lavorando in questo periodo, non il riassunto della sua vita.",
  keywords: [
    "Ahsen Kurtoski adesso",
    "Ahsen Kurtoski cosa sta imparando",
    "now page Ahsen Kurtoski",
  ],
  alternates: { canonical: "/adesso" },
  openGraph: {
    title: "Adesso — Ahsen Kurtoski",
    description:
      "Cosa sto imparando e costruendo in questo periodo, aggiornato di tanto in tanto.",
    url: `${site.url}/adesso`,
    type: "website",
    images: [
      ogImage({
        title: "Adesso",
        subtitle: "Cosa sto imparando e costruendo in questo periodo",
      }),
    ],
  },
};

/** La data di aggiornamento dice a Google (e a chi legge) quanto è fresca la pagina */
const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Adesso",
  url: `${site.url}/adesso`,
  inLanguage: "it-IT",
  isPartOf: {
    "@type": "WebSite",
    name: `${site.name} — Sito ufficiale`,
    url: site.url,
  },
  dateModified: site.nowUpdated,
  about: { "@type": "Person", name: site.name, url: site.url },
};

export default function AdessoPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <JsonLd data={pageJsonLd} />
      <Breadcrumbs items={[{ label: "Adesso" }]} />

      <Reveal className="mt-6 flex flex-col gap-6">
        <SectionHeading
          eyebrow="Adesso"
          title="A cosa sto lavorando adesso"
          description="La biografia racconta il percorso; questa pagina invece dice cosa sto imparando e costruendo in questo preciso momento. La aggiorno di tanto in tanto, senza fretta."
        />

        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Ultimo aggiornamento: {formatDate(site.nowUpdated)}
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {site.now.map((section, index) => (
          <Reveal key={section.title} delay={index * 90}>
            <div className="card flex h-full flex-col gap-4 p-6">
              <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#00d4ff]">
                <Icon name={section.icon} className="size-5" />
              </span>
              <h2 className="font-semibold text-white">{section.title}</h2>
              <ul className="flex flex-col gap-2 text-sm leading-relaxed text-zinc-400">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Icon
                      name="check"
                      className="mt-0.5 size-4 shrink-0 text-[#00d4ff]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8">
        <p className="text-sm leading-relaxed text-zinc-400">
          Se una di queste cose ti incuriosisce, sul{" "}
          <Link
            href="/blog"
            className="text-[#00d4ff] underline decoration-dotted underline-offset-4 transition-colors hover:text-white"
          >
            blog
          </Link>{" "}
          scrivo di quello che imparo mentre lo imparo.
        </p>
      </Reveal>

      <section className="mt-14">
        <Reveal>
          <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Su cosa stai lavorando tu?
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Raccontamelo: mi piacciono le storie di chi costruisce cose.
              </p>
            </div>
            <Link
              href="/contatti"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Scrivimi
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SocialLinks } from "@/components/social-links";
import { ogImage } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Chi è Axsen Kurtoski? Biografia, percorso e competenze" },
  description:
    "Chi è Axsen Kurtoski: la sua storia, il suo percorso da developer e creatore digitale, le competenze e i progetti che porta avanti.",
  keywords: [
    "Axsen Kurtoski chi è",
    "chi è Axsen Kurtoski",
    "Axsen Kurtoski biografia",
    "Axsen Kurtoski developer",
  ],
  alternates: { canonical: "/chi-sono" },
  openGraph: {
    title: "Chi sono — Axsen Kurtoski",
    description:
      "La storia, il percorso e le competenze di Axsen Kurtoski, developer e creatore digitale.",
    url: `${site.url}/chi-sono`,
    type: "profile",
    images: [
      ogImage({
        title: "Chi è Axsen Kurtoski",
        subtitle: "Biografia, percorso e competenze",
      }),
    ],
  },
};

const facts = [
  { label: "Nome completo", value: site.name, icon: "sparkles" as const },
  { label: "Dove vivo", value: site.location, icon: "map-pin" as const },
  {
    label: "Cosa faccio",
    value: "Developer & Creator digitale",
    icon: "code" as const,
  },
  { label: "Email", value: site.email, icon: "mail" as const },
];

export default function ChiSonoPage() {
  return (
    <>
      {/* Intestazione */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="flex flex-col gap-6">
              <Breadcrumbs items={[{ label: "Chi sono" }]} />

              <SectionHeading
                eyebrow="Biografia"
                title="Chi è Axsen Kurtoski?"
                description="Il riassunto ufficiale, in poche righe: chi sono, cosa faccio e dove sto andando."
              />

              <div className="flex flex-col gap-4 text-base leading-relaxed text-zinc-300">
                {site.longBio.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>

              <SocialLinks className="pt-2" />
            </div>

            <Reveal delay={120}>
              <div className="card flex flex-col gap-6 p-7">
                <div className="flex items-center gap-4">
                  <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#7c6cff] to-[#00d4ff] text-xl font-bold text-white">
                    {site.initials}
                  </span>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-white">
                      {site.name}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Developer & Creatore digitale
                    </p>
                  </div>
                </div>

                <dl className="flex flex-col gap-4 border-t border-[var(--color-border)] pt-6 text-sm">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-start gap-3">
                      <Icon
                        name={fact.icon}
                        className="mt-0.5 size-4 shrink-0 text-[#00d4ff]"
                      />
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-zinc-500">
                          {fact.label}
                        </dt>
                        <dd className="text-zinc-200">{fact.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Percorso */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Percorso"
            title="Come sono arrivato qui"
            description="Le tappe principali del mio percorso, dalla prima riga di codice a oggi."
          />

          <ol className="relative flex flex-col gap-8 border-l border-[var(--color-border)] pl-6">
            {site.timeline.map((step, index) => (
              <Reveal key={step.year} delay={index * 90}>
                <li className="relative">
                  <span
                    className="absolute -left-[31px] top-1.5 size-2.5 rounded-full bg-gradient-to-br from-[#7c6cff] to-[#00d4ff]"
                    aria-hidden
                  />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00d4ff]">
                    {step.year}
                  </p>
                  <h3 className="mt-1.5 font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Competenze */}
      <section className="border-y border-white/5 bg-[#0b0b11]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Competenze"
              title="Con cosa lavoro"
              description="Le tecnologie e le abilità su cui costruisco i miei progetti."
            />
            <ul className="flex flex-wrap gap-2.5">
              {site.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Lavoriamo insieme?
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Scrivimi per una collaborazione, un progetto o una semplice
                domanda.
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
    </>
  );
}

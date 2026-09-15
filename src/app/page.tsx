import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SocialLinks } from "@/components/social-links";
import { TypingRole } from "@/components/typing-role";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

// ⚠️ Personalizza qui i tuoi progetti
const projects: {
  title: string;
  description: string;
  tags: string[];
  icon: IconName;
  href: string;
}[] = [
  {
    title: "Questo sito",
    description:
      "Il sito che stai guardando: Next.js, Tailwind CSS e tanta attenzione per SEO e performance.",
    tags: ["Next.js", "Tailwind", "SEO"],
    icon: "layers",
    href: "/chi-sono",
  },
  {
    title: "Progetti su GitHub",
    description:
      "Esperimenti, piccoli tool e codice aperto: qui tengo traccia di tutto quello che costruisco.",
    tags: ["Open source", "JavaScript"],
    icon: "code",
    href: site.socials.github || "/contatti",
  },
  {
    title: "Articoli del blog",
    description:
      "Guide e riflessioni su sviluppo web, design e strumenti: scrivere mi aiuta a capire meglio.",
    tags: ["Blog", "Divulgazione"],
    icon: "sparkles",
    href: "/blog",
  },
];

const services: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Sviluppo web",
    description:
      "Siti e interfacce moderne con HTML, CSS, JavaScript, React e Next.js.",
    icon: "code",
  },
  {
    title: "UI & UX design",
    description:
      "Layout chiari, accessibili e piacevoli, pensati prima per le persone e poi per i pixel.",
    icon: "palette",
  },
  {
    title: "Contenuti & SEO",
    description:
      "Testi e articoli che si fanno trovare su Google e raccontano storie vere.",
    icon: "zap",
  },
];

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
        <div
          className="glow pointer-events-none absolute -top-52 left-1/2 h-[420px] w-[720px] max-w-full -translate-x-1/2"
          aria-hidden
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00d4ff] opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-[#00d4ff]" />
              </span>
              {site.availability}
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ciao, sono <span className="text-gradient">Axsen Kurtoski</span>
            </h1>

            <p className="text-lg text-zinc-300 sm:text-xl">
              <TypingRole />
            </p>

            <p className="max-w-xl text-base leading-relaxed text-zinc-400">
              {site.shortBio}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/chi-sono"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c6cff]/25 transition-transform hover:scale-[1.03]"
              >
                Scopri chi sono
                <Icon name="arrow-right" className="size-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Leggi il blog
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <SocialLinks />
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <Icon name="map-pin" className="size-4" />
                {site.location}
              </span>
            </div>
          </div>

          <Reveal delay={120}>
            <div className="card p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#7c6cff] to-[#00d4ff] text-xl font-bold text-white shadow-lg shadow-[#7c6cff]/25">
                  {site.initials}
                </span>
                <div>
                  <p className="font-semibold tracking-tight text-white">
                    {site.name}
                  </p>
                  <p className="text-sm text-zinc-400">Developer & Creator</p>
                </div>
              </div>

              <ul className="mt-6 flex flex-col gap-3 text-sm">
                <li className="flex items-center gap-2.5 text-zinc-300">
                  <Icon name="globe" className="size-4 text-[#00d4ff]" />
                  Sito ufficiale: axsenkurtoski.com
                </li>
                <li className="flex items-center gap-2.5 text-zinc-300">
                  <Icon name="mail" className="size-4 text-[#00d4ff]" />
                  <a
                    href={`mailto:${site.email}`}
                    className="transition-colors hover:text-white"
                  >
                    {site.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-300">
                  <Icon name="graduation-cap" className="size-4 text-[#00d4ff]" />
                  Sempre in modalità apprendimento
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-5">
                {["Curioso", "Autodidatta", "Creativo"].map((trait) => (
                  <span
                    key={trait}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- CHI È (anteprima) ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Chi è Axsen Kurtoski"
            title="Una persona, tanti progetti"
            description={site.longBio[0]}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 90}>
                <div className="card h-full p-6">
                  <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#00d4ff]">
                    <Icon name={service.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {service.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div>
            <Link
              href="/chi-sono"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00d4ff] transition-colors hover:text-white"
            >
              Leggi la mia storia completa
              <Icon name="arrow-up-right" className="size-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- SKILL ---------- */}
      <section className="border-y border-white/5 bg-[#0b0b11]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="flex flex-col gap-10">
            <SectionHeading
              eyebrow="Competenze"
              title="Gli strumenti che uso ogni giorno"
              description="Tecnologie e abilità che metto in pratica nei miei progetti, dal design al deploy."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              {site.skills.map((skill, index) => (
                <Reveal key={skill.name} delay={index * 60}>
                  <div className="card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">
                        {skill.name}
                      </span>
                      <span className="text-xs tabular-nums text-zinc-500">
                        {skill.level}%
                      </span>
                    </div>
                    <div
                      className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5"
                      role="img"
                      aria-label={`${skill.name}: ${skill.level} su 100`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff]"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- PROGETTI ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Progetti"
            title="Cose che ho costruito"
            description="Una selezione di quello che faccio: siti, esperimenti e contenuti."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {projects.map((project, index) => {
              const isExternal = project.href.startsWith("http");
              const Card = (
                <div className="card flex h-full flex-col p-6">
                  <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#7c6cff]">
                    <Icon name={project.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">
                    {project.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
              return (
                <Reveal key={project.title} delay={index * 90}>
                  {isExternal ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {Card}
                    </a>
                  ) : (
                    <Link href={project.href} className="block h-full">
                      {Card}
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* ---------- BLOG ---------- */}
      <section className="border-y border-white/5 bg-[#0b0b11]">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="flex flex-col gap-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Blog"
                title="Ultimi articoli"
                description="Appunti, guide e riflessioni su web, design e crescita personale."
              />
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Tutti gli articoli
                <Icon name="arrow-right" className="size-4" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal key={post.slug} delay={index * 90}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
        <Reveal>
          <div className="card relative overflow-hidden p-8 text-center sm:p-12">
            <div
              className="glow pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] max-w-full -translate-x-1/2 opacity-70"
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Vuoi parlare con me?
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                Per collaborazioni, domande o anche solo per scambiare due
                chiacchiere su tech: scrivimi, rispondo sempre.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c6cff]/25 transition-transform hover:scale-[1.03]"
                >
                  <Icon name="mail" className="size-4" />
                  Scrivimi una email
                </a>
                <Link
                  href="/contatti"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Vai ai contatti
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

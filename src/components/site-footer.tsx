import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { Icon } from "./icons";
import { SocialLinks } from "./social-links";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/5 bg-[#0b0b11]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#7c6cff] to-[#00d4ff] text-sm font-bold text-white">
              {site.initials}
            </span>
            <span className="font-semibold tracking-tight text-white">
              {site.name}
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
            {site.shortBio}
          </p>
          <SocialLinks />
        </div>

        <nav aria-label="Link del sito" className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Naviga
          </h2>
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="/feed.xml"
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Feed RSS
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Contatti
          </h2>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <Icon name="mail" className="size-4" />
            {site.email}
          </a>
          <p className="inline-flex items-center gap-2 text-sm text-zinc-400">
            <Icon name="map-pin" className="size-4" />
            {site.location}
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-[#00d4ff]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00d4ff] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#00d4ff]" />
            </span>
            {site.availability}
          </p>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {site.name}. Tutti i diritti riservati.
          </p>
          <p className="inline-flex items-center gap-1.5">
            Costruito con Next.js e Tailwind CSS
            <Icon name="zap" className="size-3.5 text-[#7c6cff]" />
          </p>
        </div>
      </div>
    </footer>
  );
}

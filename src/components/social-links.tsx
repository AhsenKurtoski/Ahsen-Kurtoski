import { site } from "@/lib/site";
import { Icon, type IconName } from "./icons";

const iconFor: Record<string, IconName> = {
  github: "github",
  linkedin: "linkedin",
  instagram: "instagram",
  fiverr: "fiverr",
  x: "x",
  youtube: "youtube",
};

/** Nomi scritti come si scrivono davvero, per gli screen reader */
const labelFor: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  fiverr: "Fiverr",
  x: "X",
  youtube: "YouTube",
};

/** Icone social (i link vuoti in site.socials vengono nascosti automaticamente). */
export function SocialLinks({
  className = "",
  size = "size-5",
}: {
  className?: string;
  size?: string;
}) {
  const entries = (Object.entries(site.socials) as [string, string][]).filter(
    ([, href]) => href.length > 0,
  );

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {entries.map(([key, href]) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.name} su ${labelFor[key] ?? key}`}
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-[#7c6cff] hover:text-white"
          >
            <Icon name={iconFor[key] ?? "globe"} className={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}

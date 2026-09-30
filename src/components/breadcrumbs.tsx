import Link from "next/link";
import { site } from "@/lib/site";
import { JsonLd } from "./json-ld";

/**
 * Percorso di navigazione visibile, con dati strutturati BreadcrumbList
 * che Google può mostrare nei risultati di ricerca.
 */
export function Breadcrumbs({
  items,
  className = "",
}: {
  /** Voci dopo la Home; l'ultima è quella corrente (senza link) */
  items: { label: string; href?: string }[];
  className?: string;
}) {
  const all = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `${site.url}${item.href === "/" ? "" : item.href}` }
        : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Percorso" className={`text-xs text-zinc-400 ${className}`}>
        {all.map((item, index) => {
          const isLast = index === all.length - 1;
          return (
            <span key={`${item.label}-${index}`}>
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-300" aria-current="page">
                  {item.label}
                </span>
              )}
              {!isLast && <span className="mx-2">/</span>}
            </span>
          );
        })}
      </nav>
    </>
  );
}

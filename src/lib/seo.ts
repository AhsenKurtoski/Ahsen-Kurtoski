import { site } from "@/lib/site";

type OgImageInput = {
  /** Titolo mostrato nell'anteprima social */
  title: string;
  /** Riga di supporto (di solito la description della pagina) */
  subtitle?: string;
};

const MAX_TITLE = 68;
const MAX_SUBTITLE = 92;

/** Accorcia una stringa senza spezzare le parole, aggiungendo i puntini */
function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Immagine Open Graph per una pagina interna, generata dal route handler /og.
 * L'URL è relativo: Next lo rende assoluto con il `metadataBase` del layout,
 * così segue sempre il dominio configurato in NEXT_PUBLIC_SITE_URL.
 */
export function ogImage({ title, subtitle }: OgImageInput) {
  const params = new URLSearchParams({ title: clamp(title, MAX_TITLE) });
  if (subtitle) params.set("subtitle", clamp(subtitle, MAX_SUBTITLE));

  return {
    url: `/og?${params.toString()}`,
    width: 1200,
    height: 630,
    alt: `${title} — ${site.name}`,
  };
}

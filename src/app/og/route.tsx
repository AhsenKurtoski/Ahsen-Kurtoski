import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/og-template";
import { site } from "@/lib/site";

/**
 * Genera l'immagine Open Graph di una pagina a partire dai parametri:
 *   /og?title=Blog&subtitle=Articoli su sviluppo web
 * Usata dalle pagine interne tramite l'helper `ogImage()` in src/lib/seo.ts.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? site.name).slice(0, 120);
  const subtitle = searchParams.get("subtitle")?.slice(0, 140) ?? undefined;

  return new ImageResponse(
    <OgCard eyebrow={`${site.name} — Sito ufficiale`} title={title} subtitle={subtitle} />,
    {
      ...OG_SIZE,
      headers: {
        "Content-Type": OG_CONTENT_TYPE,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}

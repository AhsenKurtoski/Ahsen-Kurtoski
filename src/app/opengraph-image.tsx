import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/og-template";
import { site } from "@/lib/site";

export const alt = `${site.name} — Developer & Creatore digitale`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  const domain = site.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Sito ufficiale"
        title={site.name}
        subtitle="Developer & Creatore digitale"
        footer={`Chi è, progetti e blog — ${domain}`}
      />
    ),
    { ...OG_SIZE },
  );
}

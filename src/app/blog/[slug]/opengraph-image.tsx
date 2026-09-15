import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { site } from "@/lib/site";

export const alt = `Articolo del blog di ${site.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Genera l'anteprima social di ogni articolo in fase di build */
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? `${site.name} — Blog`;
  const tags = post?.tags ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(140deg, #0a0a0f 0%, #1b1648 60%, #0b4a5c 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #7c6cff, #00d4ff)",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {site.initials}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#c7d2fe" }}>
            {site.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#a5b4fc" }}>
          {tags.length > 0 ? tags.join("  ·  ") : "Blog"}
        </div>
      </div>
    ),
    { ...size },
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icons";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { ogImage } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog: sviluppo web, strumenti e tutorial",
  description:
    "Il blog di Ahsen: guide pratiche su sviluppo web, design, SEO e strumenti digitali, con appunti dal suo percorso quotidiano di studente e sviluppatore.",
  keywords: [
    "Ahsen blog",
    "blog sviluppo web",
    "articoli programmazione",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Ahsen Studio",
    description:
      "Articoli su sviluppo web, design, SEO e crescita personale, scritti da Ahsen.",
    url: `${site.url}/blog`,
    type: "website",
    images: [
      ogImage({
        title: "Il blog di Ahsen",
        subtitle: "Sviluppo web, design, SEO e crescita personale",
      }),
    ],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <Breadcrumbs items={[{ label: "Blog" }]} />

      <Reveal className="mt-6 flex flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow="Blog"
          title="Il blog di Ahsen"
          description="Scrivo di sviluppo web, design, SEO e di tutto quello che imparo costruendo cose. Nuovi articoli in arrivo, torna presto!"
        />

        {posts.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Ancora nessun articolo pubblicato. Torna a trovarmi presto!
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 80}>
                <PostCard post={post} headingLevel={2} />
              </Reveal>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/5 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Esplora per argomento
            </h2>
            <ul className="flex flex-wrap gap-2">
              {tags.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/tag/${item.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-300 transition-colors hover:border-[#7c6cff] hover:text-white"
                  >
                    <Icon name="arrow-up-right" className="size-3.5" />
                    {item.tag}
                    <span className="text-zinc-400">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>
    </section>
  );
}

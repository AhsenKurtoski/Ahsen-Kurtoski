import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icons";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getAllTags, getPostsByTagSlug, getTagLabel } from "@/lib/posts";
import { ogImage } from "@/lib/seo";
import { site } from "@/lib/site";

type PageProps = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return getAllTags().map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const label = getTagLabel(tag);
  const posts = getPostsByTagSlug(tag);
  if (posts.length === 0) return { title: "Tag non trovato" };

  return {
    title: `Articoli su ${label}`,
    description: `${posts.length} articoli del blog di ${site.name} sul tema ${label}: guide, appunti e riflessioni dal suo percorso.`,
    keywords: [label, `${label} articoli`, `blog ${label}`, site.name],
    alternates: { canonical: `/blog/tag/${tag}` },
    openGraph: {
      title: `Articoli su ${label} — ${site.name}`,
      description: `Tutti gli articoli di ${site.name} sul tema ${label}.`,
      url: `${site.url}/blog/tag/${tag}`,
      type: "website",
      images: [
        ogImage({
          title: `Articoli su ${label}`,
          subtitle: `Tutti gli articoli di ${site.name} sul tema ${label}`,
        }),
      ],
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTagSlug(tag);
  if (posts.length === 0) notFound();

  const label = getTagLabel(tag);
  const otherTags = getAllTags().filter((item) => item.slug !== tag);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: `Articoli su ${label}` },
        ]}
      />

      <Reveal className="mt-6 flex flex-col gap-10">
        <SectionHeading
          eyebrow="Archivio tag"
          title={`Articoli su ${label}`}
          description={`Tutti gli articoli del blog che parlano di ${label}.`}
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 80}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>

        {otherTags.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/5 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Altri argomenti
            </h2>
            <ul className="flex flex-wrap gap-2">
              {otherTags.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/tag/${item.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-300 transition-colors hover:border-[#7c6cff] hover:text-white"
                  >
                    <Icon name="arrow-up-right" className="size-3.5" />
                    {item.tag}
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

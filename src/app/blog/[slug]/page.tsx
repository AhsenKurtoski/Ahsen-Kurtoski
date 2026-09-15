import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icons";
import { PostCard } from "@/components/post-card";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/reveal";
import {
  formatDate,
  getAllPosts,
  getPostBySlug,
  tagToSlug,
} from "@/lib/posts";
import { site } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Articolo non trovato" };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...post.tags, site.name, `${post.title} ${site.name}`],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [site.name],
      tags: [...post.tags],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getAllPosts()
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  const shareUrl = `${site.url}/blog/${post.slug}`;
  const shareText = encodeURIComponent(`${post.title} — di ${site.name}`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "it-IT",
    keywords: post.tags.join(", "),
    articleSection: post.tags[0],
    mainEntityOfPage: { "@type": "WebPage", "@id": shareUrl },
    author: { "@type": "Person", name: site.name, url: site.url },
    publisher: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgress />

      <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Breadcrumbs
          items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
        />

        <header className="mt-6 flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tagToSlug(tag)}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-300 transition-colors hover:border-[#7c6cff] hover:text-white"
              >
                {tag}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>

          <p className="text-base leading-relaxed text-zinc-400">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 border-y border-[var(--color-border)] py-4 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#7c6cff] to-[#00d4ff] text-[10px] font-bold text-white">
                {site.initials}
              </span>
              <span className="text-zinc-300">{site.name}</span>
            </span>
            <time dateTime={post.date} className="inline-flex items-center gap-1.5">
              <Icon name="calendar" className="size-4" />
              {formatDate(post.date)}
            </time>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" className="size-4" />
              {post.readTime} di lettura
            </span>
          </div>
        </header>

        <div
          className="prose-blog mt-10"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-6">
          <span className="text-sm text-zinc-400">Condividi:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-zinc-300 transition-colors hover:text-white"
          >
            <Icon name="x" className="size-4" />X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-zinc-300 transition-colors hover:text-white"
          >
            <Icon name="linkedin" className="size-4" />
            LinkedIn
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-zinc-300 transition-colors hover:text-white"
          >
            <Icon name="send" className="size-4" />
            WhatsApp
          </a>
        </div>

        <Link
          href="/blog"
          className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-[#00d4ff] transition-colors hover:text-white"
        >
          <Icon name="chevron-left" className="size-4" />
          Torna a tutti gli articoli
        </Link>
      </article>

      {related.length > 0 && (
        <section className="border-t border-white/5 bg-[#0b0b11]">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Continua a leggere
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.slug} delay={index * 80}>
                  <PostCard post={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

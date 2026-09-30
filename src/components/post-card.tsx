import Link from "next/link";
import { formatDate, tagToSlug, type Post } from "@/lib/posts";
import { Icon } from "./icons";

export function PostCard({
  post,
  headingLevel = 3,
}: {
  post: Post;
  /** Livello del titolo: 2 quando la card è contenuto di primo livello della pagina. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className="card group flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <time
          dateTime={post.date}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]"
        >
          <Icon name="calendar" className="size-4" />
          {formatDate(post.date)}
        </time>
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <Icon name="clock" className="size-4" />
          {post.readTime}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tagToSlug(tag)}`}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-300 transition-colors hover:border-[#7c6cff] hover:text-white"
            >
              {tag}
            </Link>
          ))}
        </div>

        <Heading className="text-lg font-semibold leading-snug text-white">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-[#00d4ff]"
          >
            {post.title}
          </Link>
        </Heading>

        <p className="text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-[#00d4ff]"
        >
          Leggi l&apos;articolo
          <Icon
            name="arrow-right"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}

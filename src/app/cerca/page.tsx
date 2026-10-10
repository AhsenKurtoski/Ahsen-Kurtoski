import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icons";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/reveal";
import { SearchForm } from "@/components/search-form";
import { SectionHeading } from "@/components/section-heading";
import { getAllPosts, searchPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Cerca nel blog",
  description:
    "Cerca tra tutti gli articoli del blog di Ahsen: titoli, argomenti e testo completo.",
  alternates: { canonical: "/cerca" },
  // Una pagina di risultati è contenuto variabile e sottile: la mostro a chi la
  // usa, ma non chiedo a Google di indicizzarla.
  robots: { index: false, follow: true },
};

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

/** Il parametro può arrivare ripetuto (`?q=a&q=b`) o assente: prendo il primo. */
function pickQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 80);
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = pickQuery((await searchParams).q);
  const results = query ? searchPosts(query) : [];
  const totalPosts = getAllPosts().length;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: "Cerca" }]} />

      <Reveal className="mt-6 flex flex-col gap-8">
        <SectionHeading
          as="h1"
          eyebrow="Ricerca"
          title="Cerca nel blog"
          description="Scrivi una parola o una frase: cerco tra titoli, argomenti e testo completo di tutti gli articoli."
        />

        <SearchForm defaultValue={query} className="w-full max-w-xl" />

        {!query ? (
          <p className="text-sm leading-relaxed text-zinc-400">
            {totalPosts === 1
              ? "C'è 1 articolo da esplorare."
              : `Ci sono ${totalPosts} articoli da esplorare.`}{" "}
            Puoi anche{" "}
            <Link
              href="/blog"
              className="text-[#00d4ff] underline decoration-dotted underline-offset-4 transition-colors hover:text-white"
            >
              sfogliarli tutti
            </Link>
            .
          </p>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-zinc-400">
              {results.length}{" "}
              {results.length === 1 ? "articolo trovato" : "articoli trovati"} per{" "}
              <span className="font-medium text-white">«{query}»</span>.
            </p>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {results.map((post, index) => (
                <Reveal key={post.slug} delay={index * 80}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <div className="card flex flex-col items-start gap-3 p-6 sm:p-7">
            <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#00d4ff]">
              <Icon name="search" className="size-5" />
            </span>
            <h2 className="font-semibold text-white">
              Nessun risultato per «{query}»
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Prova con una parola più corta o più generica.
              {totalPosts > 0
                ? ` Oppure dai un'occhiata a tutti i ${totalPosts} articoli del blog.`
                : ""}
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              Vai al blog
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
        )}
      </Reveal>
    </section>
  );
}

import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-28 text-center sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00d4ff]">
        Errore 404
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Questa pagina non esiste
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-zinc-400">
        Forse il link è vecchio o c&apos;è un errore di battitura. Torna alla home
        oppure dai un&apos;occhiata al blog.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-5 py-3 text-sm font-semibold text-white"
        >
          <Icon name="chevron-left" className="size-4" />
          Torna alla home
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Vai al blog
        </Link>
      </div>
    </section>
  );
}

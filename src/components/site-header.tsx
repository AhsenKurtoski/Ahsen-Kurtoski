"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import { Icon } from "./icons";
import { SearchForm } from "./search-form";

export function SiteHeader() {
  const pathname = usePathname();
  /**
   * Il menu mobile è aperto solo sulla pagina in cui è stato aperto: salvo il
   * path e lo confronto con quello corrente. Così al cambio pagina (anche con
   * il tasto «indietro») si chiude da solo, senza setState dentro un effetto.
   */
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
  const setOpen = (value: boolean) => setMenuPath(value ? pathname : null);

  // Tasto Esc: chiude il menu, come si aspetta chi naviga da tastiera.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuPath(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#7c6cff] to-[#00d4ff] text-sm font-bold text-white shadow-lg shadow-[#7c6cff]/25"
          >
            {site.initials}
          </span>
          <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
            {site.firstName}
            {site.lastName ? (
              <>
                {" "}
                <span className="text-gradient">{site.lastName}</span>
              </>
            ) : null}
          </span>
          <span className="sr-only">— torna alla home</span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navigazione principale"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-sm transition-colors ${
                isActive(link.href)
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://ahsen-studio.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Portfolio
            <Icon name="arrow-up-right" className="size-3.5" />
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <SearchForm
            id="header-search"
            size="sm"
            className="hidden w-40 lg:block"
          />
          <Link
            href="/contatti"
            className="hidden rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#7c6cff]/20 transition-transform hover:scale-[1.03] lg:inline-flex"
          >
            Parliamone
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            className="grid size-10 place-items-center rounded-xl border border-white/10 text-white lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Navigazione mobile"
          className="border-t border-white/5 bg-[#0a0a0f]/95 lg:hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6">
            <SearchForm id="header-search-mobile" size="sm" className="mb-1" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-xl px-3 py-2.5 text-sm ${
                  isActive(link.href)
                    ? "bg-white/10 text-white"
                    : "text-zinc-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://ahsen-studio.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm text-zinc-400"
            >
              Portfolio
              <Icon name="arrow-up-right" className="size-3.5" />
            </a>
            <a
              href="https://ahsen-studio.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm text-zinc-400"
            >
              Portfolio
              <Icon name="arrow-up-right" className="size-3.5" />
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}

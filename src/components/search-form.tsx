import { Icon } from "./icons";

/**
 * Campo di ricerca del blog.
 *
 * È un semplice form GET verso /cerca: funziona anche senza JavaScript e non
 * ha bisogno di stato nel browser. Due dimensioni: `sm` per l'header, `lg` per
 * la pagina dei risultati.
 */
export function SearchForm({
  defaultValue = "",
  size = "lg",
  id = "site-search",
  className = "",
}: {
  defaultValue?: string;
  size?: "sm" | "lg";
  id?: string;
  className?: string;
}) {
  const compact = size === "sm";

  return (
    <form
      action="/cerca"
      method="get"
      role="search"
      className={`group relative ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Cerca nel blog
      </label>
      <Icon
        name="search"
        className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-[#00d4ff]`}
      />
      <input
        id={id}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={compact ? "Cerca…" : "Cerca un articolo…"}
        autoComplete="off"
        className={`w-full rounded-full border border-white/10 bg-white/5 text-white placeholder:text-zinc-400 transition-colors focus:border-[#7c6cff] focus:bg-white/10 focus:outline-none ${
          compact ? "py-1.5 pl-9 pr-3 text-xs" : "py-3 pl-11 pr-4 text-sm"
        }`}
      />
      {/* Invio esplicito per chi naviga con lo screen reader: il campo da solo
          basterebbe, ma un pulsante è più prevedibile. */}
      <button type="submit" className="sr-only">
        Cerca
      </button>
    </form>
  );
}

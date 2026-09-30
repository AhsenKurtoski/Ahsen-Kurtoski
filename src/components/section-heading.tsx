export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Livello di intestazione: "h1" solo per il titolo principale di una pagina. */
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={`flex flex-col gap-3 ${
        align === "center" ? "items-center text-center" : "items-start"
      }`}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00d4ff]">
          {eyebrow}
        </span>
      )}
      <Heading className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </Heading>
      {description && (
        <p
          className={`max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

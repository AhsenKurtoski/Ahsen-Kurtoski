import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgCardProps = {
  /** Etichetta piccola in alto (es. "SITO UFFICIALE" o "CHI SONO") */
  eyebrow: string;
  /** Titolo grande al centro */
  title: string;
  /** Riga di supporto sotto il titolo */
  subtitle?: string;
  /** Riga in basso, di norma il dominio */
  footer?: string;
};

/**
 * Card 1200×630 condivisa da tutte le immagini social del sito, così ogni
 * pagina ne ha una coerente senza duplicare il codice di disegno.
 */
export function OgCard({ eyebrow, title, subtitle, footer }: OgCardProps) {
  const domain = site.url.replace(/^https?:\/\//, "");
  // Più il titolo è lungo, più il carattere si rimpicciolisce: così resta
  // leggibile senza uscire dalla card.
  const titleSize = title.length > 44 ? 50 : title.length > 28 ? 62 : 78;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #191545 55%, #0b4a5c 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "linear-gradient(135deg, #7c6cff, #00d4ff)",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          {site.initials}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            color: "#a5b4fc",
          }}
        >
          {eyebrow.toUpperCase()}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: titleSize,
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 30,
            color: "#c7d2fe",
          }}
        >
          {subtitle}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          marginTop: 48,
          fontSize: 24,
          color: "#9ca3af",
        }}
      >
        {footer ?? domain}
      </div>
    </div>
  );
}

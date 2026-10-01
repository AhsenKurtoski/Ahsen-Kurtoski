import type { CSSProperties, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Ritardo in millisecondi per effetti a cascata */
  delay?: number;
};

/**
 * Piccola animazione di ingresso (opacità + traslazione) **senza JavaScript**.
 *
 * Perché non è più un componente client: la versione precedente partiva da
 * `opacity: 0` e diventava visibile solo dopo l'idratazione e il primo
 * IntersectionObserver, quindi il contenuto dipendeva dal JS (e con un
 * `Reveal` attorno a tutta la pagina, l'idratazione arrivava a costare più del
 * testo stesso). Ora l'animazione è dichiarata in `globals.css` con
 * `animation-timeline: view()`: parte quando l'elemento entra nello schermo,
 * come prima, ma la fa il browser da solo.
 *
 * Il `delay` resta per gli effetti a cascata (card a 80–90 ms l'una dall'altra).
 * Le intestazioni di pagina — cioè il contenuto su cui si misura l'LCP — non
 * hanno ritardo: sono in un `Reveal` con `delay` assente o direttamente fuori
 * da un `Reveal`, quindi non aspettano nulla per dipingersi.
 */
export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const style: CSSProperties | undefined = delay
    ? { animationDelay: `${delay}ms` }
    : undefined;

  return (
    <div style={style} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

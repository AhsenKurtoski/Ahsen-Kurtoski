"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

/** Pulsante "torna su" che appare dopo aver scorso la pagina. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 700);

    const raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Torna su"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 grid size-11 place-items-center rounded-full border border-white/10 bg-[#12121a]/90 text-white shadow-lg backdrop-blur transition-all duration-300 hover:border-[#7c6cff] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <Icon name="arrow-up-right" className="size-5 -rotate-45" />
    </button>
  );
}

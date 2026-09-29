"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const roles: readonly string[] = site.roles;

/** Effetto macchina da scrivere che alterna i ruoli di Ahsen. */
export function TypingRole() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[index % roles.length];
    const finished = text === current;
    const cleared = text === "";

    const delay = !deleting && finished ? 1500 : deleting ? 45 : 90;

    // Ogni transizione avviene dentro il timer, mai in modo sincrono nell'effetto
    const timer = setTimeout(() => {
      if (!deleting && finished) {
        setDeleting(true);
        return;
      }
      if (deleting && cleared) {
        setDeleting(false);
        setIndex((value) => (value + 1) % roles.length);
        return;
      }
      setText((prev) =>
        deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1),
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, index]);

  return (
    <span className="inline-flex items-baseline">
      <span className="text-gradient font-semibold">{text}</span>
      <span
        aria-hidden="true"
        className="ml-1 inline-block h-[1.1em] w-[3px] animate-blink rounded-full bg-[var(--color-accent-2)]"
      />
      <span className="sr-only">{roles.join(", ")}</span>
    </span>
  );
}

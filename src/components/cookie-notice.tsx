"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Icon } from "./icons";

/**
 * Chiave in localStorage (non un cookie): questo sito non usa cookie, quindi
 * l'unica cosa che salvo è il fatto che tu abbia già letto l'avviso.
 */
const STORAGE_KEY = "ak-avviso-cookie";

const listeners = new Set<() => void>();

/**
 * Legge lo stato dal browser come farebbe uno store esterno: così non serve
 * nessun setState dentro un effetto e non c'è disallineamento di idratazione
 * (sul server la pagina si presenta già come "avviso letto").
 */
function subscribe(listener: () => void) {
  listeners.add(listener);
  // Permette di sincronizzare più schede aperte dello stesso sito
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function isDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "ok";
  } catch {
    // Archiviazione bloccata: mostro l'avviso, anche se non potrò ricordarlo
    return false;
  }
}

/** Sul server "avviso letto" = non renderizzo nulla, come chi l'ha già chiuso */
const serverSnapshot = () => true;

function dismiss() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "ok");
  } catch {
    // Se non posso salvare la scelta, l'avviso ricomparirà: nessun danno
  }
  for (const listener of listeners) listener();
}

/**
 * Avviso mostrato alla prima visita.
 *
 * Perché un avviso e non un banner con «Accetta / Rifiuta»: il sito non installa
 * nessun cookie (né tecnico, né di profilazione, né di terze parti) e non usa
 * strumenti di analisi, quindi non c'è nessun consenso da chiedere. Un muro di
 * consenso senza nulla da consentire confonde e basta — e bloccare la lettura
 * della pagina non è comunque necessario quando i cookie non ci sono.
 */
export function CookieNotice() {
  const dismissed = useSyncExternalStore(subscribe, isDismissed, serverSnapshot);

  if (dismissed) return null;

  // `bottom-20` sui telefoni: in basso a destra c'è il pulsante «torna su», e
  // a schermo stretto l'avviso lo coprirebbe. Da sm in poi mi sposto a sinistra
  // e il pulsante resta libero.
  return (
    <div
      role="region"
      aria-label="Informazioni su cookie e dati personali"
      className="fixed inset-x-3 bottom-20 z-40 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#12121a]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7c6cff] to-[#00d4ff] text-white">
            <Icon name="check" className="size-5" />
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-white">
              Nessun cookie di tracciamento
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              Questo sito non usa cookie di profilazione né strumenti di analisi. Gli
              unici dati che ricevo sono quelli che scrivi nel form dei contatti, e li
              uso solo per risponderti.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Ho capito
          </button>
          <Link
            href="/privacy"
            onClick={dismiss}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            Informativa privacy
            <Icon name="arrow-right" className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

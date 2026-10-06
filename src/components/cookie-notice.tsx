"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  analyticsConfigured,
  getConsentServerSnapshot,
  getConsentSnapshot,
  setConsent,
  subscribeConsent,
} from "@/lib/consent";
import { Icon } from "./icons";

/**
 * Chiave in localStorage (non un cookie) del vecchio avviso informativo:
 * ricorda solo che l'utente ha già letto l'avviso, non identifica nessuno.
 */
const NOTICE_STORAGE_KEY = "ak-avviso-cookie";

const noticeListeners = new Set<() => void>();

/**
 * Legge lo stato dal browser come farebbe uno store esterno: così non serve
 * nessun setState dentro un effetto e non c'è disallineamento di idratazione
 * (sul server la pagina si presenta già come "avviso letto").
 */
function subscribeNotice(listener: () => void) {
  noticeListeners.add(listener);
  // Permette di sincronizzare più schede aperte dello stesso sito
  window.addEventListener("storage", listener);
  return () => {
    noticeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function isNoticeDismissed() {
  try {
    return window.localStorage.getItem(NOTICE_STORAGE_KEY) === "ok";
  } catch {
    // Archiviazione bloccata: mostro l'avviso, anche se non potrò ricordarlo
    return false;
  }
}

/** Sul server "avviso letto" = non renderizzo nulla, come chi l'ha già chiuso */
const noticeServerSnapshot = () => true;

function dismissNotice() {
  try {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, "ok");
  } catch {
    // Se non posso salvare la scelta, l'avviso ricomparirà: nessun danno
  }
  for (const listener of noticeListeners) listener();
}

const panelClass =
  "flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#12121a]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-md";

const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]";

const secondaryButtonClass =
  "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10 hover:text-white";

/**
 * Avviso mostrato alla prima visita, in due forme.
 *
 * - **Analytics configurato** (`NEXT_PUBLIC_GA4_MEASUREMENT_ID`): chiede una
 *   scelta con «Accetta» / «Rifiuta». Solo dopo «Accetta» il tag di Google
 *   viene caricato (vedi `google-analytics.tsx`); con «Rifiuta» non parte
 *   nessuna richiesta verso Google. La scelta si cambia in ogni momento dalla
 *   pagina privacy.
 * - **Analytics non configurato**: avviso informativo senza pulsante
 *   «Rifiuta», perché non c'è nulla da consentire. Il sito non installa
 *   cookie di profilazione né strumenti di analisi.
 */
export function CookieNotice() {
  const noticeDismissed = useSyncExternalStore(
    subscribeNotice,
    isNoticeDismissed,
    noticeServerSnapshot,
  );
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  const analyticsChoiceMissing = consent === null;

  if (!analyticsConfigured && noticeDismissed) return null;
  if (analyticsConfigured && !analyticsChoiceMissing) return null;

  // `bottom-20` sui telefoni: in basso a destra c'è il pulsante «torna su», e
  // a schermo stretto l'avviso lo coprirebbe. Da sm in poi mi sposto a sinistra
  // e il pulsante resta libero.
  return (
    <div
      role="region"
      aria-label={
        analyticsConfigured
          ? "Scelta sull'uso delle statistiche di visita"
          : "Informazioni su cookie e dati personali"
      }
      className="fixed inset-x-3 bottom-20 z-40 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md"
    >
      {analyticsConfigured ? (
        <div className={panelClass}>
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7c6cff] to-[#00d4ff] text-white">
              <Icon name="sparkles" className="size-5" />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-white">
                Statistiche di visita: decidi tu
              </p>
              <p className="text-xs leading-relaxed text-zinc-400">
                Vorrei usare Google Analytics per capire quali pagine funzionano
                meglio. Il tag di Google si carica <strong className="text-zinc-200">solo
                se accetti</strong>: finché non scegli, o se rifiuti, nessun dato di
                navigazione viene inviato a Google. Puoi cambiare idea dalla pagina
                privacy.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setConsent("granted")}
              className={primaryButtonClass}
            >
              <Icon name="check" className="size-4" />
              Accetta
            </button>
            <button
              type="button"
              onClick={() => setConsent("denied")}
              className={secondaryButtonClass}
            >
              Rifiuta
            </button>
            <Link href="/privacy" className={secondaryButtonClass}>
              Informativa
              <Icon name="arrow-right" className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className={panelClass}>
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
              onClick={dismissNotice}
              className={primaryButtonClass}
            >
              Ho capito
            </button>
            <Link
              href="/privacy"
              onClick={dismissNotice}
              className={secondaryButtonClass}
            >
              Informativa privacy
              <Icon name="arrow-right" className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

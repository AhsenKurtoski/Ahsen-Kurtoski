"use client";

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
 * Preferenze analytics nella pagina privacy: il consenso si revoca con la
 * stessa facilità con cui si dà (requisito GDPR). Mostra lo stato attuale e
 * permette di attivare o disattivare le statistiche in ogni momento.
 *
 * Quando non c'è nessun ID di misurazione configurato il pannello non compare:
 * non ci sarebbe nulla da scegliere.
 */
export function ConsentPreferences() {
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  if (!analyticsConfigured) return null;

  const granted = consent === "granted";
  const label =
    consent === null
      ? "Non hai ancora scelto"
      : granted
        ? "Statistiche attive"
        : "Statistiche disattivate";

  return (
    <div className="card flex flex-col gap-4 border-l-2 border-l-[#7c6cff] p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#00d4ff]">
          <Icon name="sparkles" className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold text-white">
            Gestisci le statistiche di visita
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Stato attuale:{" "}
            <strong className="text-zinc-200">{label}</strong>. Se disattivi,
            elimino subito i cookie di Google Analytics dal tuo browser e non
            viene inviato più nulla.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {granted ? (
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            Disattiva le statistiche
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConsent("granted")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            <Icon name="check" className="size-4" />
            Attiva le statistiche
          </button>
        )}
      </div>
    </div>
  );
}

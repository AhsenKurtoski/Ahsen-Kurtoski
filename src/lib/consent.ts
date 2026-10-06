/**
 * Consenso all'analytics, gestito interamente nel browser.
 *
 * Il sito store solo la scelta dell'utente (`granted` / `denied`) in
 * localStorage: nessun cookie di consenso, coerente con l'impostazione del
 * sito. Questo modulo è usato dai componenti client (avviso cookie, tag di
 * Google, preferenze nella pagina privacy) ed espone anche i valori letti a
 * build time (ID di misurazione) usati dalle pagine server.
 */

export type ConsentValue = "granted" | "denied";

/** Chiave in localStorage: vale "granted" o "denied", mai altro. */
export const CONSENT_STORAGE_KEY = "ak-consenso-analytics";

/** Evento interno (stessa scheda) per sincronizzare i componenti dopo una scelta. */
export const CONSENT_EVENT = "ak-consenso-cambio";

/**
 * ID di Google Analytics 4 (formato G-XXXXXXXXXX), da NEXT_PUBLIC_*. Le
 * variabili NEXT_PUBLIC_* vengono incorporate nel bundle a build time; se il
 * valore manca o è vuoto l'analytics è semplicemente disattivato: nessuno
 * script viene caricato e l'informativa resta quella precedente.
 */
export const GA_MEASUREMENT_ID = (
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? ""
).trim();

/** True quando un ID è configurato (a build time, quindi stabile). */
export const analyticsConfigured = GA_MEASUREMENT_ID.length > 0;

/* ------------------------------------------------------------------ */
/* Store per useSyncExternalStore                                      */
/* ------------------------------------------------------------------ */

/**
 * Cache del valore letto: `undefined` = non ancora letto, `null` = nessuna
 * scelta salvata. Serve a far tornare `getSnapshot` sempre lo stesso valore
 * tra un render e l'altro finché qualcosa non cambia davvero.
 */
let cached: ConsentValue | null | undefined;

function readStored(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Archiviazione bloccata (navigazione privata, permessi): nessuna scelta.
    return null;
  }
}

export function getConsentSnapshot(): ConsentValue | null {
  if (cached === undefined) cached = readStored();
  return cached;
}

/** Sul server non c'è nessuna scelta: i componenti decidono come presentarsi. */
export function getConsentServerSnapshot(): ConsentValue | null {
  return null;
}

export function subscribeConsent(listener: () => void): () => void {
  const onStorage = () => {
    // Modifica arrivata da un'altra scheda: la cache non è più valida.
    cached = undefined;
    listener();
  };
  window.addEventListener(CONSENT_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Legge la scelta salvata senza passare dagli hook (usata dal tag di Google). */
export function readConsent(): ConsentValue | null {
  return getConsentSnapshot();
}

export function setConsent(value: ConsentValue): void {
  cached = value;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Se non posso salvare la scelta, la tengo valida per questa pagina.
  }
  // Serve un CustomEvent con `detail`: il tag di Google legge la scelta da lì
  // (con un Event semplice `detail` sarebbe `undefined` e la scelta ignorata).
  window.dispatchEvent(
    new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }),
  );
}

/**
 * Elimina i cookie che Google Analytics ha già scritto (se l'utente revoca il
 * consenso dopo averlo dato). Non tocca nessun altro cookie: il sito non ne
 * usa altri.
 */
export function clearAnalyticsCookies(): void {
  try {
    for (const entry of document.cookie.split(";")) {
      const name = entry.split("=")[0]?.trim();
      if (name && /^_g(a|id|cl)/.test(name)) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      }
    }
  } catch {
    // Nessun cookie da eliminare (o cookie bloccati): niente da fare.
  }
}

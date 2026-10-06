"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_EVENT,
  GA_MEASUREMENT_ID,
  analyticsConfigured,
  clearAnalyticsCookies,
  readConsent,
  type ConsentValue,
} from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google tag (GA4) con rispetto del consenso.
 *
 * Scelta di fondo: lo script di Google **non viene contattato finché l'utente
 * non accetta** l'analytics. Niente "consent mode" attivo di default, niente
 * richieste a googletagmanager.com prima della scelta: se non accetti (o non
 * hai ancora scelto), da questo sito a Google non parte nulla. Quando accetti,
 * il tag viene caricato e invia le statistiche; se in seguito revochi il
 * consenso, i cookie `_ga*` vengono eliminati e il tag smette di salvarne.
 *
 * Le statistiche di navigazione sono inviate anche quando si passa da una
 * pagina all'altra senza ricaricare (Next.js lato client).
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsConfigured) return;

    /** Definisce dataLayer/gtag e carica lo script una sola volta. */
    const start = () => {
      if (window.gtag) return;

      const dataLayer = (window.dataLayer = window.dataLayer ?? []);
      const gtag = (...args: unknown[]) => {
        dataLayer.push(args);
      };
      window.gtag = gtag;

      gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      });
      gtag("consent", "update", { analytics_storage: "granted" });
      gtag("js", new Date());
      // `anonymize_ip` non serve più in GA4 (gli IP non vengono registrati),
      // ma la config resta minimale: solo la raccolta di statistiche.
      gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        GA_MEASUREMENT_ID,
      )}`;
      script.dataset.akGoogleTag = "true";
      document.head.appendChild(script);
    };

    /** Revoca: stop dei cookie e consenso aggiornato (lo script resta caricato, non salva più nulla). */
    const stop = () => {
      clearAnalyticsCookies();
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
    };

    if (readConsent() === "granted") start();

    const onConsentChange = (event: Event) => {
      const value = (event as CustomEvent<ConsentValue>).detail;
      if (value === "granted") start();
      else stop();
    };

    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  /**
   * Cambio pagina lato client: la prima visualizzazione la manda già la
   * `config`, quindi salto il primo render e invio solo le navigazioni
   * successive (solo se il tag è stato caricato, cioè con consenso attivo).
   */
  useEffect(() => {
    if (!analyticsConfigured) return;
    if (lastPath.current === null) {
      lastPath.current = pathname;
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
    });
  }, [pathname]);

  return null;
}

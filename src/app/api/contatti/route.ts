import { NextResponse } from "next/server";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const LIMITS = { name: 80, email: 120, message: 4000 };
const RATE = { windowMs: 10 * 60 * 1000, max: 5 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Contatore semplice in memoria (su serverless vale per singola istanza) */
const attempts = new Map<string, number[]>();

/** Momento dell'ultima pulizia delle voci scadute: vedi `isRateLimited`. */
let lastSweep = 0;

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  /**
   * Pulizia periodica delle voci scadute. Senza questa passata la mappa
   * conserva per sempre un elemento per ogni indirizzo che ha mai scritto — una
   * perdita di memoria lenta ma reale su un'istanza che resta viva a lungo.
   * Cancello solo le voci con l'ultima richiesta fuori dalla finestra, quindi il
   * conteggio di chi sta scrivendo adesso non viene toccato.
   */
  if (now - lastSweep >= RATE.windowMs) {
    lastSweep = now;
    for (const [key, times] of attempts) {
      if (now - (times.at(-1) ?? 0) >= RATE.windowMs) attempts.delete(key);
    }
  }

  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < RATE.windowMs);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > RATE.max;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Richiesta non valida." },
      { status: 400 },
    );
  }

  const data = (payload ?? {}) as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const honeypot = typeof data.website === "string" ? data.website.trim() : "";
  const freeSite = data.freeSite === true;

  // Campo nascosto compilato = bot: rispondiamo ok senza inviare nulla
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Inserisci il tuo nome.";
  if (!EMAIL_RE.test(email)) errors.email = "Inserisci un indirizzo email valido.";
  if (message.length < 10) {
    errors.message = "Scrivi un messaggio di almeno 10 caratteri.";
  }
  if (
    name.length > LIMITS.name ||
    email.length > LIMITS.email ||
    message.length > LIMITS.message
  ) {
    errors.message = "Il messaggio è troppo lungo.";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, errors, error: "Controlla i campi e riprova." },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sconosciuto";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Hai inviato troppi messaggi. Riprova tra qualche minuto." },
      { status: 429 },
    );
  }

  /**
   * L'invio passa da FormSubmit (https://formsubmit.co), che inoltra il messaggio
   * via email senza bisogno di API key. La chiamata parte dal server, quindi
   * l'indirizzo di destinazione non compare mai nell'HTML del sito: i bot che
   * leggono la pagina non lo trovano.
   */
  const to = process.env.CONTACT_EMAIL || site.email;
  // L'endpoint è sovrascrivibile per poter collaudare il codice senza chiamare
  // il servizio esterno (vedi scripts/test-email.mjs e README).
  const base = process.env.FORMSUBMIT_ENDPOINT ?? "https://formsubmit.co/ajax";
  const endpoint = `${base.replace(/\/+$/, "")}/${encodeURIComponent(to)}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        _replyto: email,
        message,
        _subject: freeSite
          ? `[RICHIESTA SITO GRATIS BELLUNO] Nuovo messaggio da ${name}`
          : `Nuovo messaggio dal sito — ${name}`,
        _template: "table",
        _captcha: "false",
      }),
    });

    const raw = await response.text();
    let body: { success?: string | boolean; message?: string } = {};
    try {
      body = JSON.parse(raw) as typeof body;
    } catch {
      // FormSubmit può rispondere in testo semplice: lo teniamo nei log
    }

    // FormSubmit chiede di confermare l'indirizzo alla prima richiesta: finché
    // l'attivazione non è completata i messaggi non vengono recapitati.
    const needsActivation = /confirm|activat/i.test(body.message ?? raw ?? "");

    if (!response.ok || body.success === "false") {
      console.error("Invio FormSubmit fallito:", response.status, raw);
      return NextResponse.json(
        {
          ok: false,
          error: needsActivation
            ? `Invio in attesa di attivazione: controlla la posta di ${to} e clicca il link di conferma di FormSubmit.`
            : `Invio non riuscito. Scrivimi a ${to}.`,
        },
        { status: needsActivation ? 503 : 502 },
      );
    }

    if (needsActivation) {
      console.warn(
        `FormSubmit chiede l'attivazione dell'indirizzo ${to}: il messaggio non è stato recapitato.`,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Errore di rete nell'invio FormSubmit:", error);
    return NextResponse.json(
      { ok: false, error: `Invio non riuscito. Scrivimi a ${to}.` },
      { status: 502 },
    );
  }
}

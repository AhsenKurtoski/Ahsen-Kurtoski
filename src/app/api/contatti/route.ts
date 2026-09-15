import { NextResponse } from "next/server";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const LIMITS = { name: 80, email: 120, message: 4000 };
const RATE = { windowMs: 10 * 60 * 1000, max: 5 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Contatore semplice in memoria (su serverless vale per singola istanza) */
const attempts = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL ?? site.email;

  if (!apiKey) {
    // Nessun servizio email configurato: il form lo dice chiaramente e resta il mailto
    return NextResponse.json(
      { ok: false, error: `Invio non ancora configurato. Scrivimi a ${to}.` },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "Sito Axsen Kurtoski <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `Nuovo messaggio dal sito — ${name}`,
        text: `Nome: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });

    if (!response.ok) {
      console.error("Invio email fallito:", response.status, await response.text());
      return NextResponse.json(
        { ok: false, error: `Invio non riuscito. Scrivimi a ${to}.` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Errore di rete nell'invio email:", error);
    return NextResponse.json(
      { ok: false, error: `Invio non riuscito. Scrivimi a ${to}.` },
      { status: 502 },
    );
  }
}

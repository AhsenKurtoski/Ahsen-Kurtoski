"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";
import { Icon } from "./icons";

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[#0e0e15] px-4 py-3 text-sm text-white placeholder:text-zinc-500 transition-colors focus:border-[#7c6cff] focus:outline-none";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // esca per i bot
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contatti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (response.ok && result?.ok) {
        setStatus("success");
        setFeedback("Messaggio inviato! Ti rispondo il prima possibile.");
        setName("");
        setEmail("");
        setMessage("");
        return;
      }

      setStatus("error");
      setFeedback(
        result?.error ?? `Invio non riuscito. Scrivimi direttamente a ${site.email}.`,
      );
    } catch {
      setStatus("error");
      setFeedback(`Connessione non riuscita. Scrivimi direttamente a ${site.email}.`);
    }
  }

  const sending = status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      className="card flex flex-col gap-4 p-6 sm:p-7"
    >
      {/* Esche anti-spam: invisibile agli utenti, i bot la compilano */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Non compilare questo campo</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-zinc-300">Il tuo nome</span>
          <input
            type="text"
            name="name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Come ti chiami?"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-zinc-300">La tua email</span>
          <input
            type="email"
            name="email"
            required
            maxLength={120}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@esempio.com"
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-zinc-300">Messaggio</span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={4000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Raccontami il tuo progetto o la tua domanda..."
          className={`${inputClass} resize-y`}
        />
      </label>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c6cff] to-[#00d4ff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c6cff]/25 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        <Icon name={sending ? "clock" : "send"} className="size-4" />
        {sending ? "Invio in corso..." : "Invia messaggio"}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={`text-xs leading-relaxed ${
          status === "success"
            ? "text-emerald-400"
            : status === "error"
              ? "text-amber-400"
              : "text-zinc-500"
        }`}
      >
        {feedback ||
          "Il messaggio arriva direttamente nella mia casella email: nessun dato viene salvato su questo sito."}
      </p>

      <p className="text-xs leading-relaxed text-zinc-500">
        I dati che scrivi qui (nome, email e messaggio) li uso solo per
        risponderti.{" "}
        <Link
          href="/privacy"
          className="text-[#00d4ff] underline decoration-dotted underline-offset-4 hover:text-white"
        >
          Leggi l&apos;informativa privacy
        </Link>
      </p>

      {status === "error" && (
        <a
          href={`mailto:${site.email}`}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-zinc-300 transition-colors hover:text-white"
        >
          <Icon name="mail" className="size-4" />
          Scrivi a {site.email}
        </a>
      )}
    </form>
  );
}

export function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:text-white"
      aria-live="polite"
    >
      <Icon name={copied ? "check" : "copy"} className="size-4" />
      {copied ? "Email copiata!" : "Copia email"}
    </button>
  );
}

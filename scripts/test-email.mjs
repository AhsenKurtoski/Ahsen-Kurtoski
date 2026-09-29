/**
 * Invia un messaggio di prova con la stessa configurazione del form di contatto
 * (FormSubmit), così verifichi che l'indirizzo sia attivo e confermato.
 *
 * Uso:
 *   npm run email:test                    # destinatario = CONTACT_EMAIL
 *   npm run email:test -- altra@email.com # destinatario esplicito
 *
 * Legge le variabili da .env.local (o dall'ambiente) come fa Next.js.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** Parser minimo di .env: chiave=valore, ignora commenti e righe vuote */
function loadEnvFile(file) {
  const vars = {};
  if (!existsSync(file)) return vars;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i <= 0) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if (
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

const env = { ...loadEnvFile(path.join(process.cwd(), ".env.local")), ...process.env };
const to = process.argv[2] || env.CONTACT_EMAIL || "cshop0784@gmail.com";

console.log("\n\u001b[1mProva invio form (FormSubmit)\u001b[0m");
console.log(`  destinatario: ${to}`);

const response = await fetch(
  `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: "Prova dal sito",
      email: to,
      _replyto: to,
      message:
        "Se ricevi questo messaggio, il form di contatto del sito è configurato correttamente.",
      _subject: "Prova dal sito di Ahsen Kurtoski",
      _template: "table",
      _captcha: "false",
    }),
  },
);

const raw = await response.text();
let body = {};
try {
  body = JSON.parse(raw);
} catch {
  // risposta non JSON: la mostriamo così com'è
}

console.log(`\nHTTP ${response.status}`);
console.log(`Risposta: ${raw.trim().slice(0, 300)}`);

const needsActivation = /confirm|activat/i.test(`${body.message ?? ""} ${raw}`);

if (response.ok && !needsActivation) {
  console.log(`\n\u001b[32m✓ FormSubmit ha accettato il messaggio.\u001b[0m`);
  console.log(`  Controlla ${to} (anche nello spam): arriva entro pochi secondi.\n`);
  process.exit(0);
}

if (needsActivation) {
  console.log(
    `\n\u001b[33m! Serve ancora l'attivazione (una volta sola).\u001b[0m\n` +
      `  1. Apri la casella ${to}: cerca l'email di FormSubmit ("Confirm your email").\n` +
      "  2. Clicca il link di conferma (o incolla l'indirizzo che ti dà).\n" +
      "  3. Rilancia: npm run email:test\n" +
      "  Da quel momento il form recapita i messaggi normalmente.\n",
  );
  process.exit(0);
}

console.error(
  `\n✗ Invio non riuscito (HTTP ${response.status}).\n` +
    "  Controlla che l'indirizzo sia scritto bene e riprova tra qualche minuto.\n",
);
process.exit(1);

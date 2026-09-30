/** Dominio ufficiale: usato se la variabile d'ambiente manca, è vuota o non valida. */
const FALLBACK_URL = "https://ahsenkurtoski.vercel.app";

/**
 * Legge l'URL del sito da NEXT_PUBLIC_SITE_URL senza mai far fallire il build.
 * Su Vercel la variabile può arrivare come stringa vuota (es. creata senza
 * valore): con `??` restava "" e `new URL("")` faceva crashare la build con
 * ERR_INVALID_URL. Qui accettiamo solo http/https validi, altrimenti usiamo
 * il dominio ufficiale; una barra finale viene rimossa per non generare
 * indirizzi con doppia barra (es. https://sito.com//blog).
 */
function resolveSiteUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim().replace(/\/+$/, "");
  if (!value) return FALLBACK_URL;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_URL;
  }
}

export const site = {
  /*
   * URLs. `url` è anche l'indirizzo canonico della home: deve essere identico
   * in ogni punto (canonical, sitemap, Open Graph, dati strutturati). Next
   * rimuove la barra finale dai canonical, quindi si usa questa forma senza
   * barra: se canonical e sitemap dichiarassero due varianti diverse, Google
   * le tratterebbe come due pagine identiche e il live test di Search Console
   * rifiuterebbe la richiesta di indicizzazione.
   */
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),

  // Identità
  name: "Ahsen Kurtoski",
  firstName: "Ahsen",
  lastName: "Kurtoski",
  initials: "AK",

  // Ruoli mostrati nel typing effect della hero
  roles: ["Developer", "Creator", "Student", "Tech Enthusiast"],

  // Bio corta (card e metadata). Compare in home, nella pagina «Chi sono» e nei
  // risultati di Google: è la descrizione più importante del sito.
  shortBio:
    "Developer e creatore digitale. Costruisco progetti web moderni, offro i miei servizi su Fiverr e condivido quello che imparo sul mio blog.",

  // Bio lunga (pagina Chi sono)
  longBio: [
    "Ciao, sono Ahsen Kurtoski. Sono un developer e creatore digitale: mi appassiona costruire cose per il web, dai primi schizzi su carta al deploy finale.",
    "Ho iniziato per curiosità, restando incollato allo schermo a capire come funzionano i siti che visitavo ogni giorno. Da lì è nata una passione che mi accompagna tuttora: scrivere codice, rompere le cose, sistemarle e imparare qualcosa a ogni progetto.",
    "Su questo sito racconto il mio percorso e scrivo articoli su sviluppo web, strumenti che uso e cose che scopro ogni giorno. Se vuoi contattarmi per una collaborazione o anche solo per scambiare due chiacchiere su tech, scrivimi!",
  ],

  /**
   * Data dell'ultima modifica reale dei contenuti (formato ISO yyyy-mm-dd).
   * Finisce nel <lastmod> della sitemap: Google la usa per decidere quando
   * tornare a scansionare, ma solo se corrisponde alla realtà. Aggiornala
   * quando cambi bio, progetti o testi delle pagine.
   */
  updated: "2026-09-30",

  /** Data dell'ultima modifica dell'informativa privacy (finisce nella pagina e nel JSON-LD). */
  privacyUpdated: "2026-09-18",

  // Dettagli rapidi (hero / chi sono)
  location: "Italia",

  /**
   * Zone in cui lavori. Devono essere le STESSE che imposti come «Area servita»
   * nel profilo Business su Google: Google confronta i dati strutturati del sito
   * con il profilo, e se non coincidono il collegamento tra i due è più debole.
   * Aggiungi qui le città che servi, es. ["Feltre", "Belluno", "Italia"].
   */
  serviceAreas: ["Italia"],
  // `||` (non `??`): una variabile definita ma vuota deve ricadere sul default.
  email: process.env.CONTACT_EMAIL || "cshop0784@gmail.com",
  availability: "Disponibile per nuovi progetti",

  /**
   * Altri siti tuoi, mostrati come link (sezione Progetti della home e footer).
   *
   * Restano VOLUTAMENTE fuori dai dati strutturati `sameAs`: dichiarare due siti
   * come identità ufficiale della stessa persona disperde il segnale con cui
   * Google collega il nome «Ahsen Kurtoski» a un unico indirizzo. Un link
   * normale, invece, si legge bene e non confonde.
   *
   * Il sito dello studio è su Netlify: il 30/09/2026 il sottodominio è stato
   * rinominato da `axsen-studio` a `ahsen-studio` (il vecchio risponde 404).
   */
  otherSites: [
    {
      name: "Ahsen Studio",
      url: "https://ahsen-studio.netlify.app",
      description:
        "Il mio studio di sviluppo web: siti, e-commerce e app su misura, curati dal design al deploy.",
    },
  ],

  // Social (usa URL completi; lascia "" per nascondere l'icona)
  socials: {
    github: "https://github.com/AhsenKurtoski",
    linkedin: "https://www.linkedin.com/in/ahsenkurtoski",
    instagram: "https://www.instagram.com/ahsenkurtoski",
    fiverr: "https://www.fiverr.com/s/RV7NzgN",
    x: "",
    youtube: "",
  },

  // Skills
  skills: [
    { name: "HTML & CSS", level: 90 },
    { name: "JavaScript / TypeScript", level: 85 },
    { name: "React & Next.js", level: 80 },
    { name: "Node.js", level: 70 },
    { name: "UI/UX Design", level: 75 },
    { name: "Git & GitHub", level: 80 },
  ],

  // Timeline "Chi sono"
  timeline: [
    {
      year: "Oggi",
      title: "Developer & Creator",
      description:
        "Costruisco progetti web moderni e documento il percorso su questo blog.",
    },
    {
      year: "2024",
      title: "Primi progetti online",
      description:
        "Pubblicati i primi siti e app: HTML, CSS, JavaScript e tanto codice sperimentale.",
    },
    {
      year: "2023",
      title: "Inizio del viaggio",
      description:
        "Prima riga di codice scritta per curiosità. Da lì in poi non mi sono più fermato.",
    },
  ],

  // Domande frequenti (usate nella pagina Contatti e nei dati strutturati FAQPage)
  faqs: [
    {
      question: "Chi è Ahsen Kurtoski?",
      answer:
        "Ahsen Kurtoski è un developer e creatore digitale: costruisce progetti web moderni, si occupa di UI/UX e SEO e racconta il suo percorso sul blog di questo sito.",
    },
    {
      question: "Rispondi a tutti i messaggi?",
      answer:
        "Sì, leggo tutto e rispondo appena posso. Se non ricevi risposta entro qualche giorno, ricorda di scrivermi di nuovo.",
    },
    {
      question: "Accetti collaborazioni?",
      answer:
        "Sì: racconta cosa hai in mente nel form dei contatti e ti dico se posso essere utile. Se preferisci un ordine immediato, i miei servizi sono disponibili anche su Fiverr.",
    },
    {
      question: "Posso usare i tuoi contenuti?",
      answer:
        "Puoi citarli linkando la fonte. Per qualunque altro uso, scrivimi e ne parliamo volentieri.",
    },
  ],

  // SEO
  keywords: [
    "Ahsen Kurtoski",
    "Ahsen Kurtoski chi è",
    "chi è Ahsen Kurtoski",
    "Ahsen Kurtoski sito ufficiale",
    "Ahsen Kurtoski developer",
    "Ahsen Kurtoski blog",
    "Ahsen Kurtoski progetti",
    "Ahsen Kurtoski chi sono",
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/chi-sono", label: "Chi sono" },
  { href: "/blog", label: "Blog" },
  { href: "/contatti", label: "Contatti" },
] as const;

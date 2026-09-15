export const site = {
  // URLs
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://axsenkurtoski.vercel.app",

  // Identità
  name: "Axsen Kurtoski",
  firstName: "Axsen",
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
    "Ciao, sono Axsen Kurtoski. Sono un developer e creatore digitale: mi appassiona costruire cose per il web, dai primi schizzi su carta al deploy finale.",
    "Ho iniziato per curiosità, restando incollato allo schermo a capire come funzionano i siti che visitavo ogni giorno. Da lì è nata una passione che mi accompagna tuttora: scrivere codice, rompere le cose, sistemarle e imparare qualcosa a ogni progetto.",
    "Su questo sito racconto il mio percorso e scrivo articoli su sviluppo web, strumenti che uso e cose che scopro ogni giorno. Se vuoi contattarmi per una collaborazione o anche solo per scambiare due chiacchiere su tech, scrivimi!",
  ],

  /**
   * Data dell'ultima modifica reale dei contenuti (formato ISO yyyy-mm-dd).
   * Finisce nel <lastmod> della sitemap: Google la usa per decidere quando
   * tornare a scansionare, ma solo se corrisponde alla realtà. Aggiornala
   * quando cambi bio, progetti o testi delle pagine.
   */
  updated: "2026-09-16",

  // Dettagli rapidi (hero / chi sono)
  location: "Italia",
  email: process.env.CONTACT_EMAIL ?? "cshop0784@gmail.com",
  availability: "Disponibile per nuovi progetti",

  // Social (usa URL completi; lascia "" per nascondere l'icona)
  socials: {
    github: "https://github.com/AxsenXzc",
    linkedin: "https://www.linkedin.com/in/axsen-studio",
    instagram: "https://www.instagram.com/axsenstudio",
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
      question: "Chi è Axsen Kurtoski?",
      answer:
        "Axsen Kurtoski è un developer e creatore digitale: costruisce progetti web moderni, si occupa di UI/UX e SEO e racconta il suo percorso sul blog di questo sito.",
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
    "Axsen Kurtoski",
    "Axsen Kurtoski chi è",
    "chi è Axsen Kurtoski",
    "Axsen Kurtoski sito ufficiale",
    "Axsen Kurtoski developer",
    "Axsen Kurtoski blog",
    "Axsen Kurtoski progetti",
    "Axsen Kurtoski chi sono",
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/chi-sono", label: "Chi sono" },
  { href: "/blog", label: "Blog" },
  { href: "/contatti", label: "Contatti" },
] as const;

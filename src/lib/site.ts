/**
 * Dominio ufficiale: usato se la variabile d'ambiente manca, è vuota o non valida.
 *
 * TODO_UTENTE: il dominio pubblico reale di QUESTO blog va confermato. Se lo
 * pubblichi su Vercel/Netlify con un indirizzo diverso, imposta NEXT_PUBLIC_SITE_URL
 * (vedi .env.example) con l'indirizzo esatto e senza barra finale: quel valore ha
 * la precedenza su questo. Il riferimento qui sotto è l'indirizzo pubblico dichiarato
 * nel rebranding (Ahsen Studio).
 */
const FALLBACK_URL = "https://ahsen-studio.netlify.app";

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
  // TODO_UTENTE: dal rebranding il cognome è stato rimosso, il nome è solo "Ahsen".
  // `lastName` resta definito (stringa vuota) perché il codice lo usa nell'header e
  // nei dati strutturati Person: se vuoi eliminarlo del tutto vanno aggiornati
  // anche src/components/site-header.tsx e src/app/layout.tsx.
  name: "Ahsen",
  firstName: "Ahsen",
  lastName: "",
  initials: "AS",

  /**
   * Nomi con cui la persona è conosciuta. Finiscono in `alternateName` dei dati
   * strutturati (`Person` in `src/app/layout.tsx`) e servono a far capire a
   * Google che profili con nomi diversi sono la stessa entità.
   */
  alternateNames: [
    "Ahsen",
    "Ahsen Studio",
    "Ahsen Sviluppatore Web",
    "Ahsen Belluno",
    "Ahsen Feltre",
    "Ahsen Studente",
  ],

  // Ruoli mostrati nel typing effect della hero
  roles: [
    "Studente",
    "Sviluppatore Web",
    "Web App Developer",
    "Software Creator",
    "Problem Solver",
  ],

  // Bio corta (card e metadata). Compare in home, nella pagina «Chi sono» e nei
  // risultati di Google: è la descrizione più importante del sito. La lunghezza
  // sta nel range ideale 140-155 controllato da `seo:check`.
  shortBio:
    "Sono uno studente di Feltre che crea siti web, web app e software. Offro siti web GRATIS in provincia di Belluno. Portfolio su ahsen-studio.netlify.app.",

  // Bio lunga (pagina Chi sono)
  longBio: [
    "Ciao, sono Ahsen. Sono uno studente appassionato di sviluppo web e software: mi piace costruire soluzioni digitali complete, dall'idea al codice, fino al deploy finale.",
    "Mi sono avvicinato alla programmazione per curiosità e oggi trasformo quella passione in progetti concreti: siti web per attività locali, web app funzionali e piccoli software. Credo nella pratica: ogni riga di codice è una lezione.",
    "Per le attività della provincia di Belluno (Feltre, Belluno e dintorni) realizzo siti web completamente GRATIS: è il mio modo per fare pratica e aiutare il territorio. Nel mio portfolio ahsen-studio.netlify.app trovi tutti i lavori.",
  ],

  /**
   * Data dell'ultima modifica reale dei contenuti (formato ISO yyyy-mm-dd).
   * Finisce nel <lastmod> della sitemap: Google la usa per decidere quando
   * tornare a scansionare, ma solo se corrisponde alla realtà. Aggiornala
   * quando cambi bio, progetti o testi delle pagine.
   */
  updated: "2026-10-09",

  /**
   * Data dell'ultima modifica dell'informativa privacy (finisce nella pagina e
   * nel JSON-LD). Aggiornala quando attivi Google Analytics: da quel momento
   * l'informativa mostra anche le sezioni su statistiche e consenso.
   */
  privacyUpdated: "2026-10-09",

  // Dettagli rapidi (hero / chi sono)
  location: "Feltre (BL), Italia — Provincia di Belluno",

  /**
   * Zone in cui lavoro. Devono essere le STESSE che imposti come «Area servita»
   * nel profilo Business su Google: Google confronta i dati strutturati del sito
   * con il profilo, e se non coincidono il collegamento tra i due è più debole.
   */
  serviceAreas: [
    "Feltre",
    "Belluno",
    "Provincia di Belluno",
    "Sedico",
    "Mel",
    "Santa Giustina",
    "Ponte nelle Alpi",
    "Borgo Valbelluna",
    "Trichiana",
    "Limana",
    "Italia",
    "Veneto",
  ],
  // `||` (non `??`): una variabile definita ma vuota deve ricadere sul default.
  // TODO_UTENTE: questo è un PLACEHOLDER. Sostituiscilo con la tua email reale
  // nella variabile d'ambiente CONTACT_EMAIL (vedi .env.example). Finché resta
  // questo testo il sito mostra un avviso nella pagina Contatti.
  email:
    process.env.CONTACT_EMAIL || "cshop0784@gmail.com",
  availability:
    "Disponibile — Siti web GRATIS in provincia di Belluno",

  /**
   * Pagina «Adesso» (/adesso): cosa sto imparando e costruendo in questo
   * periodo. È una fotografia del momento, non la biografia: aggiornala ogni
   * tanto e cambia anche `nowUpdated`, che finisce nella sitemap e nel JSON-LD.
   */
  nowUpdated: "2026-10-09",
  now: [
    {
      title: "Cosa sto imparando",
      icon: "graduation-cap",
      items: [
        "TypeScript, per scrivere codice più sicuro",
        "React e Next.js, per costruire progetti sempre più solidi",
        "Le basi del design di interfacce",
      ],
    },
    {
      title: "Cosa sto costruendo",
      icon: "code",
      items: [
        "Questo blog, un articolo alla volta",
        "Piccoli esperimenti e tool che pubblico su GitHub",
      ],
    },
    {
      title: "Cosa sto leggendo e guardando",
      icon: "sparkles",
      items: [
        "Documentazione e tutorial sul web",
        "Storie di persone che costruiscono cose e le raccontano",
      ],
    },
  ],

  /**
   * Altri siti tuoi, mostrati come link (sezione Progetti della home e footer).
   *
   * Restano VOLUTAMENTE fuori dai dati strutturati `sameAs`: dichiarare due siti
   * come identità ufficiale della stessa persona disperde il segnale con cui
   * Google collega il nome «Ahsen» a un unico indirizzo. Un link normale,
   * invece, si legge bene e non confonde.
   */
  otherSites: [
    {
      name: "Ahsen Studio — Portfolio",
      url: "https://ahsen-studio.netlify.app",
      description:
        "Il mio portfolio completo: tutti i progetti di siti web, web app e software realizzati.",
    },
  ],

  /**
   * Servizio principale, mostrato nella home, nei contatti e nei dati
   * strutturati: siti web GRATIS per le attività della provincia di Belluno.
   *
   * Le voci di `features` sono cose che il cliente riceve davvero: se un giorno
   * cambiano le condizioni, aggiorna questa lista insieme al resto, così il
   * testo del sito non promette altro.
   */
  localService: {
    title: "Siti web GRATIS per attività in provincia di Belluno",
    description:
      "Sono uno studente e realizzo siti web completamente GRATIS per attività, negozi, associazioni e liberi professionisti di Feltre, Belluno e tutta la provincia. Design moderno, mobile, SEO, messa online inclusi.",
    features: [
      "Design moderno e responsive (perfetto da smartphone)",
      "Ottimizzazione SEO locale per farsi trovare su Google a Belluno",
      "Velocità e prestazioni ottimizzate",
      "Dominio .vercel.app o .netlify.app inclusi (gratuiti)",
      "Messa online e assistenza iniziale inclusa",
      "Nessun costo nascosto: è veramente GRATIS",
      "Possibilità di web app e software personalizzati (su richiesta)",
    ],
  },

  /*
   * Social (usa URL completi; lascia "" per nascondere l'icona).
   *
   * Questi URL finiscono anche in `sameAs` dei dati strutturati: sono la
   * dichiarazione ufficiale di «questo profilo è la stessa persona». Devono
   * quindi essere quelli veri — durante l'audit il codice conteneva handle
   * ricostruiti a mano (`/in/ahsenkurtoski`, `/ahsenkurtoski`) che non
   * esistevano. Corretti il 01/10/2026 con gli URL pubblici reali indicati dal
   * proprietario: LinkedIn `/in/ahsen-kurtoski-397b00354` e Instagram
   * `/ahsenstudio`.
   *
   * Nota sulla verifica: LinkedIn risponde **999** e Instagram **200** a
   * qualunque username quando la richiesta arriva da uno strumento automatico,
   * quindi questi link non sono verificabili da qui (`scripts/audit-links.mjs`
   * li esclude apposta): vanno controllati a mano aprendoli nel browser.
   */
  socials: {
    // TODO_UTENTE: questi due URL contengono ancora "Kurtoski". Se rinomini
    // l'account GitHub o aggiorni il custom URL di LinkedIn, sostituisci anche
    // questi indirizzi con quelli nuovi.
    github: "https://github.com/AhsenKurtoski",
    linkedin: "https://www.linkedin.com/in/ahsen-kurtoski-397b00354",
    instagram: "https://www.instagram.com/ahsenstudio",
    x: "",
    youtube: "",
  },

  // Skills
  skills: [
    { name: "HTML & CSS", level: 90 },
    { name: "JavaScript / TypeScript", level: 85 },
    { name: "React & Next.js", level: 80 },
    { name: "Sviluppo Web App", level: 80 },
    { name: "Node.js & Backend", level: 70 },
    { name: "UI/UX Design", level: 75 },
    { name: "Sviluppo Software", level: 75 },
    { name: "SEO & Google", level: 80 },
    { name: "Git & GitHub", level: 80 },
  ],

  // Timeline "Chi sono"
  timeline: [
    {
      year: "Oggi",
      title: "Studente & Sviluppatore",
      description:
        "Studio, costruisco siti web, web app e software. Offro siti GRATIS alle attività della provincia di Belluno.",
    },
    {
      year: "2024",
      title: "Primi progetti pubblici",
      description:
        "Pubblicati i primi siti e applicazioni web. Portfolio online su ahsen-studio.netlify.app.",
    },
    {
      year: "2023",
      title: "Prima riga di codice",
      description:
        "Inizio del viaggio nello sviluppo web: da semplice curiosità a passione a tutti gli effetti.",
    },
  ],

  // Domande frequenti (usate nella pagina Contatti e nei dati strutturati FAQPage)
  faqs: [
    {
      question: "Chi è Ahsen?",
      answer:
        "Ahsen è uno studente di Feltre (provincia di Belluno) che sviluppa siti web, web app e software. Realizza siti web completamente GRATIS per attività del territorio bellunese.",
    },
    {
      question: "Come faccio a richiedere un sito web GRATIS a Ahsen?",
      answer:
        "Se hai un'attività, un negozio, un'associazione o sei un libero professionista in provincia di Belluno (Feltre, Belluno e dintorni), scrivi tramite il form dei contatti o direttamente via email. Il servizio è completamente gratuito: nessun costo, nessun vincolo.",
    },
    {
      question: "Cosa include il sito web GRATIS offerto da Ahsen?",
      answer:
        "Ogni sito include: design moderno e responsive per mobile, ottimizzazione SEO locale per Google, velocità e prestazioni curate, messa online su dominio gratuito, assistenza iniziale. Sono inclusi anche testi e immagini se necessario.",
    },
    {
      question: "Che tipo di progetti realizza Ahsen?",
      answer:
        "Siti vetrina per attività, landing page, portfolio personali, blog, piccoli e-commerce, web app su misura e piccoli software desktop o web. La priorità sono i siti web GRATIS per la provincia di Belluno.",
    },
    {
      question: "Con quali tecnologie lavora Ahsen?",
      answer:
        "HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js. Per i siti usa Next.js con Tailwind CSS. Portfolio completo su ahsen-studio.netlify.app.",
    },
    {
      question: "Dove trovo tutti i lavori e i progetti di Ahsen?",
      answer:
        "Sul portfolio ufficiale ahsen-studio.netlify.app trovi tutti i progetti completati, gli esperimenti e i lavori in corso: siti web, web app e software.",
    },
  ],

  /*
   * SEO: parole chiave in 5 categorie (identità, servizio GRATIS, servizi
   * generici, web app e software, ruolo studente). Finiscono nel meta keywords
   * e aiutano a coprire le ricerche più probabili.
   */
  keywords: [
    // 1. Identità
    "Ahsen",
    "Ahsen chi è",
    "chi è Ahsen",
    "Ahsen sito ufficiale",
    "Ahsen sviluppatore web",
    "Ahsen Belluno",
    "Ahsen Feltre",
    "Ahsen Studio",
    "Ahsen portfolio",
    "ahsen-studio.netlify.app",
    // 2. Servizio GRATIS (le più importanti)
    "siti web gratis Belluno",
    "siti web gratis provincia di Belluno",
    "sito web gratuito Feltre",
    "creare sito gratis Belluno",
    "sito web per attività Feltre",
    "sito web per attività Belluno",
    "sito gratuito per negozio Belluno",
    "sito vetrina gratis Veneto",
    "sviluppatore web Belluno",
    "sviluppatore web Feltre",
    "sito web gratis per associazione Belluno",
    "sito gratis per libero professionista Feltre",
    // 3. Servizi generici
    "sviluppo siti web Belluno",
    "realizzazione siti web provincia Belluno",
    "web developer Belluno",
    "web designer Feltre",
    "creazione siti web Veneto",
    "siti web responsive Belluno",
    "SEO locale Belluno",
    "ottimizzazione SEO Google Belluno",
    "sito web veloce Belluno",
    // 4. Web app e software
    "sviluppo web app Belluno",
    "sviluppo software Feltre",
    "programmatore Belluno",
    "studente sviluppatore Belluno",
    "web app personalizzata provincia Belluno",
    "software su misura Veneto",
    // 5. Ruolo studente
    "studente programmatore Belluno",
    "ragazzo sviluppatore Feltre",
    "servizi digitali gratis provincia Belluno",
    "sviluppatore freelance Belluno",
    "aiuto attività locali Belluno",
    "presenza online gratis Belluno",
    "Google Maps attività Belluno",
    "Next.js developer Veneto",
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/chi-sono", label: "Chi sono" },
  { href: "/adesso", label: "Adesso" },
  { href: "/blog", label: "Blog" },
  { href: "/contatti", label: "Contatti" },
] as const;

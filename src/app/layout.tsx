import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BackToTop } from "@/components/back-to-top";
import { CookieNotice } from "@/components/cookie-notice";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Developer & Creator`,
    template: `%s · ${site.name}`,
  },
  description: site.shortBio,
  keywords: [...site.keywords],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  alternates: {
    // Indirizzo assoluto senza barra finale: identico alla voce della sitemap.
    canonical: site.url,
    types: { "application/rss+xml": `${site.url}/feed.xml` },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "64x64" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Developer & Creator`,
    description: site.shortBio,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Developer & Creator`,
    description: site.shortBio,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // Con `||` una variabile vuota diventa undefined: il meta tag di verifica
    // non viene emesso, invece di produrne uno vuoto che Search Console
    // segnalerebbe come verifica non valida.
    google:
      process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined, // ⚠️ Inserisci qui il codice di verifica GSC (GUIDA-SEO.md, passo 1)
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

/** Dati strutturati: Google capisce chi è Ahsen Kurtoski */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  givenName: site.firstName,
  familyName: site.lastName,
  alternateName: ["Ahsen", "Kurtoski"],
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Developer & Creatore Digitale",
  description: site.shortBio,
  knowsAbout: site.skills.map((skill) => skill.name),
  address: { "@type": "PostalAddress", addressCountry: "IT" },
  sameAs: Object.values(site.socials).filter((href) => href.length > 0),
};

/**
 * Dati strutturati dell'attività: Google li confronta con il profilo Business
 * (Google Maps). Nome, sito e area servita devono combaciare con quelli del
 * profilo, altrimenti Google legge due identità separate.
 *
 * Nota: NON c'è l'indirizzo perché il profilo è impostato come «area servita».
 * Se un giorno ricevi clienti in un luogo con insegna, aggiungilo qui e nel
 * profilo con gli stessi valori.
 */
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${site.url}#attivita`,
  name: site.name,
  url: site.url,
  description: site.shortBio,
  email: `mailto:${site.email}`,
  image: `${site.url}/opengraph-image`,
  address: { "@type": "PostalAddress", addressCountry: "IT" },
  areaServed: site.serviceAreas.map((area) => ({
    "@type": "AdministrativeArea",
    name: area,
  })),
  founder: { "@type": "Person", name: site.name, url: site.url },
  sameAs: Object.values(site.socials).filter((href) => href.length > 0),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: `${site.name} — Sito ufficiale`,
  alternateName: site.name,
  url: site.url,
  inLanguage: "it-IT",
  about: { "@type": "Person", name: site.name },
  author: { "@type": "Person", name: site.name, url: site.url },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Dati strutturati: Google capisce chi è Ahsen Kurtoski */}
        <JsonLd data={[personJsonLd, businessJsonLd, websiteJsonLd]} />
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#7c6cff] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Salta al contenuto
        </a>
        <SiteHeader />
        <main id="contenuto" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <BackToTop />
        <CookieNotice />
      </body>
    </html>
  );
}

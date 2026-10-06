import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  /*
   * Radice dei moduli fissata alla cartella del progetto. Senza questa voce
   * Turbopack risale le cartelle in cerca di un lockfile e trova quello nella
   * home dell'utente, fuori dal repo: a ogni build compare l'avviso «Next.js
   * ignored package-lock.json ... outside the current Git repository». La
   * cartella giusta è una sola: questa.
   */
  turbopack: { root: process.cwd() },
  compress: true,
  poweredByHeader: false,
  // CSS inline: il foglio di stile (37 KB, 8,8 KB gzip) viene incorporato nella
  // pagina invece di essere una richiesta render-blocking separata.
  // A/B misurato su build affiancate, run alternati (audit/performance-report.md §0d):
  //   modello Lantern (= quello con cui PSI calcola il punteggio) LCP -253 ms, 6 round su 6;
  //   TBT invariato (+27 ms di mediana accoppiata); nessun costo CPU rilevabile (main-thread/bootup invariati).
  //   Costo in byte su brotli (quello che serve Vercel): +0,35 KB in prima visita,
  //   +7,4 KB per ogni navigazione client-side (Next duplica il CSS nel payload RSC
  //   e il CSS non è più cacheabile), +18,5 KB su host che servono solo gzip.
  experimental: { inlineCss: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

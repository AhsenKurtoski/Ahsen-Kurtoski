import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  /**
   * Il <lastmod> è un segnale che Google usa per programmare le scansioni, ma
   * solo se dice la verità: segnare "adesso" a ogni build insegna a Google a
   * ignorarlo. Quindi le pagine statiche usano `site.updated` (che aggiorni tu
   * quando cambi i testi) e gli articoli usano la loro data reale.
   */
  const siteUpdated = new Date(`${site.updated}T00:00:00Z`);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/`,
      lastModified: siteUpdated,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/chi-sono`,
      lastModified: siteUpdated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/blog`,
      lastModified: siteUpdated,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${site.url}/contatti`,
      lastModified: siteUpdated,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  const posts = getAllPosts();

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Un archivio tag cambia quando cambia il suo articolo più recente
  const tagRoutes: MetadataRoute.Sitemap = getAllTags().map(({ slug, tag }) => {
    const latest = posts
      .filter((post) => post.tags.includes(tag))
      .map((post) => post.date)
      .sort()
      .at(-1);

    return {
      url: `${site.url}/blog/tag/${slug}`,
      lastModified: latest ? new Date(`${latest}T00:00:00Z`) : siteUpdated,
      changeFrequency: "monthly",
      priority: 0.5,
    };
  });

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}

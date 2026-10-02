import fs from "node:fs";
import path from "node:path";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO yyyy-mm-dd
  readTime: string;
  tags: string[];
  /** HTML pronto per la pagina articolo (generato dal markdown) */
  html: string;
};

const postsDir = path.join(process.cwd(), "src", "content", "posts");

/* ---------- Markdown minimo → HTML ---------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(md: string): string {
  let s = escapeHtml(md);
  // inline code (prima di tutto il resto)
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // immagini ![alt](src)
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" />',
  );
  // link [testo](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  // grassetto e corsivo
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s;
}

function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paraBuf: string[] = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push(`<p>${inline(paraBuf.join(" "))}</p>`);
      paraBuf = [];
    }
  };
  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim().startsWith("```")) {
      flushPara();
      closeList();
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }

    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }

    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      closeList();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }

    if (/^(---|\*\*\*)\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push("<hr />");
      continue;
    }

    const ul = /^[-*]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    const bq = /^>\s?(.*)$/.exec(line);
    if (bq) {
      flushPara();
      closeList();
      out.push(`<blockquote>${inline(bq[1])}</blockquote>`);
      continue;
    }

    paraBuf.push(line.trim());
  }
  flushPara();
  closeList();
  if (inCode && codeBuf.length) {
    out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  }
  return out.join("\n");
}

/* ---------- Frontmatter semplice (chiave: valore) ---------- */

function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---")) return { data: {}, body: normalized };
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: normalized };
  const head = normalized.slice(4, end);
  const bodyStart = normalized.indexOf("\n", end + 1);
  const body = bodyStart === -1 ? "" : normalized.slice(bodyStart + 1);
  const data: Record<string, string> = {};
  for (const l of head.split("\n")) {
    const i = l.indexOf(":");
    if (i <= 0) continue;
    const key = l.slice(0, i).trim();
    let value = l.slice(i + 1).trim();
    // Rimuove eventuali virgolette attorno al valore ("titolo", 'titolo')
    if (
      value.length > 1 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body };
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

/* ---------- Ricerca full-text ---------- */

/**
 * Testo dell'articolo senza sintassi markdown, usato solo per la ricerca.
 * Tengo il contenuto del codice dentro il testo (serve per cercare un termine
 * tecnico), ma tolgo i simboli che sporcherebbero i confronti.
 */
function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, (block) => ` ${block.replace(/```/g, " ")} `)
    .replace(/`([^`]+)`/g, " $1 ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Minuscole + niente accenti: così «città» trova anche «citta» */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/* ---------- Caricamento articoli ---------- */

/** Post arricchito con il testo grezzo: serve alla ricerca, non esce dal modulo. */
type LoadedPost = Post & { plainText: string };

function loadPosts(): LoadedPost[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title ?? slug,
      excerpt: data.excerpt ?? "",
      date: data.date ?? new Date().toISOString().slice(0, 10),
      readTime: data.readTime ?? estimateReadTime(body),
      tags: (data.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      html: markdownToHtml(body),
      plainText: toPlainText(body),
    } satisfies LoadedPost;
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

const posts = loadPosts();

export function getAllPosts(): Post[] {
  return posts;
}

/**
 * Cerca negli articoli (titolo, riepilogo, tag e testo completo).
 *
 * Ogni parola della ricerca deve comparire da qualche parte, così i risultati
 * non si allargano a caso; poi l'ordine premia i match più significativi
 * (titolo > tag > riepilogo > corpo) e, a parità, l'articolo più recente.
 */
export function searchPosts(query: string): Post[] {
  const terms = normalize(query).split(/\s+/).filter((term) => term.length > 1);
  if (terms.length === 0) return [];

  const matches = posts.flatMap((post) => {
    const title = normalize(post.title);
    const excerpt = normalize(post.excerpt);
    const tags = normalize(post.tags.join(" "));
    const body = normalize(post.plainText);

    let score = 0;
    for (const term of terms) {
      const inTitle = title.includes(term);
      const inTags = tags.includes(term);
      const inExcerpt = excerpt.includes(term);
      const inBody = body.includes(term);
      if (!inTitle && !inTags && !inExcerpt && !inBody) return [];
      score +=
        (inTitle ? 6 : 0) +
        (inTags ? 3 : 0) +
        (inExcerpt ? 2 : 0) +
        (inBody ? 1 : 0);
    }
    // Titolo esatto: spinta in più per portare in cima l'articolo giusto
    if (title.includes(normalize(query))) score += 8;
    return [{ post, score }];
  });

  return matches
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .map(({ post }) => post);
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Trasforma un tag in uno slug usabile nell'URL (es. "UI/UX Design" → "ui-ux-design") */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Tutti i tag usati negli articoli, con conteggio, ordinati per frequenza */
export function getAllTags(): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, slug: tagToSlug(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "it"));
}

/** Articoli che hanno un certo tag (per slug) */
export function getPostsByTagSlug(slug: string): Post[] {
  return posts.filter((post) =>
    post.tags.some((tag) => tagToSlug(tag) === slug),
  );
}

/** Etichetta leggibile di un tag a partire dallo slug */
export function getTagLabel(slug: string): string {
  return getAllTags().find((item) => item.slug === slug)?.tag ?? slug;
}

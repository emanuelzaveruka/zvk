import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * `published` semantics:
 *   true      → live and indexable
 *   'preview' → built so the URL is shareable, but marked noindex
 *   false     → draft, only reachable in `astro dev`
 */
export const posts = (await getCollection('blog')).filter(
  (post) => import.meta.env.DEV || post.data.published !== false
);

export const sortedPosts = [...posts].sort(
  (a, b) => b.data.date.getTime() - a.data.date.getTime()
);

/** Only fully published posts belong in the index, the sitemap and the feed. */
export const isIndexable = (post: CollectionEntry<'blog'>) => post.data.published === true;

export const indexablePosts = sortedPosts.filter(isIndexable);

/** Trailing slash matches how the static build is served, so canonical URLs,
 *  sitemap entries and internal links all agree on one form. */
export const postPath = (slug: string) => `/blog/${slug}/`;

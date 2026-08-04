export interface SeoProps {
  baseUrl?: string;
  description?: string;
  keywords?: string[];
  urlPath?: string;
  title?: string;
  imagePath?: string;
  /** Drives og:type and whether the article:* tags are emitted. */
  type?: 'website' | 'article';
  /** ISO 8601. Only used when type is 'article'. */
  publishedTime?: string;
  /** ISO 8601. Falls back to publishedTime when the post has no `updated` date. */
  modifiedTime?: string;
  /** Topical section of an article, e.g. the primary keyword. */
  section?: string;
  /** Keeps preview posts and the 404 out of the index. */
  noindex?: boolean;
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start local development server
pnpm build      # Build for production
pnpm preview    # Preview production build locally
pnpm check:seo  # Assert the generated HTML in dist/ (run after build)
pnpm images:og  # Regenerate the social share cards in public/images/og/
```

No lint or test commands are configured. The package manager is pnpm (enforced at v9.12.0).

### CI

Two workflows in `.github/workflows/`:

- `ci.yml` — pull requests: builds and runs `check:seo`, never deploys
- `pages.yml` — pushes to `main` (i.e. merges), the daily cron, and manual dispatch: builds, runs `check:seo` as a deploy gate, then publishes to GitHub Pages

Automated PR review is Codex code review, enabled from
[chatgpt.com/codex/settings/code-review](https://chatgpt.com/codex/settings/code-review)
on the ChatGPT plan — it runs in OpenAI's cloud, not in Actions, and takes its
review rules from `AGENTS.md`. There is deliberately no review workflow in this
repo: the `openai/codex-action` route needs a billed `OPENAI_API_KEY`, and the
API-key track has no access to the cloud review feature.

`scripts/check-seo.mjs` asserts the generated HTML: unique canonicals, one title/robots/description
per page, `og:type=article` and `BlogPosting` JSON-LD on posts, and that the sitemap lists exactly the
indexable pages. It exists because the metadata bug it guards against still produced a green build —
only assertions on the output catch it. It takes an optional dist path: `node scripts/check-seo.mjs <dir>`.

## Architecture

This is a static portfolio/blog site for Emanuel Zaveruka built with **Astro 5** and **Tailwind CSS**. It deploys to GitHub Pages via GitHub Actions on push to `main` and on a daily schedule (to refresh GitHub project data).

### Routing & Pages

File-based routing under `src/pages/`:
- `index.astro` — home page (hero, bio, projects section, recent posts)
- `blog/index.astro` — full blog listing (`/blog`)
- `blog/[slug].astro` — dynamic blog post pages (`/blog/<slug>`)
- `rss.xml.ts` — RSS feed endpoint (published posts only)
- `404.astro` — not found page

Post URLs live under `/blog/` for topical grouping. Old root-level post URLs and
`/posts` are kept alive via the `redirects` map in `astro.config.mjs` — add an entry
there if a slug ever changes. Build links with `postPath()` from `src/util/get-post.ts`
rather than hand-writing `/blog/${slug}`.

### Content

Blog posts live in `src/content/blog/` as Markdown files. The schema is defined in `src/content/config.ts` using Zod:

```ts
{ title, description, date, updated?, keywords, image?, published: boolean | 'preview' }
```

`published` is handled in `src/util/get-post.ts`:
- `true` — live, indexable, in the sitemap and RSS feed
- `'preview'` — built so the URL is shareable, but served with `noindex` and excluded from RSS
- `false` — draft, only reachable in `astro dev`

Import `posts` / `sortedPosts` for listings, `indexablePosts` for the feed. `getStaticPaths`
must use `posts` (never a raw `getCollection`) so drafts don't get built in production.

Set `updated` when revising a published post — it drives `dateModified` and `article:modified_time`.

Keep filenames ASCII: the filename becomes the slug, and accented characters produce
percent-encoded URLs. The same goes for image files.

### Data

`src/data/project.json` holds project metadata (GitHub owner/repo/description). The CI workflow rebuilds daily so that GitHub stats (stars, forks) stay fresh.

### Layouts & Components

`src/layouts/document.astro` is the root layout — it includes the `<head>`, nav, footer, and Schema.org JSON-LD structured data. All pages wrap their content with this layout.

Components in `src/components/` are mostly presentational Astro components. Link lists (nav links, social media links) are configured in `src/util/link/`.

### SEO

`src/components/seo.astro` uses `astro-seo` and receives typed props from `src/types/seo-props.ts`,
passed down as a single nested `seo` object: `<Document seo={{ ... }}>`. **Every page must pass its
own `seo`** — otherwise it inherits the home page's title, description and canonical URL, which makes
search engines treat it as a duplicate of `/`.

Set `type: 'article'` on posts to emit `og:type=article` plus the `article:*` tags. `astro-seo` also
emits the `<meta name="robots">` tag, so don't add one to the layout.

Shared site constants (name, URL, locale, default description) live in `src/util/site.ts`.

Schema.org markup is built in `src/layouts/document.astro` as a single `@graph` containing a `Person`
and a `WebSite` node. Pages add their own node — `BlogPosting`, `Blog` — via the `schema` prop; it
references the person by `@id` (`/#person`) instead of repeating the author details.

`@astrojs/sitemap` generates `/sitemap-index.xml` (referenced from `public/robots.txt`); its `filter`
in `astro.config.mjs` excludes the redirect stubs.

### Images

Post illustrations live in `public/images/<post>/` and are referenced with a site-absolute
path. `src/util/lib/rehype-post-images.ts` rewrites every Markdown image into a `<figure>`,
turning the optional Markdown title into a `<figcaption>` and stamping the intrinsic size
onto the tag so the browser reserves the space before the file arrives:

```md
![alt text](/images/post/thing.png 'Caption shown under the image')
```

Share cards are derived files, never the illustration itself: a post image can be square or
several megabytes, and WhatsApp drops previews over ~300 KB while X and LinkedIn crop
anything far from 1.91:1. `pnpm images:og` renders a 1200x630 JPEG under that budget to
`public/images/og/<slug>.jpg` for every post (plus `site.jpg`, the fallback for every other
page), and `src/util/og-image.ts` resolves it by slug — no frontmatter involved. Run it after
adding or replacing a post image and commit the output; the cards are checked in.

`check:seo` fails the build when a page's `og:image` is missing, absent from `dist/`, over the
preview budget, or missing its `width`/`height`/`type` tags — without those most platforms
downgrade the card to a thumbnail. Dimensions come from `src/util/image-meta.ts`, which reads
PNG/JPEG/WebP/GIF headers at build time and returns `undefined` for anything else.

### Styling

Tailwind CSS with the `@tailwindcss/typography` plugin. Global styles (Tailwind directives, Poppins font imports) are in `src/style/global.css`. Custom font family (`Poppins`) is registered in `tailwind.config.mjs`.

Poppins is self-hosted via `@fontsource` (weights 300/400/600/700 imported in `global.css`). Don't
reintroduce the Google Fonts `<link>` — it blocks first paint and hurts Core Web Vitals.

### Icons

Icons use `astro-icon` with the `@iconify-json/mdi` (Material Design Icons) set. Reference icons with the `mdi:` prefix.

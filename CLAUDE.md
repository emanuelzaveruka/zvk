# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start local development server
pnpm build      # Build for production
pnpm preview    # Preview production build locally
```

No lint or test commands are configured. The package manager is pnpm (enforced at v9.12.0).

## Architecture

This is a static portfolio/blog site for Emanuel Zaveruka built with **Astro 5** and **Tailwind CSS**. It deploys to GitHub Pages via GitHub Actions on push to `main` and on a daily schedule (to refresh GitHub project data).

### Routing & Pages

File-based routing under `src/pages/`:
- `index.astro` — home page (hero, bio, projects section, recent posts)
- `posts.astro` — full blog listing
- `[slug].astro` — dynamic blog post pages
- `404.astro` — not found page

### Content

Blog posts live in `src/content/blog/` as Markdown files. The schema is defined in `src/content/config.ts` using Zod:

```ts
{ title, description, date, keywords, image?, published: boolean | 'preview' }
```

Posts with `published: false` are filtered out in production (`get-post.ts` checks `NODE_ENV`). The `'preview'` value allows staging unpublished posts.

### Data

`src/data/project.json` holds project metadata (GitHub owner/repo/description). The CI workflow rebuilds daily so that GitHub stats (stars, forks) stay fresh.

### Layouts & Components

`src/layouts/document.astro` is the root layout — it includes the `<head>`, nav, footer, and Schema.org JSON-LD structured data. All pages wrap their content with this layout.

Components in `src/components/` are mostly presentational Astro components. Link lists (nav links, social media links) are configured in `src/util/link/`.

### SEO

`src/components/seo.astro` uses `astro-seo` and receives typed props from `src/types/seo-props.ts`. Schema.org markup is injected inline in the document layout.

### Styling

Tailwind CSS with the `@tailwindcss/typography` plugin. Global styles (Tailwind directives, Poppins font imports) are in `src/style/global.css`. Custom font family (`Poppins`) is registered in `tailwind.config.mjs`.

### Icons

Icons use `astro-icon` with the `@iconify-json/mdi` (Material Design Icons) set. Reference icons with the `mdi:` prefix.

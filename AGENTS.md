# AGENTS.md

Review and contribution rules for this repository. `CLAUDE.md` holds the fuller
architecture notes; this file is the short version plus the things that break
silently.

This is a static Astro 5 + Tailwind portfolio and blog, built to `dist/` and
deployed to GitHub Pages. `pnpm build` then `pnpm check:seo` is the gate — no
lint or test suite is configured.

## Review focus

Review only what a change actually touches, and prefer real defects over style
notes. If a change looks sound, say so briefly rather than inventing concerns.

These invariants all build green when violated, so they are worth checking
explicitly:

- **Every page passes its own `seo` prop** to the Document layout, as a nested
  object. A page without one inherits the home page's title, description and
  canonical URL, so search engines treat it as a duplicate of `/`.
- **Post links use `postPath()`** from `src/util/get-post.ts`, never a
  hand-written `/blog/${slug}`.
- **Canonical URLs, sitemap entries, RSS links and internal hrefs agree on the
  same trailing-slash form.**
- **Content and image filenames are ASCII.** A post's filename becomes its URL
  slug, and accents produce percent-encoded URLs.
- **`getStaticPaths` uses the filtered `posts` export**, never a raw
  `getCollection`, or unpublished drafts get built and indexed.
- **A changed slug or route needs a matching entry in the `redirects` map** in
  `astro.config.mjs`.
- **Fonts stay self-hosted through `@fontsource`.** A Google Fonts `<link>`
  blocks first paint.
- **A new or replaced post image needs `pnpm images:og` re-run and its card
  committed.** `public/images/og/<slug>.jpg` is what social platforms render;
  `check:seo` fails when a card is missing, absent from the build, over the
  300 KB preview budget, or missing its width/height/type tags.

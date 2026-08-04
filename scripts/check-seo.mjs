/**
 * Post-build SEO assertions.
 *
 * These exist because a nested-prop bug once made every page serve the home
 * page's title, description and canonical URL, which told search engines the
 * posts were duplicates of `/`. The build succeeded the whole time. Nothing
 * but an assertion on the generated HTML catches that class of regression.
 *
 * Run with `pnpm check:seo` after `pnpm build`.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = process.argv[2] ?? 'dist';
const failures = [];
const fail = (msg) => failures.push(msg);

const htmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });

const one = (html, re) => {
  const matches = [...html.matchAll(re)];
  return { count: matches.length, value: matches[0]?.[1] };
};

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `pnpm build` first.');
  process.exit(1);
}

// --- Feed and sitemap must exist; robots.txt must point at the real sitemap ---
const sitemapIndex = join(DIST, 'sitemap-index.xml');
for (const required of [sitemapIndex, join(DIST, 'sitemap-0.xml'), join(DIST, 'rss.xml')]) {
  if (!existsSync(required)) fail(`missing generated file: ${relative(DIST, required)}`);
}

const robots = existsSync(join(DIST, 'robots.txt'))
  ? readFileSync(join(DIST, 'robots.txt'), 'utf8')
  : '';
const advertised = robots.match(/^Sitemap:\s*(\S+)/m)?.[1];
if (!advertised) {
  fail('robots.txt has no Sitemap: directive');
} else if (!advertised.endsWith('/sitemap-index.xml')) {
  fail(`robots.txt advertises ${advertised}, but the build emits /sitemap-index.xml`);
}

// --- Per-page invariants ---
const canonicals = new Map(); // canonical URL -> pages claiming it
const pages = htmlFiles(DIST);

if (!pages.length) fail('no HTML pages were generated');

for (const file of pages) {
  const page = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const head = html.split('</head>')[0];

  const isRedirectStub = /http-equiv="refresh"/.test(html);
  const robotsMeta = one(html, /<meta name="robots" content="([^"]*)"/g);
  const noindex = robotsMeta.value?.includes('noindex');

  const title = one(html, /<title>([^<]*)<\/title>/g);
  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/g);

  if (title.count !== 1) fail(`${page}: expected 1 <title>, found ${title.count}`);
  if (canonical.count !== 1) fail(`${page}: expected 1 canonical, found ${canonical.count}`);
  if (robotsMeta.count !== 1) fail(`${page}: expected 1 robots meta, found ${robotsMeta.count}`);

  if (isRedirectStub) continue;

  const description = one(html, /<meta name="description" content="([^"]*)"/g);
  if (description.count !== 1) {
    fail(`${page}: expected 1 meta description, found ${description.count}`);
  }

  // Anything indexable must own a unique canonical. Duplicates are the exact
  // symptom of metadata not reaching the SEO component.
  if (!noindex && canonical.value) {
    const claimed = canonicals.get(canonical.value) ?? [];
    claimed.push(page);
    canonicals.set(canonical.value, claimed);
  }

  // Article-specific tags must land in <head>, where crawlers read them.
  const isPost = page.startsWith('blog/') && page !== 'blog/index.html';
  if (isPost && !noindex) {
    if (!/<meta property="og:type" content="article"/.test(head)) {
      fail(`${page}: post is missing og:type=article in <head>`);
    }
    if (!/<meta property="article:published_time"/.test(head)) {
      fail(`${page}: post is missing article:published_time in <head>`);
    }
    if (!/"@type":"BlogPosting"/.test(html)) {
      fail(`${page}: post is missing BlogPosting JSON-LD`);
    }
  }
}

for (const [url, claimed] of canonicals) {
  if (claimed.length > 1) {
    fail(`duplicate canonical ${url} claimed by: ${claimed.join(', ')}`);
  }
}

// --- The sitemap must list exactly the indexable pages ---
if (existsSync(join(DIST, 'sitemap-0.xml'))) {
  const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
  const locs = new Set([...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]));

  for (const url of canonicals.keys()) {
    if (!locs.has(url)) fail(`indexable page ${url} is missing from the sitemap`);
  }
  for (const loc of locs) {
    if (!canonicals.has(loc)) {
      fail(`sitemap lists ${loc}, which is not an indexable page (noindex or a redirect?)`);
    }
  }
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} SEO check(s) failed:\n`);
  for (const failure of failures) console.error(`  • ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ SEO checks passed across ${pages.length} generated page(s)`);

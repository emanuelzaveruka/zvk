/**
 * Generates the images that social platforms show when a link is shared.
 *
 * A post's own illustration is the wrong file to hand a crawler: it can be
 * square, or several megabytes. WhatsApp silently drops previews over ~300 KB,
 * and Twitter/LinkedIn crop anything that isn't close to 1.91:1. So every post
 * gets a derived 1200x630 JPEG here, committed alongside the source image, and
 * `src/util/og-image.ts` picks it up automatically by slug.
 *
 * Run with `pnpm images:og` after adding or replacing a post image.
 */
import { readFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const POSTS_DIR = 'src/content/blog';
const PUBLIC_DIR = 'public';
const OUT_DIR = join(PUBLIC_DIR, 'images/og');

/** The size every platform agrees on. */
const WIDTH = 1200;
const HEIGHT = 630;
/** WhatsApp's preview ceiling — the tightest budget of the lot. */
const MAX_BYTES = 300 * 1024;
/** Matches the page background, so letterboxed art doesn't sit on white. */
const BACKGROUND = '#171717';

const frontmatter = (markdown) => {
  const block = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const field = (name) => block.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim();
  return { image: field('image')?.replace(/^['"]|['"]$/g, '') };
};

/** Near-landscape art survives a crop; squares and portraits must be padded. */
const fitFor = (meta) => {
  const ratio = meta.width / meta.height;
  return ratio > 1.5 && ratio < 2.4 ? 'cover' : 'contain';
};

const render = async (source, target) => {
  const image = sharp(source);
  const meta = await image.metadata();
  const resized = image.resize(WIDTH, HEIGHT, {
    fit: fitFor(meta),
    background: BACKGROUND,
    withoutEnlargement: false
  });

  // Step the quality down until the file fits the tightest platform budget.
  for (const quality of [84, 76, 68, 60, 52]) {
    await resized.clone().jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(target);
    if (statSync(target).size <= MAX_BYTES) return { quality, bytes: statSync(target).size };
  }

  return { quality: 52, bytes: statSync(target).size };
};

const targets = [
  // The fallback card for every page that isn't a post.
  { name: 'site', image: '/images/logo.png' },
  ...readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({
      name: file.replace(/\.md$/, ''),
      image: frontmatter(readFileSync(join(POSTS_DIR, file), 'utf8')).image
    }))
];

mkdirSync(OUT_DIR, { recursive: true });

let failures = 0;

for (const { name, image } of targets) {
  if (!image) {
    console.warn(`· ${name}: no \`image\` in frontmatter — will fall back to the site card`);
    continue;
  }

  const source = join(PUBLIC_DIR, decodeURIComponent(image));

  if (!existsSync(source)) {
    console.error(`✗ ${name}: ${image} does not exist`);
    failures += 1;
    continue;
  }

  const target = join(OUT_DIR, `${name}.jpg`);
  const { quality, bytes } = await render(source, target);
  const over = bytes > MAX_BYTES ? ' (still over budget!)' : '';
  console.log(`✓ ${name}.jpg — ${(bytes / 1024).toFixed(0)} KB at q${quality}${over}`);
  if (over) failures += 1;
}

if (failures) process.exit(1);

import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Intrinsic size of an image sitting in `public/`, read straight from its
 * header at build time.
 *
 * Crawlers decide whether to render a link preview before they download the
 * image, so `og:image:width`/`height` are what make the card show up at full
 * size instead of as a thumbnail — or not at all. Browsers use the same numbers
 * on in-post images to reserve space and avoid layout shift.
 *
 * Only the formats this site actually ships are parsed; anything else returns
 * `undefined` and every caller degrades to simply omitting the dimensions.
 */
export interface ImageMeta {
  width: number;
  height: number;
  /** MIME type, for `og:image:type`. */
  type: string;
  bytes: number;
}

const PUBLIC_DIR = fileURLToPath(new URL('../../public/', import.meta.url));

const cache = new Map<string, ImageMeta | undefined>();

const readHeader = (buffer: Buffer): Omit<ImageMeta, 'bytes'> | undefined => {
  // PNG: IHDR is always the first chunk, at a fixed offset.
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), type: 'image/png' };
  }

  // GIF: logical screen descriptor, little-endian.
  if (buffer.length > 10 && buffer.toString('ascii', 0, 3) === 'GIF') {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8), type: 'image/gif' };
  }

  // WebP: RIFF container, one of three frame headers.
  if (
    buffer.length > 30 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = buffer.toString('ascii', 12, 16);
    const type = 'image/webp';

    if (chunk === 'VP8X') {
      return {
        width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
        height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
        type
      };
    }
    if (chunk === 'VP8 ') {
      return {
        width: buffer.readUInt16LE(26) & 0x3fff,
        height: buffer.readUInt16LE(28) & 0x3fff,
        type
      };
    }
    if (chunk === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, type };
    }
  }

  // JPEG: no fixed offset — walk the segments until a start-of-frame marker.
  if (buffer.length > 4 && buffer.readUInt16BE(0) === 0xffd8) {
    let offset = 2;

    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

      if (isStartOfFrame) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
          type: 'image/jpeg'
        };
      }

      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }

  return undefined;
};

/** `path` is a site-absolute URL path, e.g. `/images/foo.png`. */
export const getImageMeta = (path?: string): ImageMeta | undefined => {
  if (!path || !path.startsWith('/')) return undefined;
  if (cache.has(path)) return cache.get(path);

  let meta: ImageMeta | undefined;

  try {
    const file = join(PUBLIC_DIR, decodeURIComponent(path));
    const header = readHeader(readFileSync(file));
    if (header) meta = { ...header, bytes: statSync(file).size };
  } catch {
    // A missing or unreadable file is reported by the post-build SEO check,
    // which sees the whole generated site; here it just means no dimensions.
    meta = undefined;
  }

  cache.set(path, meta);
  return meta;
};

import { getImageMeta } from '../image-meta';

/**
 * Turns the plain `<img>` that Markdown produces into a proper illustration.
 *
 * Authoring stays ordinary Markdown:
 *
 *   ![alt text](/images/post/thing.png 'Caption shown under the image')
 *
 * The title becomes a `<figcaption>`, and every image gets its intrinsic size
 * stamped on it so the browser reserves the space before the file arrives —
 * without that, a post full of screenshots shifts under the reader while it
 * loads, which is both unpleasant and a Core Web Vitals penalty.
 */
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const isWhitespace = (node: HastNode) =>
  node.type === 'text' && typeof node.value === 'string' && node.value.trim() === '';

/** A paragraph holding nothing but an image is an illustration, not prose. */
const loneImage = (node: HastNode): HastNode | undefined => {
  if (node.tagName !== 'p') return undefined;

  const meaningful = (node.children ?? []).filter((child) => !isWhitespace(child));
  const [only] = meaningful;

  return meaningful.length === 1 && only?.tagName === 'img' ? only : undefined;
};

const describe = (image: HastNode) => {
  const properties = image.properties ?? {};
  const meta = getImageMeta(typeof properties.src === 'string' ? properties.src : undefined);

  image.properties = {
    ...properties,
    loading: 'lazy',
    decoding: 'async',
    ...(meta && { width: meta.width, height: meta.height })
  };
};

export default function rehypePostImages() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;

      node.children = node.children.map((child) => {
        walk(child);

        if (child.tagName === 'img') describe(child);

        const image = loneImage(child);
        if (!image) return child;

        describe(image);

        const caption = image.properties?.title;
        if (caption) delete image.properties?.title;

        return {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            image,
            ...(typeof caption === 'string' && caption
              ? [
                  {
                    type: 'element',
                    tagName: 'figcaption',
                    properties: {},
                    children: [{ type: 'text', value: caption }]
                  }
                ]
              : [])
          ]
        } satisfies HastNode;
      });
    };

    walk(tree);
  };
}

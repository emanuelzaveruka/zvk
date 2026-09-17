import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { indexablePosts, postPath } from '../util/get-post';
import { getImageMeta } from '../util/image-meta';
import { ogImage } from '../util/og-image';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '../util/site';

export async function GET(context: APIContext) {
  return rss({
    title: `${SITE_NAME} — Blog`,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: indexablePosts.map((post) => {
      // Feed readers render the enclosure as the item's image, the same way a
      // chat app renders og:image — so it points at the same share card.
      const sharePath = ogImage(post.slug) ?? post.data.image;
      const meta = getImageMeta(sharePath);

      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: postPath(post.slug),
        categories: post.data.keywords,
        ...(sharePath &&
          meta && {
            enclosure: {
              url: new URL(sharePath, context.site ?? SITE_URL).toString(),
              length: meta.bytes,
              type: meta.type
            }
          })
      };
    }),
    customData: '<language>pt-br</language>'
  });
}

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { indexablePosts, postPath } from '../util/get-post';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '../util/site';

export async function GET(context: APIContext) {
  return rss({
    title: `${SITE_NAME} — Blog`,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: indexablePosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postPath(post.slug),
      categories: post.data.keywords
    })),
    customData: '<language>pt-br</language>'
  });
}

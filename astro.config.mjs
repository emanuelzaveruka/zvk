// @ts-check
import { defineConfig } from 'astro/config';
//import tailwindcss from "@tailwindcss/vite";
import tailwind from '@astrojs/tailwind';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import icon from "astro-icon";
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://emanuelzaveruka.com',
    trailingSlash: 'ignore',
    // Posts moved from /<slug> to /blog/<slug>; these keep the old URLs alive.
    // GitHub Pages can't issue real 301s, so Astro emits meta-refresh pages,
    // which search engines still follow and consolidate.
    redirects: {
      '/posts': '/blog/',
      '/aplicando-bdd-20-no-dia-a-dia-ganhos-e-contras':
        '/blog/aplicando-bdd-2-0-no-dia-a-dia-ganhos-e-contras/',
      '/ferramentas-que-utilizo-para-construção-de-diagramas':
        '/blog/ferramentas-para-construcao-de-diagramas/'
    },
    markdown: {
    rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
    shikiConfig: {
      wrap: true,
      theme: 'vitesse-dark'
    }
  },
  integrations: [
    icon({
    include: {
      mdi: [  
          'github',
          'account-file-outline',
          'npm',
          'linkedin',
          'at',
          'arrow-left',
          'file-download',
          'lightbulb-alert-outline',
          'home-variant',
          'post-outline',
          'downloads',
          'discord',
          'star',
          'content-copy',
          'check']
    }
  }),
    sitemap({
      i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR' } },
      // Redirect stubs and the 404 must stay out of the sitemap.
      filter: (page) =>
        !['/posts/', '/aplicando-bdd-20-no-dia-a-dia-ganhos-e-contras/'].some((path) =>
          page.endsWith(path)
        ) && !decodeURIComponent(page).includes('construção')
    }),
    tailwind()]
});
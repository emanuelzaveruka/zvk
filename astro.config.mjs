// @ts-check
import { defineConfig } from 'astro/config';
//import tailwindcss from "@tailwindcss/vite";
import tailwind from '@astrojs/tailwind';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
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
          'star']
    }
  }),
    tailwind()]
});
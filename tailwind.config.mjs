  import typographyPlugin from '@tailwindcss/typography';
  import defaultTheme from 'tailwindcss/defaultTheme';

  /** @type {import('tailwindcss').Config} */
  export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        },
        // Palette for the redesigned home only. Namespaced on purpose: the rest
        // of the site keeps using Tailwind's `neutral-*`, so these tokens can't
        // change the blog, the post pages or the 404 by accident.
        colors: {
          home: {
            bg: '#141518',
            surface: '#191B1F',
            text: '#F0F0ED',
            muted: '#A3A7AD',
            accent: '#A9CFFF',
            border: '#2A2D32',
            'on-accent': '#141518'
          }
        },
        maxWidth: {
          home: '1040px'
        }
      }
    },
    plugins: [typographyPlugin]
  };

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ashishvishwakarma.com',
  base: '/tatva/',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => {
        // Exclude single quote pages and tag taxonomy archives
        if (page.includes('/quote/')) return false;
        if (page.includes('/tag/')) return false;
        return true;
      },
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

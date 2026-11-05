// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import alpinejs from '@astrojs/alpinejs';

// https://astro.build/config
export default defineConfig({
  site: 'https://impurrfect-bar.meowracle.space',
  integrations: [sitemap({
    namespaces: { news: false, xhtml: false, video: false },
    // /menu-preview and /ops-finance are noindex routes — keep them out of the sitemap.
    filter: (page) => !page.includes('/menu-preview') && !page.includes('/ops-finance'),
  }), alpinejs({ entrypoint: '/src/alpine.ts' })],
  vite: {
    plugins: [tailwindcss()]
  }
});
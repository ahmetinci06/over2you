import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ahmetinci06.github.io',
  base: '/over2you',
  build: {
    assets: '_assets'
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});

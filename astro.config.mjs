// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://over2you.shop',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { twnPlugin } from 'tailwind-nested/vite';

export default defineConfig({
  plugins: [twnPlugin(), tailwindcss()],
  build: {
    minify: false,
    cssMinify: false,
  },
});

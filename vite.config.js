import { defineConfig } from 'vite';
export default defineConfig({ root: 'trade', base: '/trade/', publicDir: false, build: { outDir: '../dist/trade', emptyOutDir: true } });

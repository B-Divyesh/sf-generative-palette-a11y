import { defineConfig } from 'vite';
export default defineConfig({ publicDir: 'public', build: { target: 'es2022', outDir: 'dist', assetsInlineLimit: 0 } });

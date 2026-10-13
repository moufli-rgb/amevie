import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// Configuration Vite.
// En local, `npm run dev` sert uniquement le front-end.
// Pour tester aussi les fonctions /api, utilisez `vercel dev` (voir GUIDE-MISE-EN-LIGNE.md).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 3000, host: '0.0.0.0' },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
  },
});

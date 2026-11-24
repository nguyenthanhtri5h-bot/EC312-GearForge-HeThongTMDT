import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/wp-content/themes/gearforge-child/assets/flagship/',
  build: {
    outDir: '../assets/flagship',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'flagship.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css')
            ? 'flagship.css'
            : 'chunks/[name]-[hash][extname]',
      },
    },
  },
});

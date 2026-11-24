import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The kit's packages are linked from ../../packages; dedupe makes them use
// this app's React, router and query client instead of the kit's own copies.
// In development the API runs beside this app (cd ../backend && php artisan
// serve); when deployed, both are served from one domain.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom', 'react-router', '@tanstack/react-query', 'framer-motion', 'lucide-react', 'react-hot-toast', 'react-hook-form'],
  },
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/storage': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion'] },
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {
      usePolling: true,
      interval: 1000,
      ignored: ['**/*.pdf', '**/*.bin', '**/*.jpg', '**/*.png', '**/dist/**', '**/node_modules/**'],
    },
  },
});

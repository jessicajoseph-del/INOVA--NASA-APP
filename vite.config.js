import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['face-api.js'],
    },
  },
  server: {
    port: 800,
    strictPort: false,
    host: true,
  },
})

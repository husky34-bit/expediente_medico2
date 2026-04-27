import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
    // Permitir que el SW se sirva correctamente en dev
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
  // Asegurar que los assets del public/ se copien correctamente
  publicDir: 'public',
  build: {
    // Generar sourcemaps para facilitar debug
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['date-fns'],
        },
      },
    },
  },
})

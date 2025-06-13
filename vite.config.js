import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
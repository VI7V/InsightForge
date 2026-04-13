import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, '.'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'build'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'public/index.html')
    }
  },
  server: {
    port: 3000
  }
})
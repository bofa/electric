import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000, // Change this if you want a different dev server port
  },
  build: {
    outDir: './docs',
    emptyOutDir: true, // also necessary
  }
})
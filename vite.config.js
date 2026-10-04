import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "./", // relative paths: works on any host/subpath (needed for the service worker)
  plugins: [react()],
})

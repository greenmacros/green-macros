import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))
const build = new Date().toISOString() // identifies this exact build

// Writes dist/version.json so open pages can tell when a newer build has been deployed.
const versionFile = () => ({
  name: "gm-version-file",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ version, build }) })
  }
})

// https://vite.dev/config/
export default defineConfig({
  base: "./", // relative paths: works on any host/subpath (needed for the service worker)
  plugins: [react(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_BUILD__: JSON.stringify(build)
  }
})

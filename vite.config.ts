import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Relatieve base: de build werkt zo op elke subpath (GitHub Pages projectsite,
  // een eigen subfolder, of gewoon lokaal geopend) zonder dat de repo-naam bekend hoeft te zijn.
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})

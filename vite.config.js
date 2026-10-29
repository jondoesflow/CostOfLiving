import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // cost.html is only a carrier for the live-cost script that the
      // running-cost pages embed (see scripts/build-site.mjs). widget/ is the
      // embeddable box other sites put in an iframe.
      input: { main: "index.html", cost: "cost.html", widget: "widget/index.html" },
    },
  },
})

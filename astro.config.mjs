// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // Leaflet est chargé à l'approche de la carte : le préparer dès le démarrage
    // évite une optimisation tardive et des URL de modules périmées en dev.
    optimizeDeps: {
      include: ['leaflet', 'proj4', '@observablehq/plot']
    }
  },

  adapter: netlify()
});

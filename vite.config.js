import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // relative base so the build works from any host or subfolder
  // (itch.io, GitHub Pages project sites, a zip served locally, etc.)
  base: './',
  plugins: [react(), tailwindcss()],
  // PORT comes from the preview harness when auto-assigned; 5199 for manual runs
  server: { port: Number(process.env.PORT) || 5199 },
});

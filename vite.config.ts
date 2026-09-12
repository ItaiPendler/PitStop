import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
// base must match the GitHub Pages repo path: https://<user>.github.io/PitStop/
export default defineConfig({
  base: '/PitStop/',
  plugins: [react(), tailwindcss()],
});

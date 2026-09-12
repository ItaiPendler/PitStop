import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, transformWithEsbuild } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const appBase = '/PitStop/';
const appDescription =
  "PitStop is a small, collaborative web app for tracking a car's fuel efficiency and history.";

const transpileNonErasableTypeScript = () => ({
  enforce: 'pre' as const,
  name: 'transpile-non-erasable-typescript',
  async transform(code: string, id: string) {
    const filePath = id.split('?')[0];
    const isTypeScriptFile = /src[\\/].+\\.tsx?$/.test(filePath);
    if (!isTypeScriptFile) return null;

    return transformWithEsbuild(code, filePath, {
      jsx: 'preserve',
      loader: filePath.endsWith('.tsx') ? 'tsx' : 'ts',
      target: 'es2023',
    });
  },
});

// https://vite.dev/config/
// base must match the GitHub Pages repo path: https://<user>.github.io/PitStop/
export default defineConfig({
  base: appBase,
  plugins: [
    transpileNonErasableTypeScript(),
    react(),
    tailwindcss(),
    VitePWA({
      injectRegister: 'auto',
      manifest: {
        background_color: '#0b1326',
        description: appDescription,
        dir: 'rtl',
        display: 'standalone',
        lang: 'he',
        name: 'PitStop',
        scope: appBase,
        short_name: 'PitStop',
        start_url: appBase,
        theme_color: '#0b1326',
      },
      pwaAssets: {
        image: 'public/icon.svg',
        overrideManifestIcons: true,
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,html,ico,js,png,svg,webmanifest}'],
        runtimeCaching: [],
      },
    }),
  ],
});

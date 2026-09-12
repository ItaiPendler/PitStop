import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, transformWithEsbuild } from 'vite';

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
  base: '/PitStop/',
  plugins: [transpileNonErasableTypeScript(), react(), tailwindcss()],
});

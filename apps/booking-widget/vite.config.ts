import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tsConfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8888,
  },
  plugins: [preact(), tsConfigPaths()],
});

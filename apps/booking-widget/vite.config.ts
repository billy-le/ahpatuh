import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import terser from '@rollup/plugin-terser';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    devtools(),
    solidPlugin(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
    }),
    tailwindcss(),
  ],
  server: {
    port: 8000,
    cors: true,
  },
  preview: {
    port: 8000,
    cors: true,
  },
  build: {
    target: 'esnext',
    lib: {
      entry: 'src/index.tsx',
      name: 'AhpatuhBookingWidget',
      formats: ['iife', 'es'],
      fileName: (format) =>
        format === 'iife' ? 'ahpatuh-widget.js' : `ahpatuh-widget.${format}.js`,
    },
    rollupOptions: {
      output: {
        entryFileNames: 'ahpatuh-widget.js',
        exports: 'named',
        plugins: [terser()],
      },
    },
    watch: process.env.NODE === 'development' ? {} : null,
  },
});

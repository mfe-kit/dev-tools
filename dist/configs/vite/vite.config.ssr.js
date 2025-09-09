import { defineConfig, mergeConfig } from 'vite';

import baseConfig from './vite.config.js';

export default defineConfig(() =>
  mergeConfig(
    baseConfig(),
    defineConfig({
      mode: 'production',
      build: {
        emptyOutDir: false,
        outDir: '../dist/backend',
        target: 'esnext',
        lib: {
          name: 'frontend',
          entry: 'frontend/index.ts',
          formats: ['es'],
          fileName: () => 'frontend.es.mjs',
        },
      },
    }),
  ),
);

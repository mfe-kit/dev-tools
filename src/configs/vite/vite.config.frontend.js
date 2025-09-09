import { defineConfig, mergeConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import playgroundServe from '@mfe-kit/dev-tools';
import baseConfig from './vite.config.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'src', '');
  const rootConfig = 'src';

  return mergeConfig(
    baseConfig(),
    defineConfig({
      server: {
        port: 7000,
        deps: {
          inline: ['@mfe-kit/core'],
        },
      },
      build: {
        outDir: '../dist/frontend',
        emptyOutDir: true,
        target: 'esnext',
        lib: {
          name: 'frontend',
          entry: 'frontend/index.ts',
          formats: ['iife'],
          fileName: () => 'index.js',
        },
      },
      plugins: [
        playgroundServe(rootConfig, env),
        viteStaticCopy({
          targets: [
            {
              src: ['manifest.yaml'],
              dest: './',
              transform: (contents) =>
                contents
                  .toString()
                  .replace(/__FRONTEND__/g, env.VITE_FRONTEND_URL)
                  .replace(/__BACKEND__/g, env.VITE_BACKEND_URL),
            },
          ],
        }),
      ],
    }),
  );
});

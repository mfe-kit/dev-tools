import { defineConfig } from 'vite';

export default defineConfig(() => {
  const rootConfig = 'src';

  const testConfig = {
    globals: true,
    environment: 'jsdom',
    include: ['../test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../coverage',
      all: true,
      exclude: ['**/*.d.ts', 'test/**', '**/node_modules/**'],
    },
  };

  return {
    appType: 'custom',
    root: rootConfig,
    cacheDir: '../node_modules/.vite',
    test: testConfig,
    optimizeDeps: {
      exclude: ['@mfe-kit/core'],
    },
  };
});

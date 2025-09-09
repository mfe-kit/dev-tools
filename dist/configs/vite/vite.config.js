import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

function getHeadCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

const COMMIT_HASH = getHeadCommitHash();

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
    define: {
      __COMMIT_HASH__: JSON.stringify(COMMIT_HASH),
    },
  };

  return {
    appType: 'custom',
    root: rootConfig,
    cacheDir: '../node_modules/.vite',
    test: testConfig,
  };
});

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
const BUILT_AT = new Date().toISOString();

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
    define: {
      __COMMIT_HASH__: JSON.stringify(COMMIT_HASH),
      __BUILT_AT__: JSON.stringify(BUILT_AT),
    },
  };
});

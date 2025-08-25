import eslintConfig from './src/configs/eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  eslintConfig,
  {
    files: ['src/setup-scripts/*'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
  },
]);

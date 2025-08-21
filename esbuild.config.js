import { fileURLToPath } from 'url';
import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, 'src');
const outDir = path.resolve(__dirname, 'dist');

const typesSrc = path.join(srcDir, 'types');
const typesOut = path.join(outDir, 'types');

const configsSrc = path.join(srcDir, 'configs');
const configsOut = path.join(outDir, 'configs');

const playgroundSrc = path.join(srcDir, 'playground-plugin');
const playgroundOut = path.join(outDir, 'playground-plugin');

fs.cpSync(playgroundSrc, playgroundOut, { recursive: true });
fs.cpSync(configsSrc, configsOut, { recursive: true });
fs.cpSync(typesSrc, typesOut, { recursive: true });

build({
  entryPoints: [
    path.join(playgroundSrc, 'index.js'),
    path.join(playgroundSrc, 'templates/js/demo.js'),
    path.join(playgroundSrc, 'templates/js/landing.js'),
  ],
  outdir: playgroundOut,
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'esm',
  platform: 'node',
  external: [
    'hono',
    '@hono/node-server',
    '@hono/node-server/serve-static',
    'nunjucks',
    'js-yaml',
    'markdown-it',
    'markdown-it-anchor',
    'highlight.js',
    'events',
    'fs',
    'path',
  ],
}).catch(() => process.exit(1));

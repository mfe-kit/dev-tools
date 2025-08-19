import { fileURLToPath } from 'url';
import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, 'src');
const outDir = path.resolve(__dirname, 'dist');
const entryFile = path.join(srcDir, 'index.js');
const templatesSrc = path.join(srcDir, 'templates');
const templatesDest = path.join(outDir, 'templates');

build({
  entryPoints: [entryFile],
  outfile: path.join(outDir, 'index.js'),
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

fs.cpSync(templatesSrc, templatesDest, { recursive: true });

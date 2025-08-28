import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js/lib/common';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function playgroundServ(root) {
  const app = new Hono();
  let manifest;

  nunjucks.configure(path.join(__dirname, 'templates'), {
    autoescape: true,
    watch: false,
    noCache: true,
  });

  const demoHtml = nunjucks.render('./pages/demo.njk', { manifest });
  const prerenderHtml = nunjucks.render('./pages/prerender.njk', { manifest });
  const landingHtml = nunjucks.render('./pages/landing.njk', { manifest });
  const docsHtml = nunjucks.render('./pages/docs.njk', {
    text: generateDocsText(root),
    manifest,
  });

  app.use('/css/*', serveStatic({ root: path.join(__dirname, 'templates') }));
  app.use('/js/*', serveStatic({ root: path.join(__dirname, 'templates') }));
  app.use(
    '/assets/*',
    serveStatic({ root: path.join(__dirname, 'templates') }),
  );
  app.use(
    '/favicon.png',
    serveStatic({ path: path.join(__dirname, 'templates/favicon.png') }),
  );

  app.get('/prerender', async (c) => c.html(prerenderHtml));
  app.get('/demo', (c) => c.html(demoHtml));
  app.get('/documentation', (c) => c.html(docsHtml));
  app.get('/', (c) => c.html(landingHtml));

  return {
    name: 'vite:playground-serv',
    async buildStart() {
      const manifestPath = path.resolve(process.cwd(), 'src/manifest.yaml');
      const content = fs.readFileSync(manifestPath, 'utf8');
      manifest = yaml.load(content, 'utf8');
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const request = new Request(`http://localhost${req.url}`, {
          method: req.method,
          headers: req.headers,
        });
        const response = await app.fetch(request);
        if (!response.ok) {
          next();
          return;
        }
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        const body = await response.arrayBuffer();
        res.end(Buffer.from(body));
      });
    },
  };
}

function generateDocsText(root) {
  const md = MarkdownIt({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            '<pre><code class="hljs">' +
            hljs.highlight(str, { language: lang, ignoreIllegals: true })
              .value +
            '</code></pre>'
          );
        } catch {
          void 0;
        }
      }
      return (
        '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
      );
    },
  });
  md.use(markdownItAnchor);
  const mdPath = path.resolve(`${root}/openmfe/index.md`);
  const mdRaw = fs.readFileSync(mdPath, 'utf8');
  const text = md.render(mdRaw);
  return text;
}

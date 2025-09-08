import { fileURLToPath } from 'url';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import hljs from 'highlight.js/lib/common';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function playgroundServe(root, env) {
  const app = new Hono();
  let manifest;

  nunjucks.configure(path.join(__dirname, 'templates'), {
    autoescape: true,
    watch: false,
    noCache: true,
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

  app.get('/prerender', async (c) => {
    let prerender = '';
    if (env.VITE_BACKEND_URL) {
      try {
        const result = await fetch(`${env.VITE_BACKEND_URL}/api/prerender`);
        prerender = await result.text();
      } catch (e) {
        prerender = e.message;
      }
    } else {
      prerender = '<h2>No prerender URL provided!(url/api/prerender)</h2>';
    }
    const html = nunjucks.render('./pages/prerender.njk', {
      manifest,
      prerender,
    });
    return c.html(html);
  });
  app.get('/demo', (c) => {
    const html = nunjucks.render('./pages/demo.njk', { manifest });
    return c.html(html);
  });
  app.get('/documentation', (c) => {
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
          '<pre><code class="hljs">' +
          md.utils.escapeHtml(str) +
          '</code></pre>'
        );
      },
    });
    md.use(markdownItAnchor);
    const mdPath = path.resolve(`${root}/openmfe/index.md`);
    const mdRaw = fs.readFileSync(mdPath, 'utf8');
    const text = md.render(mdRaw);
    const html = nunjucks.render('./pages/docs.njk', { text, manifest });
    return c.html(html);
  });
  app.get('/', (c) => {
    const html = nunjucks.render('./pages/landing.njk', { manifest });
    return c.html(html);
  });

  return {
    name: 'vite:playground-serve',
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

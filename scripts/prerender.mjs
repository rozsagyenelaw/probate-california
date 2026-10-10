// Build step (runs after `vite build` and the SSR build, see package.json "build"):
// 1. renders every public page to static HTML so phones see the content before JavaScript runs,
// 2. writes sitemap.xml listing every public page,
// 3. reports internal links that lead nowhere.
// Public pages are discovered by following links from the home page plus the seed list below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ORIGIN = 'https://myprobateca.com';

// Paths that belong to the signed-in app (never prerendered, never in the sitemap)
const APP_PATHS = /^\/(login|register|forgot-password|dashboard|payment|payment-success|intake|documents|petition|publication|bond|hearing|supplements|letters|inventory|creditors|final-petition|closing|messages|request-accounting|request-court-appearance|asset-discovery|vault|admin|sign)(\/|$)/;
// Paths served by redirects (netlify.toml / _redirects): valid links, not pages
const REDIRECTED = new Set(['/free-consultation', '/california-probate-courts', '/learn-california-probate/probate-timeline-california']);

const { render } = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const { CITY_DATA } = await import(pathToFileURL(path.join(root, 'src', 'data', 'cityData.js')).href);

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: dist/index.html has no empty #root');

// SPA shell for the signed-in app and unknown addresses (served by the /* fallback)
const shell = template.replace(/<title>[\s\S]*?<\/title>/, '<title>MyProbateCA</title>\n    <meta name="robots" content="noindex" />');
fs.writeFileSync(path.join(dist, 'app-shell.html'), shell);

const seeds = ['/', '/california-probate-administration', '/probate-court-locations-california', '/probate-faq-california',
  '/learn-california-probate', '/terms', '/privacy',
  ...Object.keys(CITY_DATA).map((slug) => `/locations/${slug}-probate-attorney`)];

const queue = [...seeds];
const seen = new Set(queue);
const pages = [];
const broken = [];        // { from, to }
const linkFrom = new Map();

const normalize = (href) => {
  if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return null;
  let u;
  try { u = new URL(href, ORIGIN); } catch { return null; }
  if (u.origin !== ORIGIN) return null;
  let p = decodeURI(u.pathname);
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
};

const headFrom = (helmet) => {
  if (!helmet) return '';
  return ['title', 'meta', 'link', 'script'].map((k) => helmet[k].toString()).filter(Boolean).join('\n    ');
};

while (queue.length) {
  const route = queue.shift();
  let out;
  try {
    out = await render(route);
  } catch (err) {
    broken.push({ from: linkFrom.get(route) || '(seed)', to: route, error: String(err && err.message || err) });
    continue;
  }
  const { html, helmet } = out;
  const noindex = /name="robots"[^>]*noindex/.test(helmet ? helmet.meta.toString() : '');
  if (!html.trim() || noindex) {
    broken.push({ from: linkFrom.get(route) || '(seed)', to: route, error: noindex ? 'renders the Not Found page' : 'renders nothing (client redirect)' });
    continue;
  }
  const page = template
    .replace(/<title>[\s\S]*?<\/title>/, headFrom(helmet))
    // The page is already readable from the HTML; the app script must not compete with the
    // first paint for the phone's bandwidth, so it is fetched at low priority.
    .replace(/<script type="module" crossorigin src=/g, '<script type="module" crossorigin fetchpriority="low" src=')
    .replace(/<link rel="modulepreload" crossorigin href=/g, '<link rel="modulepreload" crossorigin fetchpriority="low" href=')
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const file = route === '/' ? path.join(dist, 'index.html') : path.join(dist, `${route.slice(1)}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page);
  pages.push(route);

  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const p = normalize(m[1].replace(/&amp;/g, '&'));
    if (!p || seen.has(p)) continue;
    if (APP_PATHS.test(p) || REDIRECTED.has(p)) continue;
    seen.add(p);
    linkFrom.set(p, route);
    queue.push(p);
  }
}

const today = new Date().toISOString().slice(0, 10);
const priority = (p) => (p === '/' ? '1.0' : /^\/locations\//.test(p) ? '0.7' : /^\/(terms|privacy)$/.test(p) ? '0.3' : '0.8');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.slice().sort().map((p) => `  <url><loc>${ORIGIN}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><priority>${priority(p)}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(root, 'dist-ssr', 'prerender-report.json'), JSON.stringify({ pages, broken }, null, 1));

console.log(`prerender: ${pages.length} public pages written, sitemap.xml has ${pages.length} URLs`);
if (broken.length) {
  console.warn(`prerender: ${broken.length} internal link(s) lead nowhere:`);
  for (const b of broken) console.warn(`  ${b.from} -> ${b.to}: ${b.error}`);
  if (process.env.PRERENDER_STRICT) process.exit(1);
}

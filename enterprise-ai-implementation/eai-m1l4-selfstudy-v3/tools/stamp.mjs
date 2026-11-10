// Version stamp: every link to the lesson's own code and content carries "?v=<version>", so a new
// push to GitHub Pages is never shown from a browser's cache (Pages lets a browser keep files for
// 10 minutes, and a file whose URL has not changed may be reused even longer).
// The version is a hash of the stamped files' contents with their stamps left out: any change to the
// code, the styles or the two pages gives a new version, and nothing else does.
// Stamped: index.html and review.html (the stylesheet links and the module script), every relative
// import in src/ (static and dynamic: one module must be imported with one URL everywhere, or it would
// load twice), and the review toolbar's stylesheet URL.
// Not stamped: the content file (src/engine.js and src/review/page.js fetch it with cache: 'no-cache':
// the browser asks the server every time whether it changed), fonts, images, films.
// Usage: npm run stamp     (tools/check.mjs fails while the stamp is stale or a link is missing it)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ROOT } from './serve.mjs';

const STAMP = /\?v=[0-9a-f]{8}/g;
// a relative module path in an import or a dynamic import(), a stylesheet / script link, a content fetch
const PATTERNS = [
  /((?:\bfrom\s*|\bimport\s*\(\s*)['"])(\.{1,2}\/[^'"?]+\.(?:js|json|css))(\?v=[0-9a-f]{8})?(['"])/g,
  /((?:href|src)=")(src\/[^"?]+\.(?:css|js))(\?v=[0-9a-f]{8})?(")/g,
  /(new URL\(\s*['"])(\.{1,2}\/[^'"?]+\.css)(\?v=[0-9a-f]{8})?(['"])/g,
];
// a content fetch: no stamp, it is revalidated on every load instead (tools/check.mjs checks the option)
const JSON_STAMP = /(new URL\(\s*['"]\.{1,2}\/[^'"?]+\.json)\?v=[0-9a-f]{8}(['"])/g;

const walkDir = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walkDir(p) : [p]; });
// the files whose links are stamped, and the files whose contents make the version
export const stampedFiles = () => [join(ROOT, 'index.html'), join(ROOT, 'review.html'), ...walkDir(join(ROOT, 'src')).filter((p) => /\.(js|css)$/.test(p))];
const hashedFiles = () => stampedFiles().sort();

export function currentVersion() {
  const h = createHash('sha1');
  for (const f of hashedFiles()) h.update(relative(ROOT, f).replace(/\\/g, '/') + '\n' + readFileSync(f, 'utf8').replace(/\r\n/g, '\n').replace(STAMP, '') + '\n');
  return h.digest('hex').slice(0, 8);
}

// every stampable link in a text: [{ path, stamp }] (stamp '' when it has none)
export function linksOf(text) {
  return PATTERNS.flatMap((re) => [...text.matchAll(re)].map((m) => ({ path: m[2], stamp: m[3] || '' })));
}

export function applyStamp(version = currentVersion()) {
  let changed = 0;
  for (const f of stampedFiles()) {
    const before = readFileSync(f, 'utf8');
    const after = PATTERNS.reduce((t, re) => t.replace(re, (_, a, p, _s, z) => `${a}${p}?v=${version}${z}`), before.replace(JSON_STAMP, '$1$2'));
    if (after !== before) { writeFileSync(f, after, 'utf8'); changed++; }
  }
  return { version, changed };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { version, changed } = applyStamp();
  console.log(`stamp: version ${version}, ${changed} file(s) updated`);
}

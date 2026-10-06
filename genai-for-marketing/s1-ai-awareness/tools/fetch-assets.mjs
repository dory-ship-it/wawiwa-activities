// Downloads EVERYTHING the published Storyline block uses (photos, videos, audio,
// captions, slide data) into ../source/storyline-published/, keeping the original paths.
// Run on Dor's Mac (needs internet):   node tools/fetch-assets.mjs
// Node 18+ (built-in fetch). Safe to re-run: existing files are skipped.

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://articulateusercontent.com/rise/courses/u6F2CaAVqzPA3JIrEUdVK_JMr64_Zz38/LEvy_sRc0XLCnMpP/';
const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'source', 'storyline-published');

const seen = new Set();
const failed = [];

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function get(path, asText) {
  if (seen.has(path)) return null;
  seen.add(path);
  const dest = join(OUT, path);
  const res = await fetch(BASE + path);
  if (!res.ok) { failed.push(`${res.status} ${path}`); return null; }
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(dest), { recursive: true });
  if (!(await exists(dest))) await writeFile(dest, buf);
  return asText ? buf.toString('utf8') : null;
}

// Every asset path the player references
const PATH_RE = /(?:story_content|mobile|html5\/data\/js)\/[A-Za-z0-9_\-. %()]+?\.(?:png|jpe?g|gif|svg|mp4|mp3|m4a|webm|js|html|vtt|json|woff2?)/g;

function pathsIn(text) {
  const clean = text.replace(/\\\//g, '/');
  return [...new Set(clean.match(PATH_RE) || [])];
}

async function crawl(path) {
  const isText = /\.(js|html|json|vtt)$/i.test(path);
  const txt = await get(path, isText);
  if (txt) for (const p of pathsIn(txt)) await crawl(p);
}

for (const p of ['story.html', 'html5/data/js/data.js', 'html5/data/js/frame.js', 'html5/data/js/paths.js', 'mobile/fonts.json']) {
  await crawl(p);
}

console.log(`Downloaded/checked ${seen.size} files into ${OUT}`);
if (failed.length) { console.log('FAILED:\n' + failed.join('\n')); process.exitCode = 1; }

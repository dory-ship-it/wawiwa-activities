// Build check: validates content/s1.json and the files it points at. Exit code 1 on any problem.
// Runs on every sync PR (P3) and by hand:  node tools/check.mjs
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const content = JSON.parse(readFileSync(join(root, 'content/s1.json'), 'utf8'));
const KNOWN_TYPES = new Set(['cover-video', 'media-text', 'section', 'agenda', 'timeline-slider', 'reveal', 'carousel', 'audio-hotspots', 'youtube', 'drag-drop', 'table', 'finale']);

if (!Array.isArray(content.screens) || content.screens.length !== 33) problems.push(`expected 33 screens, found ${content.screens?.length}`);
const ids = new Set();
content.screens.forEach((s, i) => {
  if (s.n !== i + 1) problems.push(`screen ${i + 1}: n is ${s.n}`);
  if (!s.id || ids.has(s.id)) problems.push(`screen ${s.n}: missing or duplicate id`);
  ids.add(s.id);
  if (!KNOWN_TYPES.has(s.type)) problems.push(`screen ${s.n}: unknown type "${s.type}"`);
  if (!s.title) problems.push(`screen ${s.n}: missing title`);
  if (!('deckSlideId' in s)) problems.push(`screen ${s.n}: missing deckSlideId`);
  else if (!(s.deckSlideId === null || typeof s.deckSlideId === 'string' || (Array.isArray(s.deckSlideId) && s.deckSlideId.every(x => typeof x === 'string')))) problems.push(`screen ${s.n}: deckSlideId must be null, a string or a list of strings`);
});

// every referenced file must exist
const walk = (v, path) => {
  if (typeof v === 'string') {
    if (/^(source|assets)\//.test(v) && !existsSync(join(root, v))) problems.push(`${path}: file not found ${v}`);
  } else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
};
walk(content, 'content');
const layout = JSON.parse(readFileSync(join(root, 'src/screens/layout.json'), 'utf8'));
try { const snap = JSON.parse(readFileSync(join(root, 'content/last-sync.json'), 'utf8')); if (typeof snap.slides !== 'object') problems.push('content/last-sync.json: missing "slides"'); } catch (e) { problems.push('content/last-sync.json: ' + e.message); }
try { const map = JSON.parse(readFileSync(join(root, 'sync/deck-mapping.json'), 'utf8')); if (!Array.isArray(map.screens) || map.screens.length !== 33) problems.push('sync/deck-mapping.json: expected 33 screens'); } catch (e) { problems.push('sync/deck-mapping.json: ' + e.message); }
walk(layout, 'layout');
for (let n = 2; n <= 33; n++) if (!layout.screens[n]) problems.push(`layout missing for screen ${n}`);

// Dor's two rules
const all = JSON.stringify(content);
if (/\b(19|20)\d\d\s*©/.test(all) || /©\s*(19|20)\d\d\b/.test(all)) problems.push('a footer still carries a year');
if (/Confidencial/i.test(all)) problems.push('"Confidencial" must be "Confidential"');
if (!content.footer?.text?.includes('© Oded Israeli, Wawiwa Tech')) problems.push('footer text must be "© Oded Israeli, Wawiwa Tech"');

// the page must reference only files that exist
for (const f of ['index.html', 'src/engine.js', 'src/main.js', 'src/frame.css', 'src/fonts.css', 'src/components/index.js', 'src/screen.js', 'src/screens/layout.json', 'source/storyline-published/html5/data/js/paths.js']) if (!existsSync(join(root, f))) problems.push(`missing ${f}`);
const fontsCss = readFileSync(join(root, 'src/fonts.css'), 'utf8');
for (const m of fontsCss.matchAll(/url\(([^)]+)\)/g)) { const p = join(root, 'src', m[1]); if (!existsSync(p)) problems.push(`fonts.css: file not found ${m[1]}`); }

if (problems.length) { console.error('CHECK FAILED\n- ' + problems.join('\n- ')); process.exit(1); }
console.log(`OK: ${content.screens.length} screens, all referenced files present, footer has no year, "Confidential" spelled right.`);

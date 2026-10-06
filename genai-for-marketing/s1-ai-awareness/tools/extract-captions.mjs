// Converts the published block's caption files (story_content/<id>_captions.js, URL-encoded WebVTT)
// into plain .vtt files under assets/captions/. Run:  node tools/extract-captions.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sc = join(root, 'source/storyline-published/story_content');
const out = join(root, 'assets/captions'); mkdirSync(out, { recursive: true });
let n = 0;
for (const f of readdirSync(sc).filter(f => f.endsWith('_captions.js'))) {
  const src = readFileSync(join(sc, f), 'utf8');
  const m = /globalLoadJsAsset\('[^']+',\s*(\{.*\})\);?\s*$/s.exec(src);
  if (!m) { console.warn('skip', f); continue; }
  const json = JSON.parse(m[1]);
  const cap = json.captions?.find(c => /^en/.test(c.langCode)) || json.captions?.[0];
  if (!cap) continue;
  const vtt = decodeURIComponent(cap.data).replace(/\r\n/g, '\n');
  writeFileSync(join(out, f.replace('_captions.js', '.vtt')), vtt);
  n++;
}
console.log(n, 'caption files written to assets/captions/');

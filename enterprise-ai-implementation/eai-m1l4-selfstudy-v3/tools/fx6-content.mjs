// FX6 content: each screen's look (src/compose.js for the question screens; the scene for the others).
// Re-runnable: it sets the look of every listed screen, whatever it was. Usage: node tools/fx6-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');

// the question screens: text (head left, task right), framed (the photo framed under the head), photo /
// photo-right (the photo as a full column), none (the screen's own wide layout); a mix along each chapter.
// The other task screens (sorts, tiles, labels, flags) stand on the light ground.
const LOOK = {
  O2: 'light', O3: 'light', K1: 'light', K2: 'light', S05a: 'light', K4: 'light',
  S01: 'framed', S02: 'text', W1: 'photo', S03: 'text',
  W2: 'photo-right', S06: 'framed', S08: 'text', S08B: 'photo-right',
  W3: 'photo', S10: 'text', S11: 'framed', S12B: 'framed',
  W4: 'photo-right', S14: 'photo', S15: 'photo-right', S17: 'text', S17B: 'framed',
  S18A: 'none', S18: 'photo', S18B: 'framed', S19A: 'none', S19B: 'none', S19C: 'photo-right', S20: 'framed', S20B: 'text',
  S21: 'text', S22: 'photo',
  S04: 'light', S05b: 'light', S07: 'light', S09: 'light', S12: 'light', S13: 'light', S16: 'light',
};
for (const [id, look] of Object.entries(LOOK)) {
  const re = new RegExp(`("id": "${id}",\\n      )"look": "[^"]*",\\n      `);
  if (re.test(t)) t = t.replace(re, `$1"look": "${look}",\n      `);
  else if (t.includes(`"id": "${id}",`)) t = t.replace(`"id": "${id}",`, `"id": "${id}",\n      "look": "${look}",`);
  else throw new Error('no screen ' + id);
}
if (!t.includes('"$fx6"')) t = t.replace('"schemaVersion": "1.0",', '"schemaVersion": "1.0",\n  "$fx6": "FX6 (8 Nov 2026): the looks (tools/fx6-content.mjs, src/compose.js) and the upgraded V1 film.",');
JSON.parse(t);
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('fx6-content: looks set for ' + Object.keys(LOOK).length + ' screens');

// FX7 content: each question screen's media (src/compose.js: "photo" = its photo full-bleed on the left,
// "wide" = one panel across, no photo; S03 takes "cases" from its video cases whatever its look), and the
// locked Check's label of a one-answer question. Re-runnable (it sets the values, whatever they were).
// Usage: node tools/fx7-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');

// photo: a character or a scene carries the screen; wide: the task needs the whole width (two-column
// tasks, five answers, the workbook page, the knowledge check); none: the screen keeps its own layout
// (Noy, 8 Nov: "why is every screen split in half? crowded": the split only where the picture carries the
// screen: Dana on S01, the two video cases on S03, the four warm-ups; every other screen one wide panel)
const LOOK = {
  S01: 'photo', S02: 'wide', W1: 'photo', S03: 'photo',
  W2: 'photo', S06: 'wide', S08: 'wide', S08B: 'wide',
  W3: 'photo', S10: 'wide', S11: 'wide', S12B: 'wide',
  W4: 'photo', S14: 'wide', S15: 'wide', S17: 'wide', S17B: 'wide',
  S18A: 'none', S18: 'wide', S18B: 'wide', S19A: 'none', S19B: 'none', S19C: 'wide', S20: 'wide', S20B: 'wide',
  S21: 'wide', S22: 'wide',
};
for (const [id, look] of Object.entries(LOOK)) {
  const re = new RegExp(`("id": "${id}",\\n      )"look": "[^"]*",\\n      `);
  if (re.test(t)) t = t.replace(re, `$1"look": "${look}",\n      `);
  else if (t.includes(`"id": "${id}",`)) t = t.replace(`"id": "${id}",`, `"id": "${id}",\n      "look": "${look}",`);
  else throw new Error('no screen ' + id);
}
const c = JSON.parse(t);
// the locked Check of a one-answer question (src/templates/decision.js rowQuestion)
if (!c.ui.checkWhy.one) t = t.replace('"pick": "Pick {n} first",', '"pick": "Pick {n} first",\n      "one": "Choose one first",');
// the state in words on a marked answer card (src/templates/stage.js paintAnswer)
if (!c.ui.marks) t = t.replace('"checkWhy": {', '"marks": { "yours": "Your answer", "right": "Right answer" },\n    "checkWhy": {');
if (!t.includes('"$fx7"')) t = t.replace('"schemaVersion": "1.0",', '"schemaVersion": "1.0",\n  "$fx7": "FX7 (8 Nov 2026): the original look rearranged (tools/fx7-content.mjs, src/compose.js, src/fx7.css): photo / cases / wide media, select then Check.",');
const out = JSON.parse(t);
if (out.ui.checkWhy.one !== 'Choose one first') throw new Error('checkWhy.one not set');
if (out.ui.marks?.right !== 'Right answer') throw new Error('marks not set');
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('fx7-content: looks set for ' + Object.keys(LOOK).length + ' screens; checkWhy.one');

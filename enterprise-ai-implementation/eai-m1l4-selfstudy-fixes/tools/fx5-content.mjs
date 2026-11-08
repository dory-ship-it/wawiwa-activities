// FX5 content edits on content/l4-slice.json (8 Nov 2026, Noy's review of the FX4 copy), as text (the
// file's hand format kept). Runs once after tools/fx4-content.mjs (marker "$fx5").
// Usage: node tools/fx5-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
if (t.includes('"$fx5"')) { console.log('fx5-content: already applied'); process.exit(0); }
if (!t.includes('"$fx4"')) throw new Error('run tools/fx4-content.mjs first');

const all = (a, b) => { if (!t.includes(a)) throw new Error('missing: ' + a.slice(0, 100)); t = t.split(a).join(b); };
const after = (id, line) => all(`"id": "${id}",`, `"id": "${id}",\n      ${line}`);

/* ---- interface lines ---- */
all('"revealed": "Here is the right answer.",', '"revealed": "Not quite. Here is the right answer.",');
all('"allPlaced": "Every card is in its place.",', '"allPlaced": "Every card is in its place.",\n      "allPlacedNow": "Every card is in its place now.",');
all('"checkWhy": { "pick": "Pick {n} first.", "labels": "Place every label first.", "flags": "Place both flags first.", "fields": "Choose a card for every field.", "red": "Change the red ones first." },',
  '"checkWhy": { "pick": "Pick {n} first", "labels": "Place every label first", "flags": "Place both flags first", "fields": "Fill every field first", "red": "Change the red ones first" },');
all('"speedChip": "{x}×"', '"speedChip": "{x}×",\n      "speedMenu": "Playback speed",\n      "speedNormal": "Normal"');

/* ---- S02: the line names the fallback; no question button that looks like a link ---- */
all('"text": "Use the case you chose in Lesson 1."', '"text": "Use your Lesson 1 case, or any repeating process you know well."');
all('"middle": { "kind": "fields", "arrange": "stack", "help": { "icon": "info", "text": "No Homework 1 at hand? Use any repeating process you know well." }, "link": "@links.homework1" },',
  '"middle": { "kind": "fields", "arrange": "stack", "link": "@links.homework1" },');

/* ---- the flags: a click places the next flag, so the instructions say click ---- */
all('"instruction": "Drag the two risk flags onto the fields with the handoff risk."', '"instruction": "Click the two fields that show the handoff risk."');
all('"instruction": "Drag the Start and End flags onto the HR process line."', '"instruction": "Click where the HR process starts, then where it ends."');

/* ---- S14, S15: the situation inside the question panel ---- */
after('S14', '"onePanel": true,');
after('S15', '"onePanel": true,');

/* ---- S07: the question gets its tag ---- */
all('"question": "Pick the field that shows, in three months, whether the change worked."', '"question": "Pick the field that shows, in three months, whether the change worked.",\n      "questionChip": "Question"');

/* ---- the looks (Noy: not the same photo background on every screen) ---- */
const LOOK = {
  band: ['S02', 'S03', 'S07', 'S08B', 'S09', 'S11', 'S12B', 'S13', 'S17', 'S18B', 'S19C'],
  split: ['S06', 'S17B', 'S20'],
  light: ['S04', 'S05b', 'S10', 'S12', 'S16', 'S18A', 'S19A', 'S19B', 'S20B', 'S21'],
};
for (const [look, ids] of Object.entries(LOOK)) ids.forEach((id) => after(id, `"look": "${look}",`));

all('"schemaVersion": "1.0",', '"schemaVersion": "1.0",\n  "$fx5": "FX5 (8 Nov 2026): tools/fx5-content.mjs; Noy\'s review of the FX4 copy.",');
JSON.parse(t);
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('fx5-content done');

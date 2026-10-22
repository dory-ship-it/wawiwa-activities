// FX1 content edits on content/l4-slice.json, as text (UTF-8, the file's hand format kept): each edit
// is idempotent, so the script can run again. Usage: node tools/fx1-content.mjs <group>
//   B   "attempts": 2 on the practice choice, sort, tile and flag screens of Intro to Ch4; the choice
//       screens' ghost target becomes the sweep over the options
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
// the file's line ends (CRLF in this checkout) are kept: the edits work on LF and go back at the end
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
const group = process.argv[2];

// the text of one screen object (from its "id" line to the next screen's)
function screenSpan(id) {
  const a = t.indexOf(`"id": "${id}",`);
  if (a < 0) throw new Error('no screen ' + id);
  const b = t.indexOf('\n      "id": "', a + 1);
  return [a, b < 0 ? t.length : b];
}
function editScreen(id, fn) {
  const [a, b] = screenSpan(id);
  const before = t.slice(a, b), after = fn(before);
  if (after !== before) t = t.slice(0, a) + after + t.slice(b);
}
// a line after the screen's "template" line (indent kept), unless the key is there already
const addAfterTemplate = (id, key, line) => editScreen(id, (s) => (s.includes(`"${key}":`) ? s : s.replace(/("template": "[^"]+",\n)/, `$1      ${line}\n`)));

if (group === 'B') {
  const PRACTICE = ['S01', 'S03', 'S04', 'S05b', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17'];
  PRACTICE.forEach((id) => addAfterTemplate(id, 'attempts', '"attempts": 2,'));
  editScreen('S01', (s) => s.replace('"ghost": { "type": "choice", "target": "below-panel" }', '"ghost": { "type": "choice", "target": "options-sweep" }'));
  editScreen('S03', (s) => s.replace('"ghost": { "type": "pickTwo", "target": "gutter-left" }', '"ghost": { "type": "pickTwo", "target": "options-sweep" }'));
}

if (group === 'input') {
  // B1 / D4: the ghost hand's demo line per field (pilot copy, typed on screen, never stored)
  const DEMO = {
    S02: { TITLE: 'Sales call summaries', PROBLEM: 'Today reps write call notes by hand.' },
    S08B: { TRIGGER: 'A sales call ends', STEPS: 'The rep types notes; the manager reads them', OUTPUT: 'A summary, to the sales manager' },
    S12B: { BASELINE: 'About 2 days', TARGET: 'Same day', DATE: 'Within 3 months' },
    S17B: { AIFIT: 'Sort notes by topic', HUMAN: 'Approve a discount' },
  };
  for (const [id, fields] of Object.entries(DEMO)) {
    editScreen(id, (s) => Object.entries(fields).reduce((acc, [k, v]) => (acc.includes(`"demo": "${v}"`) ? acc
      : acc.replace(`"store": "L4_CASE_${k}"`, `"demo": "${v}", "store": "L4_CASE_${k}"`)), s));
  }
  // D4: S02's head above the panel, Save enabled once both fields have text, the locked Next's words
  addAfterTemplate('S02', 'headAbove', '"headAbove": true,');
  addAfterTemplate('S02', 'lockedNext', '"lockedNext": "Save to continue",');
  editScreen('S02', (s) => s.replace('"saveAlwaysEnabled": true', '"saveWhenFilled": true'));
  // G1: S17B gets the privacy line beside its note
  editScreen('S17B', (s) => (s.includes('"privacy":') ? s : s.replace(/("bottom": \{ "kind": "note")/, '"privacy": { "kind": "privacy", "icon": "shield", "text": "Leave out names and identifying details." },\n        $1')));
}

JSON.parse(t); // still valid JSON
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('fx1-content', group, 'done');

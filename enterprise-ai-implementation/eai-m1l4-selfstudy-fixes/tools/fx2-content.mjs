// FX2 content edits on content/l4-slice.json (Noy's fixes, 22 Oct 2026), as text (UTF-8, the file's hand
// format kept): each edit is idempotent, so the script can run again. Usage: node tools/fx2-content.mjs <group>
//   D   fewer drags: S17 one case at a time (decision / cases), S18A the workbook rows (decision / fields)
//   E   S19 card 1 heading "Your case"
//   G   the END screen (slice, ch6, its screen, ui)
//   H   S21R one-line missed stems and their allowance; the clipboard fallback line (and the keys on Copy)
//   F   texts the new fit check found cut off
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
const group = process.argv[2];

function screenSpan(id) {
  const a = t.indexOf(`"id": "${id}",`);
  if (a < 0) return null;
  const b = t.indexOf('\n      "id": "', a + 1);
  return [a, b < 0 ? t.length : b];
}
function editScreen(id, fn) {
  const span = screenSpan(id);
  if (!span) throw new Error('no screen ' + id);
  const [a, b] = span;
  const before = t.slice(a, b), after = fn(before);
  if (after !== before) t = t.slice(0, a) + after + t.slice(b);
}
const once = (from, to) => { if (!t.includes(to)) { if (!t.includes(from)) throw new Error('not found: ' + from.slice(0, 60)); t = t.replace(from, to); } };
const inScreen = (id, from, to) => editScreen(id, (s) => { if (s.includes(to)) return s; if (!s.includes(from)) throw new Error(`${id}: not found: ${from.slice(0, 60)}`); return s.replace(from, to); });

if (group === 'D') {
  // S17: no drag; one case at a time, the five mistakes as answer cards (the old columns)
  inScreen('S17', '"template": "sortDeck",', '"template": "decision",\n      "variant": "cases",');
  inScreen('S17', '"instruction": "Read the five mistakes, then drag each case to the one it shows."', '"instruction": "Read each case, then pick the mistake it shows."');
  inScreen('S17', '"hint": "Drag the card to a column. Or press 1 to 5 to choose a column, then Enter."', '"hint": "Two tries per case."');
  inScreen('S17', '"layout": "sort-deck",\n      "columns": [', '"layout": "focus",\n      "options": [');
  inScreen('S17', '"advance": "after-all-placed",', '"advance": "after-all-cases",');
  inScreen('S17', '"ghost": { "type": "drag", "showMe": false },\n      "deckSize": "wide",', '"ghost": { "type": "choice", "target": "options-sweep", "showMe": true },');
  inScreen('S17', '"why": "storyboard v3 decision (S17 \\"read, then sort\\": five columns with their one-line definitions, no separate K5 screen): the definitions stay on screen; one case at a time on the deck, the placed ones as \\"Case n\\""\n      },\n      "placedLabel": "caseChip"',
    '"why": "storyboard v3 decision (S17 \\"read, then sort\\": the five mistakes with their one-line definitions, no separate K5 screen); FX2 D1: one case at a time, the mistakes as answer cards"\n      }');
  // S18A: no drag; the workbook rows, a select of the cards in each
  inScreen('S18A', '"template": "sortDeck",', '"template": "decision",\n      "variant": "fields",');
  inScreen('S18A', '"instruction": "Drag each card to its field."', '"instruction": "Choose the card for each field."');
  inScreen('S18A', '"hintShown": true,\n      "layout": "sort-deck",', '"layout": "focus",');
  inScreen('S18A', '"why": "storyboard v3 Ch5-6 (S18A as S04: the header chip, the hint line and four columns with their subtitles, all four cards placed; text as approved)" },\n      "ghost": { "type": "drag", "showMe": false },',
    '"why": "storyboard v3 Ch5-6 (S18A: the header chip, the hint line and four fields with their subtitles, all four cards chosen; text as approved; FX2 D2: workbook rows with a select)" },');
  inScreen('S18A', '{ "id": "a", "label": "Field 2: Trigger",', '{ "id": "a", "n": 2, "label": "Field 2: Trigger",');
  inScreen('S18A', '{ "id": "b", "label": "Field 3: Steps",', '{ "id": "b", "n": 3, "label": "Field 3: Steps",');
  inScreen('S18A', '{ "id": "c", "label": "Field 7: Gaps",', '{ "id": "c", "n": 7, "label": "Field 7: Gaps",');
  inScreen('S18A', '"advance": "after-all-placed",', '"advance": "after-check",');
  // ui: the case counter, "Next case", the select's first line, why Next is locked
  once('"situation": "Situation {i} of {n}", "opened"', '"situation": "Situation {i} of {n}", "caseOf": "Case {i} of {n}", "opened"');
  // FX2 B: no placed card shows "Card n" / "Case n" any more
  once('"round": "Round {i} of {n}", "caseChip": "Case {i}", "cardChip": "Card {i}", "question"', '"round": "Round {i} of {n}", "question"');
  once('"nextQuestion": "Next question",', '"nextQuestion": "Next question",\n      "nextCase": "Next case",');
  once('"copyFallback":', '"chooseCard": "Choose a card",\n    "copyFallback":');
  once('"rounds": "Next, locked until all three rounds are answered",', '"rounds": "Next, locked until all three rounds are answered",\n        "cases": "Next, locked until you answer all five cases",\n        "fields": "Next, locked until every field has its card and is checked",');
}

if (group === 'E') {
  inScreen('S19', '{ "id": "case", "from": "S02", "chip": "Field 1 · Process name" }', '{ "id": "case", "label": "Your case", "from": "S02", "chip": "Field 1 · Process name" }');
}

if (group === 'G') {
  once('"S21", "S21R", "S22"]', '"S21", "S21R", "S22", "END"]'); // the slice
  once('"screens": ["S21", "S21R", "S22"],', '"screens": ["S21", "S21R", "S22", "END"],'); // ch6
  // S22 opens END after Finish; END closes with Previous only
  once('"last": "Next, locked: this is the last screen of the lesson",', '"last": "Next, locked: this is the last screen of the lesson",\n        "finish": "Next, locked until you finish the lesson",');
  once('"finished": "Lesson finished. Your result is saved. You can close this window."', '"finished": "Lesson finished. Your result is saved."');
  if (!t.includes('"id": "END",')) {
    const a = t.lastIndexOf('    {\n', t.indexOf('"id": "S22",'));
    const b = t.indexOf('\n    }', a) + '\n    }'.length;
    t = t.slice(0, b) + `,
    {
      "id": "END",
      "chapter": "ch6",
      "template": "end",
      "step": { "verb": "Finish", "icon": "start", "join": true },
      "presentation": true,
      "minutes": 0,
      "instruction": "Lesson complete",
      "accent": "complete",
      "sub": "Process Modeling and Workflow Mapping · Module 1",
      "passed": { "chip": "Passed" },
      "notPassed": { "chip": "Not passed yet", "hint": "You can retake the knowledge check in Wrap-up at any time." },
      "next": "Next: Lesson 6, in your own time.",
      "homework": { "href": "@links.homework" },
      "advance": "none",
      "tracking": [],
      "sources": ["FX2 G (22 Oct 2026): the films' branded end card (design-decisions-log); the homework link is S22's"]
    }` + t.slice(b);
  }
}

if (group === 'H') {
  // H1: each missed item's stem cut to a short one-line topic (the full question stays on S21)
  const stems = { i1: 'Field 4 handoff', i2: 'First AI step', i3: 'Report baseline', i4: 'Field 7 unknowns', i5: 'HR map errors' };
  for (const [item, stem] of Object.entries(stems)) {
    editScreen('S21R', (s) => (s.includes(`{ "item": "${item}", "stem":`) ? s : s.replace(`{ "item": "${item}", "text":`, `{ "item": "${item}", "stem": "${stem}", "text":`)));
  }
  inScreen('S21R', '"wordLimit": { "max": 120, "why": "storyboard v3 Ch5-6 S21R, worst case (all five items missed): each missed item\'s stem, its line and its review link; open question in review/nl4/REPORT.md" },',
    '"wordLimit": { "max": 60, "why": "storyboard v3 Ch5-6 S21R, worst case (all five items missed): the chip and its line, each missed item\'s one-line stem and its line (the review links are buttons, not counted); FX2 H1 (Noy, 22 Oct 2026)" },');
  // H2: the clipboard fallback names both keyboards
  once('"copyFallback": "Press Ctrl+C",', '"copyFallback": "Press Ctrl+C (Cmd+C on Mac)",');
  once('"copyFallback": "Press Ctrl+C (Cmd+C on Mac)",', '"copyFallback": "Press Ctrl+C (Cmd+C on Mac)",\n    "copyKeys": "Ctrl+C",');
}

if (group === 'F') {
  // FX2 F (the new fit check): S16 card 6 needed three lines in its column (cut at two)
  inScreen('S16', '"text": "Summarize a question before escalation"', '"text": "Summarize before escalating"');
}

JSON.parse(t); // still valid JSON
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('fx2-content', group, 'done');

// NL4 content edits on content/l4-slice.json (storyboard v3 Chapters 5-6, planning/STORYBOARD-V3-CH5-6.md,
// and the FX1 follow-ups), as text (UTF-8, the file's hand format kept): each edit is idempotent, so the
// script can run again. S18A, S18 and S18B were edited by hand. Usage: node tools/nl4-content.mjs <group>
//   A   Chapter 5: the slice and chapter lists, S19 rebuilt, S20 split into S20 (rows) and S20B (risk)
//   B   Chapter 6: S21 step, S21R (new), S22 (Stage, bridge line, record), the record labels
//   E   FX1 follow-ups: filled Save + "Save to continue" and the "Your case" card on the input screens
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
// replace a whole screen object ({ ... } with its blank line after) by new text
function replaceScreen(id, text) {
  const a = t.lastIndexOf('    {\n', t.indexOf(`"id": "${id}",`));
  const b = t.indexOf('\n    }', a) + '\n    }'.length;
  t = t.slice(0, a) + text.trim().replace(/^/gm, '    ').replace(/^ {4}$/gm, '') + t.slice(b);
}
const once = (from, to) => { if (!t.includes(to)) { if (!t.includes(from)) throw new Error('not found: ' + from.slice(0, 60)); t = t.replace(from, to); } };
const addAfterTemplate = (id, key, line) => editScreen(id, (s) => (s.includes(`"${key}":`) ? s : s.replace(/("template": "[^"]+",\n)/, `$1      ${line}\n`)));

if (group === 'A') {
  once('"S17B", "S18A", "S18", "S19", "S20", "S21", "S22"]', '"S17B", "S18A", "S18", "S18B", "S19", "S20", "S20B", "S21", "S21R", "S22"]');
  once('"minutes": 82, "screens": ["S18A", "S18", "S19", "S20"], "inSlice": true,\n      "sliceNote": "S18A and S18 come later; the slice enters Chapter 5 at S19.",\n      "pauseMarker": null },',
    '"minutes": 57, "screens": ["S18A", "S18", "S18B", "S19", "S20", "S20B"], "inSlice": true, "pauseMarker": null },');
  // ui: Copy (S19), the locked Next on S19, the retired safety / handoff reasons
  once('      "showMe": "Show me how"\n    },', '      "showMe": "Show me how",\n      "copy": "Copy",\n      "copied": "Copied",\n      "retake": "Retake now",\n      "backToCheck": "Back to the check"\n    },');
  once('    "ghost": { "pickOne": "Pick one", "pickTwo": "Pick two" },', '    "ghost": { "pickOne": "Pick one", "pickTwo": "Pick two" },\n    "copyFallback": "Press Ctrl+C",\n    "caseCard": "Your case",');
  once('        "safety": "Next, locked until you choose what to write and save your case title",\n        "handoff": "Next, locked until you are back from the workbook and your metric is saved",\n',
    '        "openWorkbook": "Next, locked until you open the workbook",\n');
  once('      "back": "I\'m back",\n', '');

  if (!t.includes('"copyCards"')) replaceScreen('S19', `
{
  "id": "S19",
  "chapter": "ch5",
  "template": "handoff",
  "locked": "openWorkbook",
  "step": { "verb": "Map", "icon": "overview" },
  "minutes": 42,
  "eyebrow": "Your workbook",
  "chip": "About 40 min",
  "instruction": "Map your own case in the workbook.",
  "hint": "Unknown? Write 'unclear'. It is a valid answer.",
  "wordLimit": {
    "max": 125,
    "why": "storyboard v3 Ch5-6 Q6 (accepted, document view, as S12): the brief, the four copy cards with their labels and field chips, the workbook's eight field names and the return line; the learner's own text is not counted"
  },
  "steps": [
    { "n": 1, "text": "Fill eight fields as the process runs today" },
    { "n": 2, "text": "Keep AI ideas off the map" },
    { "n": 3, "text": "Export your PDF" }
  ],
  "preview": {
    "alt": "The workbook: eight fields, from Process name to Success metric. Your notes go into Fields 1, 2, 3 and 8.",
    "altPilotCopy": true,
    "fields": ["Process name", "Trigger", "Steps and role owners", "Handoffs", "Sources, owners, sensitivity", "Existing controls", "Gaps and unclear points", "Success metric"],
    "fromNotes": [1, 2, 3, 8]
  },
  "copyCards": {
    "label": "Copy your notes into the workbook",
    "cards": [
      { "id": "case", "from": "S02", "chip": "Field 1 · Process name" },
      { "id": "sketch", "label": "Your sketch from Chapter 2", "from": "S08B", "chip": "Fields 2 and 3" },
      { "id": "metric", "label": "Your metric from Chapter 3", "from": "S12B", "chip": "Field 8" },
      { "id": "notes", "label": "Your notes from Chapter 4", "from": "S17B", "chip": "Not on the map: for Lesson 5", "off": true }
    ]
  },
  "privacy": { "kind": "privacy", "icon": "shield", "text": "Coach on: roles, no names." },
  "returnLine": "When you export your PDF, come back here and press Next.",
  "openFeedback": "The workbook is open in a new tab. This lesson keeps your place.",
  "ghost": { "type": "copy", "showMe": false },
  "handoff": {
    "activity": "eai-m1l4-class",
    "href": "@links.workbook",
    "newTab": true,
    "rel": "noopener noreferrer",
    "liveCoach": "on (Wawiwa policy: approved for real students since 2026-08-13)"
  },
  "advance": "after-open",
  "tracking": [],
  "suspend": ["opened"],
  "sources": ["planning/STORYBOARD-V3-CH5-6.md S19 (rebuilt) and Q2 (the workbook's fields, checked on eai-m1l4-class)", "s35", "s14", "s19", "s44"]
}`);

  if (!t.includes('"id": "S20B"')) replaceScreen('S20', `
{
  "id": "S20",
  "chapter": "ch5",
  "template": "decision",
  "step": { "verb": "Review", "icon": "explore" },
  "variant": "selfcheck",
  "minutes": 5,
  "instruction": "Check your map against three questions.",
  "hint": "Answer honestly. 'Not yet' gives you one fix to make.",
  "stage": { "top": { "kind": "line", "text": "Welcome back. Keep your PDF open." } },
  "choices": ["yes", "notYet"],
  "rows": [
    { "id": "q1", "icon": "person", "text": "Does every step name who exactly does it?", "trackingId": "L4_S20_1",
      "feedback": { "yes": "Every step has an owner. Lesson 5 can place AI or a person next to each one.",
                    "notYet": "A step without a role cannot be improved or monitored. Name the role, or write 'unclear' in Field 7." } },
    { "id": "q2", "icon": "clock", "text": "Does Field 4 say what happens if the receiver is unavailable?", "trackingId": "L4_S20_2",
      "feedback": { "yes": "Your handoffs cover the unavailable case. Delays now show up on the map, not in daily work.",
                    "notYet": "A handoff with no plan stalls. Add what happens, or record it as a gap." } },
    { "id": "q3", "icon": "ruler", "text": "Can a number show that the metric improved?", "trackingId": "L4_S20_3",
      "feedback": { "yes": "You can check your change later: baseline now, target to check against.",
                    "notYet": "Without a number, nobody can tell whether anything improved. Add a baseline, even estimated, and a target." } }
  ],
  "fixLine": "Make the fix in the workbook, export again, then press Next.",
  "link": "reopenWorkbook",
  "advance": "after-all-answered",
  "tracking": [
    { "id": "L4_S20_1", "type": "choice", "correctResponse": null, "scored": false, "bloom": "Evaluate", "result": "neutral" },
    { "id": "L4_S20_2", "type": "choice", "correctResponse": null, "scored": false, "bloom": "Evaluate", "result": "neutral" },
    { "id": "L4_S20_3", "type": "choice", "correctResponse": null, "scored": false, "bloom": "Evaluate", "result": "neutral" }
  ],
  "sources": ["planning/STORYBOARD-V3-CH5-6.md S20", "s36", "s43 item 4", "s37"]
},

{
  "id": "S20B",
  "chapter": "ch5",
  "template": "decision",
  "locked": "chips",
  "step": { "verb": "Review", "icon": "explore", "join": true },
  "variant": "risk",
  "minutes": 2,
  "instruction": "Choose the mistake your map is most at risk of.",
  "hint": "The five mistakes from Chapter 4. Any pick is fine.",
  "wordLimit": { "max": 60, "why": "storyboard v3 Ch5-6 S20B (read then pick, as S17's definitions): the five mistakes with their one-line definitions, the hint line and the note; text as approved" },
  "ghost": { "type": "choice", "target": "options-sweep" },
  "options": [
    { "id": "ideal", "label": "Ideal, not actual", "sub": "maps how it should work", "feedback": "Reread Field 3 against a normal day, not the written procedure." },
    { "id": "goal", "label": "No clear goal", "sub": "no question to answer", "feedback": "Write one sentence on what this map must help decide." },
    { "id": "rushed", "label": "Rushed mapping", "sub": "hard fields skipped", "feedback": "Reopen Fields 6 and 7. Those are the ones skipped first." },
    { "id": "updated", "label": "Not updated", "sub": "the process changed, the map did not", "feedback": "Note the date on your map and what would trigger an update." },
    { "id": "automating", "label": "Automating a broken process", "sub": "speeds up a process nobody fixed", "feedback": "Before Lesson 5, list which steps need fixing, not speeding up." }
  ],
  "strip": "Before Lesson 5: every field filled, metric measurable, no invented answers.",
  "link": "reopenWorkbook",
  "advance": "after-any",
  "endOfChapter": true,
  "tracking": [
    { "id": "L4_S20_4", "type": "choice", "correctResponse": null, "scored": false, "bloom": "Evaluate", "result": "neutral" }
  ],
  "sources": ["planning/STORYBOARD-V3-CH5-6.md S20B (split from S20)", "s34", "s38"]
}`);
}

if (group === 'B') {
  once('"minutes": 15, "screens": ["S21", "S22"],', '"minutes": 15, "screens": ["S21", "S21R", "S22"],');
  editScreen('S21', (s) => s.replace('"step": { "verb": "Decide", "icon": "decide" },', '"step": { "verb": "Check", "icon": "check" },')
    .replace('"minutes": 12,', '"minutes": 10,')
    .replace(/"advance": "after-all-items",\n(?!      "shuffleOnRetake")/, '"advance": "after-all-items",\n      "shuffleOnRetake": true,\n'));
  if (!t.includes('"id": "S21R"')) {
    const at = t.indexOf('\n    {\n      "id": "S22",');
    t = t.slice(0, at) + '\n' + `
{
  "id": "S21R",
  "chapter": "ch6",
  "template": "result",
  "presentation": true,
  "step": { "verb": "Check", "icon": "check", "join": true },
  "minutes": 2,
  "instruction": "{x} of {n} on first try ({p} of 100). Pass mark: 80.",
  "from": "S21",
  "wordLimit": { "max": 120, "why": "storyboard v3 Ch5-6 S21R, worst case (all five items missed): each missed item's stem, its line and its review link; open question in review/nl4/REPORT.md" },
  "passed": { "chip": "Passed", "text": "You can map a process and judge where AI fits." },
  "notPassed": { "chip": "Not passed yet", "text": "Review what you missed, then retake the whole check." },
  "reviewLabel": "Review Chapter {n}",
  "missed": [
    { "item": "i1", "text": "Revisit what a handoff must record.", "chapter": 4, "screen": "S14" },
    { "item": "i2", "text": "Revisit the three good fits for AI.", "chapter": 4, "screen": "K4" },
    { "item": "i3", "text": "Revisit baseline, target and date.", "chapter": 3, "screen": "S11" },
    { "item": "i4", "text": "Revisit why 'unclear' belongs in Field 7.", "chapter": 3, "screen": "S10" },
    { "item": "i5", "text": "Revisit the full HR map, line by line.", "chapter": 3, "screen": "S12" }
  ],
  "ringAlt": "{p} of 100",
  "ringAltPilotCopy": true,
  "tracking": [],
  "suspend": ["attempt", "lastScore", "passed"],
  "sources": ["planning/STORYBOARD-V3-CH5-6.md S21R (new) and Q4, Q5"]
},
`.trim().replace(/^/gm, '    ').replace(/^ {4}$/gm, '') + '\n' + t.slice(at);
  }
  editScreen('S22', (s) => s.replace('"step": { "verb": "Decide", "icon": "decide" },', '"step": { "verb": "Finish", "icon": "start" },\n      "scene": "stage",')
    .replace('"Lesson 5 marks on this exact map where AI enters, what it consumes, and where a person stays."', '"Lesson 5 starts from this map and your AI notes from Chapter 4."')
    .replace('"Your record holds your case title, metric, self-check answers and score. Your map stays in the workbook PDF."', '"Your record holds your case title, notes, metric, self-check answers and score. Your map stays in the workbook PDF."')
    .replace(/      "layout": "editorial",\n      "image": \{[^\n]*\n/, '      "layout": "stage-decision",\n'));
  once('      "metric": "Your success metric",\n      "notes": "Your notes from Chapters 3 and 4",', '      "metric": "First metric (Chapter 3)",\n      "notes": "Your notes from Chapter 4",');
  once('"scoreLine": "{x} of {n} on first try ({p} of 100). Pass mark: {pass} of 100."', '"scoreLine": "{x} of {n} on first try ({p} of 100), attempt {a}. Pass mark: {pass} of 100."');
}

if (group === 'E') {
  for (const id of ['S08B', 'S12B', 'S17B']) {
    editScreen(id, (s) => s.replace('"saveAlwaysEnabled": true', '"saveWhenFilled": true'));
    addAfterTemplate(id, 'lockedNext', '"lockedNext": "Save to continue",');
  }
  for (const id of ['S02', 'S08B', 'S12B', 'S17B']) addAfterTemplate(id, 'caseCard', '"caseCard": true,');
}

JSON.parse(t); // still valid JSON
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('nl4-content', group, 'done');

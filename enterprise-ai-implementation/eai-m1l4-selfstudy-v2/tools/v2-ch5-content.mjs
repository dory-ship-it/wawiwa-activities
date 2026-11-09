// v2 Chapter 5 (Critical eye) content (Noy, 9 Nov 2026; approved board: claude.ai/artifact/3Y2yjcWbHd8u47cPnhe2HL):
// W4 becomes the chapter opener (the warm-up retired), each screen names its ground from the kit
// (src/zones.js setScene), S14 loses the handoff drawing (the empty-desk photo tells it), S16 sorts into two
// columns (good fit / poor fit; the six kinds stay in the column lines and the feedback), K4's lines get
// short, S17B's field labels say what to type. Re-runnable: each edit is made only when its text is still
// the old one. Usage: node tools/v2-ch5-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
let n = 0;

// the text of one screen object: from its "{" line to its closing "}" line
function range(id) {
  const at = t.indexOf(`\n      "id": "${id}",`);
  if (at < 0) throw new Error('no screen ' + id);
  const start = t.lastIndexOf('\n    {', at);
  const end = t.indexOf('\n    }', at);
  return [start, end];
}
// edit inside one screen only; done = the new text is already there
function edit(id, from, to, { all = false } = {}) {
  const [s, e] = range(id);
  const block = t.slice(s, e);
  if (block.includes(to) && !block.includes(from)) return;
  // a later round may have changed this text again: say so, never stop a re-run
  if (!block.includes(from)) { console.warn('  skip ' + id + ' (already changed): ' + from.slice(0, 60)); return; }
  const next = all ? block.split(from).join(to) : block.replace(from, to);
  t = t.slice(0, s) + next + t.slice(e);
  n++;
}

const PHOTO_OPENER = '{ "src": "assets/img/l4/v2/ch5-opener-map-review.jpg", "position": "60% 40%", "temp": false }';
const PHOTO_DESK = '{ "src": "assets/img/l4/v2/ch5-s14-empty-desk.jpg", "position": "38% 50%", "temp": false }';
const PHOTO_FORMS = '{ "src": "assets/img/l4/v2/ch5-s15-feedback-forms.jpg", "position": "62% 50%", "temp": false }';

/* ---- W4: the chapter opener ---- */
{
  const [s, e] = range('W4');
  if (!t.slice(s, e).includes('"template": "opener"')) {
    const W4 = `
    {
      "id": "W4",
      "coach": { "kind": "idea", "tip": "Four checks on a finished map. Keep your own case in mind as you go.", "tipDrafted": true },
      "chapter": "ch4",
      "template": "opener",
      "step": { "verb": "Overview", "icon": "overview" },
      "minutes": 1,
      "presentation": true,
      "instruction": "Read the HR map like an implementer",
      "lead": "Before anyone adds AI, check the map at four points.",
      "stops": [
        { "icon": "start", "title": "Boundaries", "text": "Where it starts and ends" },
        { "icon": "arrows", "title": "Handoffs", "text": "Where a question gets lost" },
        { "icon": "hourglass", "title": "Bottlenecks", "text": "Speed a step up, or remove it" },
        { "icon": "fork", "title": "Where AI fits", "text": "What AI takes, what a person keeps" }
      ],
      "photo": ${PHOTO_OPENER},
      "ground": { "kind": "full" },
      "tracking": [],
      "sources": ["v2 (9 Nov 2026): the chapter opener replaces the W4 warm-up", "s21", "s27", "s28", "s32", "s33"]`;
    t = t.slice(0, s) + W4 + t.slice(e);
    n++;
  }
}

/* ---- S13 boundaries: a blurred photo, the action in the heading ---- */
edit('S13', '"instruction": "Click where the HR process starts.",', '"instruction": "Click the step where the HR process starts.",');
edit('S13', '"instructionEnd": "Now click where it ends.",', '"instructionEnd": "Now click the step where it ends.",');
edit('S13', '"lead": "Look for what starts it from outside, and who picks up the result.",',
  '"lead": "A process starts with a trigger from outside, and ends when someone receives the result.",\n      "photo": ' + PHOTO_OPENER + ',\n      "ground": { "kind": "blur" },');

/* ---- S14 handoffs: the empty desk on the left half, no drawing ---- */
edit('S14', '"photo": { "src": "assets/img/l4/md1/ch5-critical-eye.jpg", "position": "65% 50%", "mirror": true, "temp": false },',
  '"photo": ' + PHOTO_DESK + ',\n      "ground": { "kind": "half", "side": "left" },');
edit('S14', '"top": { "kind": "line", "text": "A question exceeds policy. It goes to the HR manager, who is away." },',
  '"top": { "kind": "line", "text": "A question goes beyond policy, so HR staff pass it to the HR manager, who is away this week." },');
edit('S14', '"label": "From whom, to whom, what passes, if unavailable",', '"label": "Sender, receiver, what passes, and who covers the absence",');
edit('S14', `      "visual": { "kind": "handoff", "from": "HR staff", "to": "HR manager", "away": "Away",
        "alt": "Handoff: the question passes from the HR staff lane to the HR manager lane, which is greyed out: the HR manager is away.", "altPilotCopy": true },
`, '');
edit('S14', `          "visual": {
            "from": "Service agent",
            "to": "Disputes team",
            "alt": "Handoff: the dispute passes from the service agent to the disputes team, which is greyed out: the contact is away."
          },
`, '');

/* ---- S15 bottlenecks: the feedback forms on the right half ---- */
edit('S15', '"photo": { "src": "assets/img/l4/md1/ch5-critical-eye.jpg", "position": "65% 50%", "mirror": true, "temp": false },',
  '"photo": ' + PHOTO_FORMS + ',\n      "ground": { "kind": "half", "side": "right" },');
edit('S15', '"eyebrow": "New case: course feedback, from your Lesson 1 booklet",', '"eyebrow": "Course feedback, from your Lesson 1 booklet",');

/* ---- K4 where AI fits: dark, two rows, short lines ---- */
edit('K4', '"instruction": "Three good fits, and the rest",', '"instruction": "Where AI helps, and where it does not",');
edit('K4', '"text": "Otherwise, a person decides.",', '"text": "",\n      "photo": ' + PHOTO_OPENER + ',\n      "ground": { "kind": "darkblur" },');
edit('K4', '{ "term": "Unstructured to structured", "text": "text in, data out", "icon": "arrows" }', '{ "term": "Unstructured to structured", "text": "Free text in, data out", "icon": "arrows" }');
edit('K4', '{ "term": "Low-risk decision points", "text": "reversible, watched", "icon": "lightning" }', '{ "term": "Low-risk decisions", "text": "Faster, with a person watching", "icon": "lightning" }');
edit('K4', '{ "term": "Handoffs with delay or loss", "text": "AI records what passes", "icon": "route" }', '{ "term": "Handoffs that lose information", "text": "AI passes the history on", "icon": "route" }');
edit('K4', '{ "term": "Money or rights at stake", "icon": "shield" }', '{ "term": "Money or rights at stake", "text": "A person decides", "icon": "shield" }');
edit('K4', '{ "term": "A disorganized process", "icon": "gear-broken" }', '{ "term": "A disorganized process", "text": "Fix the process first", "icon": "gear-broken" }');
edit('K4', '{ "term": "Map says \\"unclear\\"", "icon": "help-circle" }', '{ "term": "Map says \\"unclear\\"", "text": "Diagnose before you build", "icon": "help-circle" }');

/* ---- S16 sort: two columns ---- */
edit('S16', `        { "id": "a", "label": "Unstructured to structured", "icon": "arrows", "kind": "good" },
        { "id": "b", "label": "Low-risk decision", "icon": "lightning", "kind": "good" },
        { "id": "c", "label": "Handoff delay or loss", "icon": "route", "kind": "good" },
        { "id": "d", "label": "Poor fit", "width": 1.8, "icon": "x", "kind": "poor" }`,
`        { "id": "good", "label": "Good fit for AI", "sub": "Text to data · Low-risk decision · Lossy handoff", "icon": "check", "kind": "good" },
        { "id": "poor", "label": "Poor fit for AI", "sub": "Money or rights · Disorder · Unclear", "icon": "x", "kind": "poor" }`);
edit('S16', '"instruction": "Drag each card to a good-fit kind, or to Poor fit.",', '"instruction": "Drag each card to Good fit or Poor fit.",\n      "photo": ' + PHOTO_FORMS + ',\n      "ground": { "kind": "blur" },');
for (const c of ['a', 'b', 'c']) edit('S16', `"column": "${c}"`, '"column": "good"', { all: true });
edit('S16', '"column": "d"', '"column": "poor"', { all: true });
edit('S16', '"correctResponse": "1.a,2.d,3.b,4.d,5.d,6.c"', '"correctResponse": "1.good,2.poor,3.good,4.poor,5.poor,6.good"', { all: true });

/* ---- S17 mistakes: the case on the dark half, the choice on the light half ---- */
edit('S17', '"instruction": "Read each case, then pick the mistake it shows.",', '"instruction": "Choose the mistake this case shows.",\n      "photo": ' + PHOTO_DESK + ',\n      "ground": { "kind": "split" },');

/* ---- S17B your case: a dot-grid ground, labels that say what to type ---- */
edit('S17B', '"label": "Could fit AI",', '"label": "Type a step AI could do",');
edit('S17B', '"label": "Stays with a person",', '"label": "Type a step a person must keep",');
edit('S17B', '"instruction": "Name one step that could fit AI and one for a person.",', '"instruction": "Name one step that could fit AI and one for a person.",\n      "ground": { "kind": "dots" },');

/* ---- round 2 (the check's word limits; the opener's list is "points", "stops" is the video's) ---- */
edit('W4', '"stops": [', '"points": [');
edit('K4', '"label": "Key idea · Where AI fits",', '"label": "Key idea",');
edit('K4', '"text": "Free text in, data out"', '"text": "Text in, data out"');
edit('K4', '"text": "Faster, with a person watching"', '"text": "Faster, a person watching"');
edit('K4', '{ "term": "Handoffs that lose information", "text": "AI passes the history on"', '{ "term": "Lossy handoffs", "text": "AI carries the history"');
edit('K4', '"text": "Fix the process first"', '"text": "Fix it first"');
edit('K4', '"text": "Diagnose before you build"', '"text": "Diagnose first"');
edit('S17B', '"instruction": "Name one step that could fit AI and one for a person.",', '"instruction": "Type one step for AI and one for a person.",');
edit('S17B', '"label": "Type a step AI could do",', '"label": "A step AI could do",');
edit('S17B', '"label": "Type a step a person must keep",', '"label": "A step a person keeps",');
edit('S17B', '"text": "Not on your map: your homework builds on this note.",', '"text": "Your Lesson 5 homework builds on this.",');

// S15 / S16: the paper stack seen from the side (the first photo showed made-up words on the forms)
for (const id of ['S15', 'S16']) edit(id, '"src": "assets/img/l4/v2/ch5-s15-feedback-forms.jpg", "position": "62% 50%"', '"src": "assets/img/l4/v2/ch5-s15-paper-stack.jpg", "position": "48% 50%"');

const out = JSON.parse(t);
const s16 = out.screens.find((s) => s.id === 'S16');
if (s16.columns.length !== 2 || s16.cards.some((c) => !['good', 'poor'].includes(c.column))) throw new Error('S16 columns not set');
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('v2-ch5-content: ' + n + ' edits');

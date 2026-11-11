// v2 Toolkit (ch2), planning/V2-CH3-PLAN.md (Noy, 9 Nov 2026: "continue producing the rest of the screens"):
//   W2 (s9)       a chapter opener replaces the warm-up guess
//   K2 (s10, s11) dark, the three parts with the ISO line, the HR case toggle
//   S04           the sort, on the blur
//   S05a (s12)    dark BPMN key
//   S05b          the label drag, on the dot grid
//   S06 (s13)     two situations, the old-set thumbnails removed
//   S07 (s14)     dark, open all eight fields (no question: choice screens sit on both sides); field 5 names the tags
//   S08 (s16)     each rule card with the slide's one-line reason; the AS-IS line above
//   S08B          the three-part sketch, on the blur
// Re-runnable: each screen is rewritten whole from this file. Usage: node tools/v2-ch3-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
const json = JSON.parse(t);
const old = (id) => json.screens.find((s) => s.id === id);
function range(id) {
  const at = t.indexOf(`\n      "id": "${id}",`);
  if (at < 0) throw new Error('no screen ' + id);
  return [t.lastIndexOf('\n    {', at), t.indexOf('\n    }', at) + '\n    }'.length];
}
const put = (obj) => {
  const [s, e] = range(obj.id);
  t = t.slice(0, s) + '\n' + JSON.stringify(obj, null, 2).split('\n').map((l) => '    ' + l).join('\n') + t.slice(e);
};
// keep a screen's keys in order, with some replaced or added after a given key
const merge = (o, changes, drop = []) => {
  const out = {};
  for (const [k, v] of Object.entries(o)) { if (drop.includes(k)) continue; out[k] = k in changes ? changes[k] : v; }
  for (const [k, v] of Object.entries(changes)) if (!(k in out) && v !== undefined) out[k] = v;
  return out;
};

const P = { src: 'assets/img/l4/v2/ch3-w2-sketching-flow.jpg', position: '64% 45%', temp: false };

/* ---- W2: the chapter opener (s9) ---- */
put({
  id: 'W2',
  coach: { kind: 'idea', tip: 'Four tools in this chapter. Keep your own case in mind as you meet each one.', tipDrafted: true },
  chapter: 'ch2', template: 'opener', step: { verb: 'Overview', icon: 'overview' }, minutes: 1, presentation: true,
  instruction: 'Pick up the tools of a mapper',
  lead: 'Mapping shows how work really flows: who does each step, what goes in and out.',
  points: [
    { icon: 'arrows', title: 'Three building blocks', text: 'Trigger, steps, output' },
    { icon: 'lanes', title: 'BPMN at a glance', text: 'Read it, know when to use it' },
    { icon: 'forms', title: 'The eight fields', text: 'Your main working tool' },
    { icon: 'eye', title: 'AS-IS rules', text: 'Map what really happens' },
  ],
  photo: P, ground: { kind: 'full' }, tracking: [],
  sources: ['s9', 's10', 's12', 's13', 's14', 's16', 'v2 (9 Nov 2026): the chapter opener replaces the warm-up guess'],
});

/* ---- K2: three parts (s10, s11), dark ---- */
put(merge(old('K2'), {
  look: undefined,
  label: 'Key idea',
  text: 'Per ISO 9001: inputs in, an intended output out.',
  photo: P, ground: { kind: 'darkblur' },
  parts: [
    { id: 'trigger', title: 'Trigger', text: 'A message, a form, a date.', case: 'A question arrives' },
    { id: 'steps', title: 'Steps', text: 'Three to seven, to the result.', case: 'Check, answer, escalate' },
    { id: 'output', title: 'Output', text: 'What comes out, to whom.', case: 'Employee gets an answer' },
  ],
  caseToggle: 'See it in the HR case from Lesson 1',
  caseLabel: 'HR',
  sources: ['s10', 's11', 'HR canon Fields 2, 3'],
}, ['look']));

/* ---- S04: the sort, on the blur ---- */
put(merge(old('S04'), { photo: P, ground: { kind: 'blur' } }));

/* ---- S05a: the BPMN key (s12), dark ---- */
put(merge(old('S05a'), { look: undefined, text: 'Recognise three parts. You never have to draw one.', photo: P, ground: { kind: 'darkblur' } }, ['look']));

/* ---- S05b: the label drag, on the dot grid ---- */
put(merge(old('S05b'), { ground: { kind: 'dots' } }));

/* ---- S06: field template or BPMN (s13), no thumbnails ---- */
{
  const o = old('S06');
  put(merge(o, {
    photo: P, ground: { kind: 'blur' },
    situations: o.situations.map(({ image, ...x }) => x),
  }));
}

/* ---- S07: the eight fields (s14), dark, open all eight ---- */
{
  const o = old('S07');
  const tiles = o.tiles.map(({ correct, feedback, ...x }) => (x.n === 5
    ? { ...x, back: 'Policies and data the process uses, who keeps each current, and a tag: public, internal, confidential or restricted.' }
    : x));
  put(merge(o, {
    look: undefined,
    hint: 'Open each tile to read what the field asks.',
    photo: P, ground: { kind: 'darkblur' },
    tiles,
    advance: 'after-all-opened',
    tracking: [],
    sources: ['s14', 's10', 's18', 's19', 's21', 's22', 's27', 's37', 'v2 (9 Nov 2026): the closing question removed (choice screens S06 and S08 on both sides)'],
  }, ['look', 'question', 'questionChip', 'questionHint', 'questionHintPilotCopy']));
}

/* ---- S08: the AS-IS rules (s16), each with its reason ---- */
{
  const o = old('S08');
  const subs = { a: 'Record a wrong step as it is', b: 'AI is a future step', c: 'Map what really happens' };
  put(merge(o, {
    ground: { kind: 'dots' },
    options: o.options.map((x) => ({ ...x, sub: subs[x.id] })),
  }));
}

/* ---- S08B: the sketch, on the blur ---- */
put(merge(old('S08B'), { photo: P, ground: { kind: 'blur' } }));

JSON.parse(t);
writeFileSync(FILE, t.replace(/\n/g, EOL));
console.log('v2 Toolkit written');

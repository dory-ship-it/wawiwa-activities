// v2 HR demo (ch3), planning/V2-CH4-PLAN.md (Noy, 9 Nov 2026: "continue producing the rest of the screens"):
//   W3 (s15)      a chapter opener replaces the warm-up guess: the HR case from Lesson 1, field by field (s17-s20)
//   V2            the film, on the dark blur, its small title line hidden
//   S09           Field 5 sort, on the blur
//   S10           Field 7 fill, on the dot grid; its right-answer line short (K3 says the rest)
//   K3 (s38)      NEW dark pair: 'Unclear' is a legitimate answer; it also parts S10 and S11, two choice screens
//   S11           Field 8 metric, on the blur
//   S12           the full map flags, on the dot grid
//   S12B          your metric, on the blur
// Variants (the personal path) are kept as they are. Re-runnable. Usage: node tools/v2-ch4-content.mjs
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
const block = (obj) => '\n' + JSON.stringify(obj, null, 2).split('\n').map((l) => '    ' + l).join('\n');
const put = (obj) => { const [s, e] = range(obj.id); t = t.slice(0, s) + block(obj) + t.slice(e); };
const merge = (o, changes, drop = []) => {
  const out = {};
  for (const [k, v] of Object.entries(o)) { if (drop.includes(k)) continue; out[k] = k in changes ? changes[k] : v; }
  for (const [k, v] of Object.entries(changes)) if (!(k in out) && v !== undefined) out[k] = v;
  return out;
};

const P = { src: 'assets/img/l4/v2/ch4-w3-hr-desk.jpg', position: '62% 40%', temp: false };

/* ---- W3: the chapter opener (s15) ---- */
put({
  id: 'W3',
  coach: { kind: 'idea', tip: 'Watch each field fill in for the HR case. Your own case comes next.', tipDrafted: true },
  chapter: 'ch3', template: 'opener', step: { verb: 'Overview', icon: 'overview' }, minutes: 1, presentation: true,
  instruction: 'Map the HR case from Lesson 1, field by field',
  lead: 'Repeat questions to HR at a services company of about 400 employees.',
  points: [
    { icon: 'route', title: 'Fields 1 to 4', text: 'The process frame' },
    { icon: 'database', title: 'Fields 5 and 6', text: 'Knowledge, sensitivity, control' },
    { icon: 'gauge', title: 'Fields 7 and 8', text: 'Gaps and a success metric' },
    { icon: 'flag', title: 'The full map', text: 'Where a question gets lost' },
  ],
  photo: P, ground: { kind: 'full' }, tracking: [],
  sources: ['s15', 's17', 's18', 's19', 's20', 'v2 (9 Nov 2026): the chapter opener replaces the warm-up guess'],
});

/* ---- V2: the film on the dark blur ---- */
{
  const o = old('V2');
  const { id, coach, chapter, template, guidingLabel, step, minutes, instruction, instructionPilotCopy, title, showTitle, photo, ground, ...rest } = o;
  put({ id, coach, chapter, template, guidingLabel, step, minutes, instruction, instructionPilotCopy, title, showTitle: false, photo: P, ground: { kind: 'darkblur' }, ...rest });
}

/* ---- S09, S11: on the blur; S10, S12: on the dot grid; S12B: on the blur ---- */
put(merge(old('S09'), { look: undefined, photo: P, ground: { kind: 'blur' } }, ['look']));
put(merge(old('S10'), { ground: { kind: 'dots' },
  options: old('S10').options.map((x) => (x.id === 'c' ? { ...x, feedback: "Right: 'unclear' is the honest answer for Field 7 today." } : x)) }));
put(merge(old('S11'), { photo: P, ground: { kind: 'blur' } }));
put(merge(old('S12'), { look: undefined, ground: { kind: 'dots' } }, ['look']));
put(merge(old('S12B'), { photo: P, ground: { kind: 'blur' } }));

/* ---- K3 (s38): new, after S10 ---- */
const K3 = {
  id: 'K3',
  coach: { kind: 'idea', tip: "Writing 'unclear' is a finding. It tells you what to check before you build anything.", tipDrafted: true },
  chapter: 'ch3', template: 'deliverable', step: { verb: 'Learn', icon: 'learn' }, minutes: 1, presentation: true,
  label: 'Key idea',
  instruction: "'Unclear' is a legitimate answer",
  parts: [
    { id: 'result', icon: 'check-circle', title: 'A result of the mapping', text: 'Not a weakness of the mapper. Field 7 exists for exactly this.' },
    { id: 'next', icon: 'help-circle', title: 'What to do with it', text: 'Record it in Field 7: what to check before Lesson 5, and what not to build on yet.' },
  ],
  photo: P, ground: { kind: 'darkblur' }, tracking: [],
  sources: ['s38', 's19', 'v2 (9 Nov 2026): new; parts S10 and S11, two choice screens'],
};
if (t.includes('\n      "id": "K3",')) put(K3);
else {
  const [, e] = range('S10');
  t = t.slice(0, e) + ',\n' + block(K3) + t.slice(e);
}
const ch = json.chapters.find((c) => c.id === 'ch3');
if (!ch.screens.includes('K3')) t = t.replace(/("id": "ch3",[\s\S]*?"screens": \[[\s\S]*?"S10",)/, '$1\n        "K3",');

JSON.parse(t);
writeFileSync(FILE, t.replace(/\n/g, EOL));
console.log('v2 HR demo written');

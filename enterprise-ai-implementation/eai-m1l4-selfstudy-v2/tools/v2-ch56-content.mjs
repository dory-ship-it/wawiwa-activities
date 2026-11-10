// v2 Build yours (ch5) and Wrap-up (ch6), planning/V2-CH56-PLAN.md (Noy, 9 Nov 2026: "continue", and "no runs
// of screens that look the same"):
//   W5   NEW opener for Build yours (s35's activity as four stops)
//   S18  data safety (s44) on a half photo (right): a marker striking out lines
//   S19A the workbook brief, dark; the "About 40 min" chip removed (no times on screen)
//   S20  the self-check (s36) on a half photo (left): a pen ticking a box
//   W6   NEW opener for Wrap-up: the five learning outcomes (s39), parked on O3 until now
//   S21R the result, dark; S22 a new photo; END the deck's slide-1 photo (the lesson's bookend with O1)
//   S08B (Toolkit) on a narrow half photo, so S08 and S08B no longer look alike
// The other screens get their ground from the kit. Re-runnable. Usage: node tools/v2-ch56-content.mjs
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
// a new screen goes in before another one, in the screens array and in its chapter's list
function insertBefore(obj, beforeId, chapterId) {
  if (t.includes(`\n      "id": "${obj.id}",`)) { put(obj); return; }
  const [s] = range(beforeId);
  t = t.slice(0, s) + block(obj) + ',\n' + t.slice(s);
  t = t.replace(new RegExp(`("id": "${chapterId}",[^\\n]*?"screens": \\[)"${beforeId}"`), `$1"${obj.id}", "${beforeId}"`); // (the chapters sit on one line each)
}
const img = (f, position) => ({ src: 'assets/img/l4/v2/' + f, position, temp: false });
const P5 = img('ch6-w5-evening-desk.jpg', '64% 45%');
const P6 = img('ch7-w6-map-wall.jpg', '66% 45%');

/* ---- W5: the Build yours opener (s35) ---- */
insertBefore({
  id: 'W5',
  coach: { kind: 'idea', tip: 'This is the main task of the lesson. Have your notes from the earlier chapters ready.', tipDrafted: true },
  chapter: 'ch5', template: 'opener', step: { verb: 'Overview', icon: 'overview' }, minutes: 1, presentation: true,
  instruction: 'Map your own case',
  lead: 'The same eight fields, now on the case you typed at the start.',
  points: [
    { icon: 'arrows', title: 'Practise first', text: 'On another Lesson 1 case' },
    { icon: 'shield', title: 'Keep it safe', text: 'Roles, never names' },
    { icon: 'workbook', title: 'Fill the workbook', text: 'Then export a PDF' },
    { icon: 'check-circle', title: 'Check your map', text: 'Three questions before Lesson 5' },
  ],
  photo: P5, ground: { kind: 'full' }, tracking: [],
  sources: ['s35', 's44', 's36', 'v2 (9 Nov 2026): new chapter opener'],
}, 'S18A', 'ch5');

put(merge(old('S18A'), { ground: { kind: 'dots' } }));
put(merge(old('S18'), { photo: img('ch6-s18-redact.jpg', '84% 50%'), ground: { kind: 'half', side: 'right' } }));
put(merge(old('S18B'), { photo: P5, ground: { kind: 'blur' } }));
put(merge(old('S19A'), { step: { verb: 'Map', icon: 'map' }, photo: P5, ground: { kind: 'darkblur' } }, ['chip'])); // (the bar's overview icon is W5's)
put(merge(old('S19B'), { ground: { kind: 'dots' } }));
put(merge(old('S19C'), { photo: P5, ground: { kind: 'blur' } }));
put(merge(old('S20'), { photo: img('ch6-s20-tick.jpg', '50% 45%'), ground: { kind: 'half', side: 'left' } }));
put(merge(old('S20B'), { photo: P5, ground: { kind: 'blur' } }));

/* ---- W6: the Wrap-up opener, the five learning outcomes (s39) ---- */
insertBefore({
  id: 'W6',
  coach: { kind: 'idea', tip: 'Five things you can now do. The check that follows asks about each of them.', tipDrafted: true },
  chapter: 'ch6', template: 'opener', step: { verb: 'Overview', icon: 'overview' }, minutes: 1, presentation: true,
  instruction: 'What you can now do',
  lead: 'Show it in a short knowledge check.',
  points: [
    { icon: 'arrows', title: 'Roles and handoffs', text: 'Who is involved, where it passes' },
    { icon: 'database', title: 'Sources and sensitivity', text: 'Owners and tags' },
    { icon: 'shield-check', title: 'Controls and gaps', text: "'Unclear' included" },
    { icon: 'target', title: 'A measurable metric', text: 'A baseline and a target' },
    { icon: 'fork', title: 'Where AI fits', text: 'And where a person decides' },
  ],
  photo: P6, ground: { kind: 'full' }, tracking: [],
  sources: ['s39 (the five learning outcomes, from O3 where they were parked)', 'v2 (9 Nov 2026): new chapter opener'],
}, 'S21', 'ch6');

put(merge(old('S21'), { photo: P6, ground: { kind: 'dots' } }));
put(merge(old('S21R'), { photo: P6, ground: { kind: 'darkblur' } }));
put(merge(old('S22'), { photo: img('ch7-s22-day-done.jpg', '62% 40%') }));
put(merge(old('END'), { photo: img('ch1-o1-deck-slide1.jpg', '70% 40%') }));

/* ---- O3: the parked outcomes now live on W6 ---- */
put(merge(old('O3'), {}, ['$outcomesParked', 'outcomesParked']));

/* ---- S08B (Toolkit): a narrow half photo, so it differs from S08 before it ---- */
put(merge(old('S08B'), { photo: img('ch3-s08b-notes.jpg', '50% 50%'), ground: { kind: 'half', side: 'left', size: 'narrow' } }));

JSON.parse(t);
writeFileSync(FILE, t.replace(/\n/g, EOL));
console.log('v2 Build yours and Wrap-up written');

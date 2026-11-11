// MD1-W content edits on content/l4-slice.json (25 Oct 2026), as text (UTF-8, the file's hand format
// kept): one MD1 photo per chapter and O1's, S06's two situation images; temp false on each.
// Idempotent. Usage: node tools/md1w-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');

// chapter id -> [src, position]
const CHAPTERS = {
  ch0: ['assets/img/l4/md1/ch1-intro.jpg', '22% 50%'],
  ch1: ['assets/img/l4/md1/ch2-why-map.jpg', '35% 50%'],
  ch2: ['assets/img/l4/md1/ch3-toolkit.jpg', '50% 50%'],
  ch3: ['assets/img/l4/md1/ch4-hr-demo.jpg', '30% 40%'],
  ch4: ['assets/img/l4/md1/ch5-critical-eye.jpg', '65% 50%'],
  ch5: ['assets/img/l4/md1/ch6-build-yours.jpg', '35% 50%'],
  ch6: ['assets/img/l4/md1/ch7-wrap-up.jpg', '40% 50%'],
};
const photo = ([src, pos]) => `"photo": { "src": "${src}", "position": "${pos}", "temp": false }`;
for (const [id, p] of Object.entries(CHAPTERS)) {
  const re = new RegExp(`(\\{ "id": "${id}", "n": \\d, "title": "[^"]+", )"photo": \\{[^}]*\\}`);
  if (!re.test(t)) throw new Error('no chapter ' + id);
  t = t.replace(re, `$1${photo(p)}`);
}
// O1's photo (its "image", ft3.jpg, stays)
const o1 = t.indexOf('"id": "O1",');
const o1p = t.indexOf('"photo": {', o1);
t = t.slice(0, o1p) + t.slice(o1p).replace(/"photo": \{[^}]*\}/, photo(['assets/img/l4/md1/o1-lanes-office.jpg', '60% 50%']));
// S06's two situations
const sit = (id, src, alt, pos) => {
  const a = t.indexOf(`{ "id": "${id}", "text":`, t.indexOf('"id": "S06",'));
  const b = t.indexOf('"image": {', a);
  t = t.slice(0, b) + t.slice(b).replace(/"image": \{ "src": "[^"]*", "alt": "[^"]*", ("prompt": "[^"]*", )"temp": (true|false), "position": "[^"]*" \}/,
    `"image": { "src": "${src}", "alt": "${alt}", $1"temp": false, "position": "${pos}" }`);
};
sit('s1', 'assets/img/s15.jpg', 'A team lead going through her own stack of requests', '50% 35%');
sit('s2', 'assets/img/ft2.jpg', 'A process diagram being drawn on a whiteboard', '50% 50%');

JSON.parse(t); // still valid JSON
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('md1w-content done');

// v3 content pass (Noy, 10 Nov 2026: clarity for a learner at home alone). Wording only, no design change:
// 1 W3 says the HR case is a worked example; 2 a field number always carries its short name; 3 Chapter 6
// opens with a practice case; 4 W6 says what the knowledge check is. Re-runnable: an edit is made only while
// its text is still the old one. Each edit is scoped to one screen (variants included).
// Usage: node tools/v3-content-pass.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
const ids = JSON.parse(t).screens.map((s) => s.id);
const startOf = (id) => t.indexOf('\n      "id": "' + id + '",');
const seg = (id) => { const a = startOf(id); if (a < 0) throw new Error('no screen ' + id); const later = ids.map(startOf).filter((i) => i > a); return [a, later.length ? Math.min(...later) : t.length]; };
const log = [];
// replace a JSON-encoded string value inside one screen (every occurrence there: core and variants)
const edit = (id, from, to, key = null) => {
  const [a, b] = seg(id);
  let s = t.slice(a, b);
  const q = (x) => JSON.stringify(x);
  const f = key ? `"${key}": ${q(from)}` : q(from), r = key ? `"${key}": ${q(to)}` : q(to);
  if (!s.includes(f)) { if (s.includes(r)) return; throw new Error(`${id}: not found: ${from}`); }
  const n = s.split(f).length - 1;
  s = s.split(f).join(r);
  t = t.slice(0, a) + s + t.slice(b);
  log.push(`${id} x${n}: ${from}  ->  ${to}`);
};

// 1. W3: a worked example
edit('W3', 'Repeat questions to HR at a services company of about 400 employees.', 'A worked example before your own case: repeat HR questions at a 400-person company.');

// 2. a field number carries its short name (where the name is not already beside it)
edit('S09', 'Drag each card to its part of Field 5.', 'Drag each card to its part of Field 5 (Sources).');
edit('S09', 'Kept out: it describes how answers get checked, which is Field 6.', 'Kept out: it describes how answers get checked, which is Field 6 (Controls).');
// (the stretch card's tag stays "Fields 3 and 6": with the names it was cut off on the placed card; its feedback names them)
edit('S09', 'Kept out: matching is a step and a manual check, Fields 3 and 6.', 'Kept out: matching is a step and a manual check, Fields 3 and 6 (Steps, Controls).');
edit('V2', 'Which line belongs in Field 2, as the process runs today?', 'Which line belongs in Field 2 (Trigger), as the process runs today?');
edit('V2', 'That is ownership of a knowledge source. It goes in Field 5, next to each policy.', 'That is ownership of a knowledge source. It goes in Field 5 (Sources), next to each policy.');
edit('S08B', 'It goes into workbook Fields 2 and 3 in Chapter {ch5}.', 'It goes into workbook Fields 2 and 3 (Trigger, Steps), Chapter {ch5}.');
// (S10's instruction stays: "(Gaps)" pushed it to a second line, and the Field 7, Gaps row sits right beside it)
edit('K3', 'Not a weakness of the mapper. Field 7 exists for exactly this.', 'Not a weakness of the mapper. Field 7 (Gaps) exists for exactly this.');
edit('S11', 'Field 8', 'Field 8 (Metric)', 'label');
edit('S12B', 'This goes into Field 8 of your workbook in Chapter {ch5}.', 'This goes into workbook Field 8 (Metric) in Chapter {ch5}.');
edit('S17', 'Fields 6 and 7 are blank: the map was due within the hour.', 'Fields 6 and 7 (Controls, Gaps) are blank: the map was due within the hour.');
edit('S17', 'Fields 6 to 8 are empty: the mapper ran out of time.', 'Fields 6 to 8 (Controls, Gaps, Metric) are empty: the mapper ran out of time.');
edit('S18', 'Your real map, with Field 5 left empty', 'Your real map, with Field 5 (Sources) left empty');
edit('S19B', 'Field 1', 'Field 1 (Name)', 'chip');
edit('S19B', 'Fields 2 and 3', 'Fields 2 and 3 (Trigger, Steps)', 'chip');
edit('S19B', 'Field 8', 'Field 8 (Metric)', 'chip');
edit('S20', "A step without a role cannot be improved or monitored. Name the role, or write 'unclear' in Field 7.", "A step without a role cannot be improved or monitored. Name the role, or write 'unclear' in Field 7 (Gaps).");
edit('S20', 'Does Field 4 cover an unavailable receiver?', 'Does Field 4 (Handoffs) cover an unavailable receiver?');
edit('S20B', 'In your workbook: reread Field 3 against a normal day, not the written procedure.', 'In your workbook: reread Field 3 (Steps) against a normal day, not the written procedure.');
edit('S20B', 'In your workbook: reopen Fields 6 and 7, the ones skipped first.', 'In your workbook: reopen Fields 6 and 7 (Controls, Gaps), the ones skipped first.');
edit('S21', "Lesson 1 case: customer service. Field 4 says 'Rep to department.' What is missing?", "Lesson 1 case: customer service. Field 4 (Handoffs) says 'Rep to department.' What is missing?");
edit('S21', "Lesson 1 case: student inquiries. Field 4 says 'Coordinator to dean's office.' What is missing?", "Lesson 1 case: student inquiries. Field 4 (Handoffs) says 'Coordinator to dean's office.' What is missing?");
edit('S21', 'Field 8 stays empty. In three months, nobody can show whether anything changed.', 'Field 8 (Metric) stays empty. In three months, nobody can show whether anything changed.');
edit('S21', 'Field 8 now shows where the team hopes to land and nothing about where it stands now.', 'Field 8 (Metric) now shows where the team hopes to land and nothing about where it stands now.');
edit('S21', 'Lesson 1 case: student inquiries. Staff answer from admission terms the registrar keeps current. Field 5 owner?', 'Lesson 1 case: student inquiries. Staff answer from admission terms the registrar keeps current. Field 5 (Sources) owner?');
edit('S21', 'Lesson 1 case: weekly report. KPIs come from a sheet finance keeps current. Field 5 owner?', 'Lesson 1 case: weekly report. KPIs come from a sheet finance keeps current. Field 5 (Sources) owner?');
edit('S21R', 'Field 7 unknowns', 'Field 7 (Gaps): unknowns');
edit('S22', 'Not a failure of the mapper, a diagnostic result. Your Field 7 lists what to investigate first.', 'Not a failure of the mapper, a diagnostic result. Your Field 7 (Gaps) lists what to investigate first.');
// the locked-Next message on S10 lives in the shared ui strings
{
  const f = '"Next, locked until you choose the right line for Field 7 or use both attempts"';
  const r = '"Next, locked until you choose the right line for Field 7 (Gaps) or use both attempts"';
  if (t.includes(f)) { t = t.replace(f, r); log.push('ui.footer.locked.fill: Field 7 -> Field 7 (Gaps)'); } else if (!t.includes(r)) throw new Error('ui locked.fill not found');
}

// 3. Chapter 6 opens with a practice case
edit('W5', 'The same eight fields, now on the case you typed at the start.', 'One short practice, then the same eight fields on your own case.');
edit('S18A', 'Lesson 1 case: sales call summaries', 'Practice case: sales call summaries');
edit('S18A', 'Same eight fields, different case.', 'Same eight fields. Your own case comes next.');

// 4. W6 says what the check is
edit('W6', 'Show it in a short knowledge check.', 'A short check follows: 6 questions, pass mark 80.');

// the $fx note
const note = '"$fxV3c": "v3 content pass (10 Nov 2026): tools/v3-content-pass.mjs; W3 worked example, field numbers with their short names, Chapter 6 practice case, W6 check line. Wording only.",';
if (!t.includes('"$fxV3c"')) t = t.replace('\n  "$fx8":', '\n  ' + note + '\n  "$fx8":');
if (!t.includes('"$fxV3c"')) throw new Error('$fx note not placed');

JSON.parse(t);
writeFileSync(FILE, EOL === '\r\n' ? t.replace(/\n/g, '\r\n') : t);
console.log(log.join('\n'));
console.log(`v3-content-pass: ${log.length} edit(s)`);

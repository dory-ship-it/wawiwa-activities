// NL3 content step (run once; kept for the record): Chapters 3 and 4 on storyboard v3
// (planning/STORYBOARD-V3.md). Reads and writes content/l4-slice.json as UTF-8 through Node only.
//   node tools/nl3-content.mjs a|b|c|d   one group at a time (the commits follow the groups)
// Every learner-facing string below is the storyboard's own, unless its entry says pilotCopy.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PATH = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(PATH, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const C = JSON.parse(raw);
const group = process.argv[2];
const S = (id) => C.screens.find((s) => s.id === id);
const ch = (id) => C.chapters.find((c) => c.id === id);
const at = (id) => C.screens.findIndex((s) => s.id === id);
const put = (after, screen) => { const old = at(screen.id); if (old >= 0) C.screens.splice(old, 1); C.screens.splice(at(after) + 1, 0, screen); };
const drop = (id) => { const i = at(id); if (i >= 0) C.screens.splice(i, 1); };
const sliceSet = (from, to) => { const i = C.lesson.slice.indexOf(from); if (i >= 0) C.lesson.slice[i] = to; };
const sliceAfter = (after, id) => { if (!C.lesson.slice.includes(id)) C.lesson.slice.splice(C.lesson.slice.indexOf(after) + 1, 0, id); };
const chAfter = (c, after, id) => { const l = ch(c).screens; if (!l.includes(id)) l.splice(l.indexOf(after) + 1, 0, id); };
const MID = '·';
const warmupHint = 'Pick the answer you expect. A guess cannot be wrong.';
const deckKeys = (n) => `Drag the card to a column. Or press 1 to ${n} to choose a column, then Enter.`;

if (group === 'a') {
  // ---- NL2 follow-up b: S05b places by position, not by shape (and a diagram description without shapes)
  const s05b = S('S05b');
  const names = { a: 'Place 1: the bottom row, HR manager', b: 'Place 2: after Check the topic, in the HR staff row', c: 'Place 3: the first point of the Employee row, at Question sent' };
  s05b.targets.forEach((t) => { t.name = names[t.id]; });
  s05b.diagramAlt = 'Process diagram of the HR case in three rows: Employee, HR staff, HR manager. Question sent, in the Employee row, starts it. HR staff check the topic. Then a decision, Within policy? Yes: HR staff answer. No: Escalate, in the HR manager row. Both paths end in the Employee row at Answer received.';
  s05b.diagramAltPilotCopy = true;

  // ---- W3 replaces FT3 (and its routing)
  put('FT3', { id: 'W3', chapter: 'ch3', template: 'warmup', step: { verb: 'Guess', icon: 'guess' }, minutes: 1,
    instruction: 'An employee asks HR about their own salary. May that question go into a public AI tool?',
    hint: warmupHint, hintPilotCopy: true, layout: 'warmup',
    panel: { icon: 'lightbulb', title: 'Warm-up', chip: 'Not scored', foot: `Chapter 3 ${MID} HR demo` },
    options: [{ id: 'a', label: 'Yes, if the name is removed' }, { id: 'b', label: "Only with the employee's consent" }, { id: 'c', label: 'No, it holds confidential details' }],
    feedback: { verdict: 'Hold that thought.', text: 'This chapter tags every source by how sensitive it is.' },
    advance: 'after-any',
    tracking: [{ id: 'L4_W3_1', type: 'choice', correctResponse: null, scored: false, bloom: 'Understand', result: 'neutral' }],
    sources: ['planning/STORYBOARD-V3.md Ch3 W3 (replaces FT3)', 's22', 's44'] });
  drop('FT3');
  sliceSet('FT3', 'W3');
  ch('ch3').screens = ch('ch3').screens.map((id) => (id === 'FT3' ? 'W3' : id));
  delete ch('ch3').fastTrack;
  S('V2').minutes = 5;

  // ---- S09: the sort deck with the explain band (four sensitivity levels)
  const s09 = S('S09');
  Object.assign(s09, { template: 'sortDeck',instruction: 'Drag each card to its part of Field 5.', hint: deckKeys(4), hintPilotCopy: true, layout: 'sort-deck',
    ghost: { type: 'drag', showMe: false },
    band: { label: 'Four sensitivity levels, from open to closed:', items: [
      { term: 'PUBLIC', text: 'anyone may see it' }, { term: 'INTERNAL', text: 'staff only; approved company tools' },
      { term: 'CONFIDENTIAL', text: 'named people only, never a public AI tool' }, { term: 'RESTRICTED', text: 'strictest access, no AI tool without approval' }] },
    bandPilotCopy: 'the four definitions (SME to confirm before the pilot)',
    wordLimit: { max: 60, why: 'storyboard v3 (S09: the explain band with the four sensitivity levels joins the sort deck; keep the approved text word for word): 60 words with all six cards placed' } });
  delete s09.mode;
  s09.columns = s09.columns.map(({ id, label }) => ({ id, label }));
  s09.minutes = 4;

  // ---- S10: the storyboard's instruction
  S('S10').instruction = 'Choose what to write in Field 7.';

  // ---- S11: the explain band (the three parts of a checkable metric)
  const s11 = S('S11');
  s11.band = { label: 'A checkable metric has three parts:', chain: true, items: [
    { term: 'Baseline', text: "today's number, even estimated" }, { term: 'Target', text: 'a specific, realistic number' }, { term: 'Date', text: 'when you check it' }] };
  s11.terms = ['Success metric', 'Field 8']; // Baseline and Target: the band defines them
  s11.wordLimit = { max: 64, why: 'storyboard v3 (S11: the explain band, three parts of a checkable metric, joins the four answers and the slots; keep the approved text word for word)' };
}

if (group === 'b') {
  // ---- S12: the full map with two risk flags (tracking unchanged: L4_S12_1 "4,7")
  const old = S('S12');
  if (old.template !== 'flags') put('S11', { id: 'S12', chapter: 'ch3', template: 'flags', variant: 'map', step: { verb: 'Label', icon: 'label' }, minutes: 3,
    instruction: 'Drag the two risk flags onto the fields that show the handoff risk.',
    hint: 'Follow the question after it leaves the first staffer.',
    context: 'Your HR map is complete: all eight fields from this chapter.',
    layout: 'flags', dragHelp: 'helpFields', flagLabel: 'Risk flag', flagLabelPilotCopy: true,
    flags: [{ id: 'r1' }, { id: 'r2' }],
    map: old.tiles.map(({ n, title, text, correct, feedback }) => ({ n, title, text, correct, feedback })),
    feedbackCorrect: 'Field 4 shows the question moving from HR staff to the HR manager. Field 7 adds the risk: no single channel for that handoff.',
    wordLimit: { max: 120, why: 'storyboard v3 (S12: over 45 words, document view): the full HR map shows all eight filled fields at once, read as a document' },
    advance: 'after-all-placed',
    tracking: old.tracking, sources: old.sources });

  // ---- S12B: one success metric for the learner's own case (prefills S19)
  put('S12', { id: 'S12B', chapter: 'ch3', template: 'input', step: { verb: 'Write', icon: 'write' }, minutes: 2,
    instruction: 'Set one success metric for your case.',
    hint: 'A rough number is fine. You refine it in Chapter 5.',
    arrange: 'chain',
    stage: { top: { kind: 'line', text: 'Back to your own case.' }, bottom: { kind: 'privacy', icon: 'shield', text: 'Leave out names and identifying details.', action: 'save' } },
    fields: [
      { id: 'baseline', label: 'Baseline', placeholder: 'Today, e.g. about 2 days to a summary', maxLength: 80, store: 'L4_CASE_BASELINE', trackingId: 'L4_S12B_1', width: 1.6 },
      { id: 'target', label: 'Target', placeholder: 'e.g. same day', maxLength: 80, store: 'L4_CASE_TARGET', trackingId: 'L4_S12B_2' },
      { id: 'date', label: 'Date', placeholder: 'e.g. within 3 months', maxLength: 40, store: 'L4_CASE_DATE', trackingId: 'L4_S12B_3', optional: true }],
    saveAlwaysEnabled: true,
    feedback: { saved: 'Saved. It comes back in Chapter 5, ready to refine.', empty: 'Add a number to Baseline and Target.' },
    advance: 'after-save', endOfChapter: true,
    tracking: [1, 2, 3].map((k) => ({ id: `L4_S12B_${k}`, type: 'fill-in', correctResponse: null, scored: false, bloom: 'Apply', result: 'neutral' })),
    sources: ['planning/STORYBOARD-V3.md Ch3 S12B', 's37'] });
  sliceAfter('S12', 'S12B');
  chAfter('ch3', 'S12', 'S12B');
  // S19: the metric field starts from the S12B metric (editable)
  const field = S('S19').states.return.fields[0];
  field.prefill = { from: { baseline: 'L4_CASE_BASELINE', target: 'L4_CASE_TARGET', date: 'L4_CASE_DATE' },
    format: 'Baseline: {baseline}. Target: {target}, {date}.', formatNoDate: 'Baseline: {baseline}. Target: {target}.' };
  S('S19').states.return.prefillPilotCopy = 'the metric line built from S12B';
}

if (group === 'c') {
  // ---- W4 replaces FT4 (and its routing)
  put('FT4', { id: 'W4', chapter: 'ch4', template: 'warmup', step: { verb: 'Guess', icon: 'guess' }, minutes: 1,
    instruction: 'Which decision needs clear human judgment, not AI?',
    hint: warmupHint, hintPilotCopy: true, layout: 'warmup',
    panel: { icon: 'lightbulb', title: 'Warm-up', chip: 'Not scored', foot: `Chapter 4 ${MID} Critical eye` },
    options: [{ id: 'a', label: 'Deciding whether a customer is eligible' }, { id: 'b', label: 'Summarizing a long request in three lines' }, { id: 'c', label: 'Tagging a request by its topic' }],
    feedback: { verdict: 'Hold that thought.', text: 'This chapter shows where AI fits, and where a person must decide.' },
    advance: 'after-any',
    tracking: [{ id: 'L4_W4_1', type: 'choice', correctResponse: null, scored: false, bloom: 'Understand', result: 'neutral' }],
    sources: ['planning/STORYBOARD-V3.md Ch4 W4 (replaces FT4)', 's24', 's32'] });
  drop('FT4');
  sliceSet('FT4', 'W4');
  ch('ch4').screens = ch('ch4').screens.map((id) => (id === 'FT4' ? 'W4' : id));
  delete ch('ch4').fastTrack;

  // ---- S13: the Start and End flags onto the process line (matching, one-character codes)
  const other = 'Start where work enters from outside; end where someone picks up the result.';
  put('W4', { id: 'S13', chapter: 'ch4', template: 'flags', variant: 'line', step: { verb: 'Start', icon: 'start' }, minutes: 3,
    instruction: 'Drag the Start flag and the End flag onto the HR process line.',
    hint: 'Look for what starts it from outside, and who picks up the result.',
    layout: 'flags', dragHelp: 'helpSteps', dropLabel: 'Drop here',
    line: [{ n: 1, text: 'Employee sends a question' }, { n: 2, text: 'HR staff open the inbox' }, { n: 3, text: 'HR staff check the topic' },
      { n: 4, text: 'Question reaches the HR manager' }, { n: 5, text: 'Employee gets an answer' }],
    flags: [
      { id: 'start', code: 's', text: 'Start', target: '1', feedback: { 2: 'WhatsApp and in-person questions never reach the inbox. The process starts earlier, outside HR.', other } },
      { id: 'end', code: 'e', text: 'End', target: '5', feedback: { 3: 'Nobody receives anything when the topic is checked. Follow the question to its result.',
        4: 'Escalation passes the work on. The employee is still waiting, so the process has not delivered its output yet.', other } }],
    feedbackCorrect: 'The map opens at the external trigger and closes when the employee gets an answer, even after an escalation.',
    advance: 'after-all-placed',
    tracking: [{ id: 'L4_S13_1', type: 'matching', correctResponse: 's.1,e.5', scored: false, bloom: 'Apply', result: 'graded' }],
    sources: ['planning/STORYBOARD-V3.md Ch4 S13', 's21', 's10', 'HR canon Fields 2, 3'] });

  // ---- S14 on Stage: the handoff band, the handoff visual, the storyboard's feedback
  const s14 = S('S14');
  Object.assign(s14, { scene: 'stage', minutes: 3,
    band: { term: 'Handoff', text: 'the moment responsibility passes from one role to another.' },
    visual: { kind: 'handoff', from: 'HR staff', to: 'HR manager', away: 'Away',
      alt: 'Handoff: the question passes from the HR staff lane to the HR manager lane, which is greyed out: the HR manager is away.', altPilotCopy: true } });
  s14.stage.top.text = 'A question exceeds policy. It goes to the HR manager, who is away.';
  const fb14 = { a: 'A rule nobody follows today hides the real gap. Record four things: from whom, to whom, what passes, and what if the receiver is away.',
    c: 'Never assume the receiver knows the history. Record from whom, to whom, what passes, and what if the receiver is away.',
    d: 'That tool does not exist today. Record what does: from whom, to whom, what passes, and what if the receiver is away.' };
  s14.options.forEach((o) => { if (fb14[o.id]) o.feedback = fb14[o.id]; });
  delete s14.terms; delete s14.image; s14.layout = 'stage-decision';
  s14.wordLimit = { max: 54, why: 'storyboard v3 (S14: the handoff band and the handoff visual join the situation and four answers; keep the approved text word for word)' };

  // ---- S15 on Stage: the bottleneck band, the new eyebrow, the short hint
  const s15 = S('S15');
  Object.assign(s15, { scene: 'stage', minutes: 3, hint: 'Before speed, ask why.', band: { term: 'Bottleneck', text: 'a step limited by the slowest resource.' } });
  s15.stage.top.eyebrow = 'New case: course feedback, from your Lesson 1 booklet';
  delete s15.terms; delete s15.image; s15.layout = 'stage-decision';
  s15.wordLimit = { max: 56, why: 'storyboard v3 (S15: the bottleneck band and the longer eyebrow join the case line and three answers; keep the approved text word for word)' };
}

if (group === 'd') {
  // ---- K4: the key idea, two columns (presentation screen: not tracked, Next never locked)
  put('S15', { id: 'K4', chapter: 'ch4', template: 'keyColumns', step: { verb: 'Learn', icon: 'learn' }, minutes: 2, presentation: true,
    label: `Key idea ${MID} Where AI fits`, instruction: 'Three good fits, and the rest',
    text: 'AI fits three kinds of step. Everything else stays with a person, or gets fixed first.',
    layout: 'concept',
    columns: [
      { id: 'good', kind: 'lean', title: 'Good fit', items: [
        { term: 'Unstructured to structured', text: 'free text in, structured data out' },
        { term: 'Low-risk decision points', text: 'small, reversible calls a person can watch' },
        { term: 'Handoffs with delay or loss', text: 'AI documents what passes' }] },
      { id: 'poor', kind: 'mess', title: 'Poor fit', items: [{ term: 'Rights or money at stake' }, { term: 'A disorganized process' }, { term: 'Steps the map marks "unclear"' }] }],
    tracking: [], sources: ['planning/STORYBOARD-V3.md Ch4 K4', 's23', 's24', 's26'] });
  chAfter('ch4', 'S15', 'K4');
  sliceAfter('S15', 'K4');

  // ---- S16: the sort deck (the term tooltip removed: K4 teaches it)
  const s16 = S('S16');
  Object.assign(s16, { template: 'sortDeck',instruction: 'Drag each card to a good-fit kind, or to Poor fit.', hint: 'What goes in, and what is at stake?',
    hintShown: true, layout: 'sort-deck', ghost: { type: 'drag', showMe: false }, minutes: 5 });
  delete s16.mode; delete s16.terms; delete s16.hintPilotCopy;
  s16.columns = s16.columns.map(({ id, label }) => ({ id, label }));

  // ---- S17: read, then sort (five columns with their one-line definitions)
  const s17 = S('S17');
  const defs = { 1: 'maps how it should work, not a normal day', 2: 'drawn with no question to answer', 3: 'hard fields skipped to finish fast', 4: 'the process changed, the map did not', 5: 'speeds up a process nobody fixed' };
  Object.assign(s17, { template: 'sortDeck',instruction: 'Read the five mistakes, then drag each case to the one it shows.', hint: deckKeys(5), hintPilotCopy: true,
    layout: 'sort-deck', ghost: { type: 'drag', showMe: false }, minutes: 5 });
  for (const k of ['mode', 'deckIcon', 'deckLabel', 'chipStyle', 'endOfChapter']) delete s17[k];
  s17.columns = s17.columns.map(({ id, label }) => ({ id, label, sub: defs[id] }));
  s17.wordLimit = { max: 80, why: 'storyboard v3 decision (S17 "read, then sort": five columns with their one-line definitions, no separate K5 screen): the definitions stay on screen with the cases placed under them' };

  // ---- S17B: one step that could fit AI, one that stays with a person (shown on S19)
  put('S17', { id: 'S17B', chapter: 'ch4', template: 'input', step: { verb: 'Write', icon: 'write' }, minutes: 3,
    instruction: 'Name one step that could fit AI, and one that stays with a person.',
    hint: 'This note stays off your AS-IS map. Lesson 5 starts from it.',
    arrange: 'pair',
    stage: { top: { kind: 'line', text: 'Back to your own case. Your steps from Chapter 2:', show: 'L4_CASE_STEPS' } },
    fields: [
      { id: 'aifit', label: 'Could fit AI', placeholder: 'e.g. Sort requests by topic', maxLength: 100, store: 'L4_CASE_AIFIT', trackingId: 'L4_S17B_1' },
      { id: 'human', label: 'Stays with a person', placeholder: 'e.g. Approve an exception', maxLength: 100, store: 'L4_CASE_HUMAN', trackingId: 'L4_S17B_2' }],
    saveAlwaysEnabled: true,
    feedback: { saved: 'Saved. It comes back in Chapter 5 and Lesson 5.', empty: 'Add a few words to both fields. A rough version is enough; you can edit it later.' },
    feedbackPilotCopy: 'empty (the storyboard gives no empty-Save line; modelled on S08B)',
    advance: 'after-save', endOfChapter: true,
    tracking: [1, 2].map((k) => ({ id: `L4_S17B_${k}`, type: 'fill-in', correctResponse: null, scored: false, bloom: 'Apply', result: 'neutral' })),
    sources: ['planning/STORYBOARD-V3.md Ch4 S17B', 's24', 's32'] });
  sliceAfter('S17', 'S17B');
  chAfter('ch4', 'S17', 'S17B');
  // S19: the notes, read-only, under the sketch
  S('S19').states.brief.notes = { label: 'Your notes from Chapters 3 and 4', from: 'S17B' };
}

// the screens in the slice's order (a re-run puts a screen whose anchor is gone at the front)
C.screens.sort((a, b) => C.lesson.slice.indexOf(a.id) - C.lesson.slice.indexOf(b.id));
// a chapter's minutes are its screens' minutes (they weigh the progress in the menu)
for (const c of ['ch3', 'ch4'].map(ch)) c.minutes = c.screens.reduce((n, id) => n + (S(id)?.minutes || 0), 0);

/* ---- write back in the file's own hand format: unchanged screens and chapters keep their text ---- */
// the top-level objects of the array that starts at `key` in `text`: [{ start, end, text }], and the array's bounds
function arrayBlocks(text, key) {
  const open = text.indexOf('[', text.indexOf(key));
  const blocks = [];
  let depth = 0, inStr = false, start = -1, i = open + 1;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (c === '\\') i++; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') { if (!depth) start = i; depth++; }
    else if (c === '}') { depth--; if (!depth) blocks.push(text.slice(start, i + 1)); }
    else if (c === ']' && !depth) break;
  }
  return { open, close: i, blocks };
}
const inline = (v) => (Array.isArray(v) ? (v.length ? `[${v.map(inline).join(', ')}]` : '[]')
  : v && typeof v === 'object' ? (Object.keys(v).length ? `{ ${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${inline(x)}`).join(', ')} }` : '{}')
  : JSON.stringify(v));
// a value on a line indented `ind`, starting at column `col`: on one line when it fits in 150
// columns, else one entry per line, two spaces further in (the file's own style)
function pretty(v, ind, col = ind) {
  const one = inline(v);
  if (one.length + col <= 150 || !v || typeof v !== 'object') return one;
  const pad = ' '.repeat(ind + 2);
  if (Array.isArray(v)) return `[\n${v.map((x) => pad + pretty(x, ind + 2)).join(',\n')}\n${' '.repeat(ind)}]`;
  return `{\n${Object.entries(v).map(([k, x]) => `${pad}${JSON.stringify(k)}: ${pretty(x, ind + 2, ind + 2 + k.length + 4)}`).join(',\n')}\n${' '.repeat(ind)}}`;
}
// a screen's top-level entries as written: { key: 'value text' } (the scanner of arrayBlocks, one level down)
function entries(block) {
  const out = {};
  let depth = 0, inStr = false, keyStart = -1, valStart = -1, key = null;
  for (let i = 0; i < block.length; i++) {
    const c = block[i];
    if (inStr) { if (c === '\\') i++; else if (c === '"') { inStr = false; if (depth === 1 && key === null && keyStart >= 0) { key = JSON.parse(block.slice(keyStart, i + 1)); } } continue; }
    if (c === '"') { inStr = true; if (depth === 1 && key === null) keyStart = i; continue; }
    if (c === ':' && depth === 1 && key !== null && valStart < 0) { valStart = i + 1; continue; }
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') depth--;
    if ((c === ',' && depth === 1) || depth === 0) {
      if (key !== null && valStart >= 0) out[key] = block.slice(valStart, i).trim();
      key = null; keyStart = -1; valStart = -1;
    }
  }
  return out;
}
// a changed screen: every key whose value is unchanged keeps its text, the rest are printed
const screenText = (s, orig = null) => {
  const was = orig ? entries(orig) : {};
  const o = orig ? JSON.parse(orig) : {};
  return `{\n${Object.entries(s).map(([k, x]) => `      ${JSON.stringify(k)}: ${k in was && JSON.stringify(o[k]) === JSON.stringify(x) ? was[k] : pretty(x, 6, 6 + k.length + 4)}`).join(',\n')}\n    }`;
};
const ORIG = JSON.parse(raw);
let out = raw;
// screens
{
  const { open, close, blocks } = arrayBlocks(out, '\n  "screens": [');
  const byId = new Map(blocks.map((b) => [JSON.parse(b).id, b]));
  const same = (s) => byId.has(s.id) && JSON.stringify(JSON.parse(byId.get(s.id))) === JSON.stringify(s);
  const body = C.screens.map((s) => (same(s) ? byId.get(s.id) : screenText(s, byId.get(s.id)))).join(',\n\n    ');
  out = out.slice(0, open + 1) + '\n    ' + body + '\n  ' + out.slice(close);
}
// chapters (one line each where it fits)
{
  const { open, close, blocks } = arrayBlocks(out, '\n  "chapters": [');
  const byId = new Map(blocks.map((b) => [JSON.parse(b).id, b]));
  const body = C.chapters.map((c) => (JSON.stringify(JSON.parse(byId.get(c.id))) === JSON.stringify(c) ? byId.get(c.id) : inline(c))).join(',\n    ');
  out = out.slice(0, open + 1) + '\n    ' + body + '\n  ' + out.slice(close);
}
// the slice line
out = out.replace(/"slice": \[[^\]]*\]/, `"slice": ${inline(C.lesson.slice)}`);
// everything else must be as it was (ui and tooltips change by hand, in the editor)
const check = JSON.parse(out);
for (const k of Object.keys(C)) if (!['screens', 'chapters', 'lesson'].includes(k) && JSON.stringify(check[k]) !== JSON.stringify(ORIG[k])) throw new Error('unexpected change in ' + k);
if (JSON.stringify(check) !== JSON.stringify(C)) throw new Error('the written file does not match the content object');
writeFileSync(PATH, out.replace(/\r?\n/g, eol), 'utf8');
console.log(`group ${group}: content written (${C.screens.length} screens, slice ${C.lesson.slice.length})`);

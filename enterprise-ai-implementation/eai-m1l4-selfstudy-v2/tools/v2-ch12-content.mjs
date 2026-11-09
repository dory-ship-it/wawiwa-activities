// v2 opening (Intro) and Why map (Noy, 9 Nov 2026: the plan built from the deck's slides, planning/V2-CH1-2-PLAN.md):
//   O1 (s1)  the deck's subtitle, a new set photo
//   O2 (s2)  the h1 says what to do, the top line cut (the 5 word-count failures), dot ground, no "Click to open" cue
//   O3 (s4)  the deliverable as a pair of big cards on the dark blur; the HR case from Lesson 1 named in the foot
//            line (no Dana); the five learning outcomes (s39) parked for the wrap-up
//   S01 (s5) the four causes, a neutral pick on the learner's own Lesson 1 case; "Addressed today" after the pick
//   S02      the case input on a half photo
//   W1 (s6)  a dark statement opener replaces the warm-up guess (the statement answers it)
//   V1       the film as is, its small title line hidden
//   S03 (s31) sort six facts from the film into the two causes today answers
//   K1 (s7, s8, s3) dark key idea, the evidence as two source cards; the chapter's last screen
// Re-runnable: each screen is rewritten whole from this file. Usage: node tools/v2-ch12-content.mjs
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
// the screen object written as the file writes it (2-space JSON, indented under "screens")
const put = (obj) => {
  const [s, e] = range(obj.id);
  t = t.slice(0, s) + '\n' + JSON.stringify(obj, null, 2).split('\n').map((l) => '    ' + l).join('\n') + t.slice(e);
};

const P_O1 = { src: 'assets/img/l4/v2/ch1-o1-mapping-wall.jpg', position: '62% 40%', temp: false };
const P_S02 = { src: 'assets/img/l4/v2/ch1-s02-typing-case.jpg', position: '50% 50%', temp: false };
const P_W1 = { src: 'assets/img/l4/v2/ch2-w1-laptop-paperwork.jpg', position: '60% 50%', temp: false };

/* ---- O1 ---- */
{
  const o = old('O1');
  put({
    id: 'O1', coach: o.coach, chapter: 'ch0', template: 'title', step: o.step, minutes: 1, presentation: true,
    instruction: 'Process Modeling and Workflow Mapping',
    // (Noy, review 1: less text; the photo of the deck's first slide)
    kicker: 'Module 1 · Lesson 4',
    quote: o.quote, start: o.start,
    photo: { src: 'assets/img/l4/v2/ch1-o1-deck-slide1.jpg', position: '70% 40%', temp: false },
    layout: 'title', tracking: [],
    sources: ['s1 (its photo, ppt/media/image6.png)', 's7 (Hammer 1990)'],
  });
}

/* ---- O2 ---- */
{
  const o = old('O2');
  put({
    id: 'O2', coach: o.coach, chapter: 'ch0', template: 'moduleMap', step: o.step, minutes: 1, presentation: true,
    eyebrow: 'Module 1',
    instruction: 'Click a lesson to see where today fits.',
    line: "Today's map feeds Lessons 5 and 6.",
    cue: false, ghost: o.ghost, ground: { kind: 'dots' }, layout: 'wide', stations: o.stations, tracking: [],
    sources: ['s2', 'module outline (Lessons 1 to 6)'],
  });
}

/* ---- O3: the deliverable (s4) ---- */
{
  const o = old('O3');
  put({
    id: 'O3',
    coach: { kind: 'idea', tip: 'Your goal: an AS-IS map of your own case in eight fields, with one success metric.', tipDrafted: true },
    chapter: 'ch0', template: 'deliverable', step: o.step, minutes: 1, presentation: true,
    label: 'Lesson deliverable',
    instruction: 'By the end, you hand in two things',
    text: 'Your entry ticket to Lesson 5.',
    parts: [
      { id: 'map', icon: 'map', title: 'A full AS-IS process map', text: 'Eight fields, as the process really runs.' },
      { id: 'metric', icon: 'target', title: 'One success metric', text: 'Measurable, with a baseline and a clear target.' },
    ],
    foot: { icon: 'route', text: 'First on the HR case from Lesson 1, then on your own case.' },
    photo: P_O1, ground: { kind: 'darkblur' }, tracking: [],
    sources: ['s4', 's15', 's40'],
    $outcomesParked: 'v2 (9 Nov 2026): the five learning outcomes (s39) move to the wrap-up, where the deck has them; kept here until that chapter is rebuilt',
    outcomesParked: o.goals || o.outcomesParked,
  });
}

/* ---- S01: the four causes (s5), the learner's own case ---- */
put({
  id: 'S01', look: 'wide',
  coach: { kind: 'own', tip: 'Think of your Lesson 1 case. Where would an AI project on it most likely fail?', tipDrafted: true },
  chapter: 'ch0', template: 'decision', variant: 'risk', step: { verb: 'Decide', icon: 'decide' }, minutes: 2,
  instruction: 'Choose the cause your Lesson 1 case is most exposed to.',
  hint: 'Any pick is fine. It is about your own case.',
  stage: { top: { kind: 'line', text: 'Lesson 1 named four causes of AI project failure.' } },
  ghost: { type: 'choice', target: 'options-sweep' },
  todayChip: 'Addressed today',
  photo: P_O1, ground: { kind: 'blur' },
  options: [
    { id: 'a', label: 'Unclear problem', sub: 'Nobody can say exactly what hurts', icon: 'help-circle',
      feedback: "Your Lesson 1 problem statement worked on this one. Today's map shows where that problem sits." },
    { id: 'b', label: 'Unmapped process', sub: 'Nobody has drawn how the work flows', icon: 'route', today: true,
      feedback: 'Today answers this one directly: you map your case as it really runs, step by step.' },
    { id: 'c', label: 'Unidentified end user', sub: 'Nobody named who uses the result', icon: 'user-question',
      feedback: 'Your Lesson 1 homework named the role. Today that role gets its own steps on your map.' },
    { id: 'd', label: 'No success metric', sub: 'Nobody can tell if a change worked', icon: 'ruler', today: true,
      feedback: 'Today answers this one directly: you set one success metric, with a baseline and a target.' },
  ],
  advance: 'after-any',
  tracking: [{ id: 'L4_S01_1', type: 'choice', correctResponse: null, scored: false, bloom: 'Evaluate', result: 'neutral' }],
  sources: ['s5', 's40', 'v2 (9 Nov 2026): Dana and the chatbot request removed'],
});

/* ---- S02: your case, on the half photo ---- */
{
  const o = old('S02');
  // (Noy, review 1: the form gets more room than the photo; beside "Open Homework 1", say when to use it)
  const s = { ...o, instruction: 'Type your case from Lesson 1.', photo: P_S02, ground: { kind: 'half', side: 'left', size: 'narrow' },
    stage: { ...o.stage, top: { ...o.stage.top, text: 'No case yet, or starting over? Do Homework 1.' } } };
  // (the keys in the file's order: photo and ground after the instruction)
  const { id, look, coach, chapter, template, caseCard, lockedNext, headAbove, step, minutes, instruction, photo, ground, ...rest } = s;
  put({ id, look, coach, chapter, template, caseCard, lockedNext, headAbove, step, minutes, instruction, photo, ground, ...rest });
}

/* ---- W1: the dark statement (s6) ---- */
put({
  id: 'W1',
  coach: { kind: 'idea', tip: 'Picture a slow process at your work. What would a faster tool on top of it change?', tipDrafted: true },
  chapter: 'ch1', template: 'opener', statement: true, step: { verb: 'Read', icon: 'key-idea' }, minutes: 1, presentation: true,
  instruction: 'Technology on a broken process',
  lead: 'Faster technology on a process nobody mapped does not just fail to solve the problem. It locks it in, faster and at a larger scale.',
  end: "Hammer, Harvard Business Review, 1990: “Don't Automate, Obliterate”",
  photo: P_W1, ground: { kind: 'full' }, tracking: [],
  sources: ['s6', 's7', 'v2 (9 Nov 2026): replaces the warm-up guess, which the statement answers'],
});

/* ---- V1: the film, its small title line hidden; the ground from the kit (Noy, review 1: the chapter
   photo blurred and dark behind the film, as on the lesson's other dark screens) ---- */
{
  const o = old('V1');
  if (o.showTitle !== false || !o.ground) {
    const { id, coach, chapter, template, step, minutes, instruction, instructionPilotCopy, title, showTitle, photo, ground, ...rest } = o;
    put({ id, coach, chapter, template, step, minutes, instruction, instructionPilotCopy, title, showTitle: false, photo: P_W1, ground: { kind: 'darkblur' }, ...rest });
  }
}

/* ---- S03: two cases, one lesson (s31): sort the facts ---- */
const MAP = { correctWrong: 'Is this a number, or how the work moved?' };
const NUM = { correctWrong: 'Look again: this is a measured number, before and after.' };
put({
  id: 'S03', look: 'light',
  coach: { kind: 'practice', tip: 'For each fact ask: is it about how the work flowed, or a number that checked the change?', tipDrafted: true },
  chapter: 'ch1', template: 'sortDeck', attempts: 2, step: { verb: 'Sort', icon: 'sort' }, minutes: 3,
  instruction: 'Drag each fact from the film to the cause it shows.',
  hint: 'How the work flowed, or a number that checked it?',
  ground: { kind: 'dots' }, layout: 'sort-deck',
  columns: [
    { id: 'map', label: 'Unmapped process', sub: 'How the work really flowed', icon: 'route' },
    { id: 'metric', label: 'No success metric', sub: 'The number that checked the change', icon: 'ruler' },
  ],
  cards: [
    { n: 1, text: 'Matching three documents', column: 'map', tag: 'Car company',
      feedback: { correct: "Right: mapping showed where the car company's work really went.", wrong: MAP.correctWrong } },
    { n: 2, text: 'Handling time cut to 2 min', column: 'metric', tag: 'Fintech',
      feedback: { correct: "Right: a number that showed what the fintech's change did.", wrong: NUM.correctWrong } },
    { n: 3, text: 'One path for every request', column: 'map', tag: 'Fintech',
      feedback: { correct: 'Right: the path never told routine requests from judgment calls.', wrong: MAP.correctWrong } },
    { n: 4, text: 'Headcount down about 75%', column: 'metric', tag: 'Car company',
      feedback: { correct: 'Right: the number that showed the rewritten process worked, per reports.', wrong: NUM.correctWrong } },
    { n: 5, text: 'Payment from the receipt', column: 'map', tag: 'Car company',
      feedback: { correct: 'Right: the rewritten flow, with no separate invoice step.', wrong: MAP.correctWrong } },
    { n: 6, text: 'Quality fell on hard cases', column: 'metric', tag: 'Fintech',
      feedback: { correct: 'Right: a quality measure showed where the change hurt service.', wrong: NUM.correctWrong } },
  ],
  advance: 'after-all-placed', hintShown: true, ghost: { type: 'drag', showMe: false },
  tracking: [{ id: 'L4_S03_1', type: 'matching', correctResponse: '1.map,2.metric,3.map,4.metric,5.map,6.metric', scored: false, bloom: 'Analyze', result: 'graded' }],
  sources: ['s31', 's5', 'V1 segments 4, 5, 6, 8'],
});

/* ---- K1: the key idea, dark (s7, s8, s3), the chapter's last screen ---- */
{
  const o = old('K1');
  put({
    id: 'K1', coach: o.coach, chapter: 'ch1', template: 'concept', step: o.step, minutes: 2, presentation: true,
    label: 'Key idea',
    instruction: "Don't accelerate. Deconstruct.",
    text: 'Mapping separates a change that works from one you fix later.',
    layout: 'concept', photo: P_W1, ground: { kind: 'darkblur' },
    figures: o.figures.map(({ chip, ...f }) => f),
    // (Hammer's source line is W1's; here it read as McKinsey's)
    evidence: {
      items: [
        { source: 'Gartner', text: 'Process discovery comes before advanced automation.' },
        { source: 'McKinsey, 2025', text: 'Workflow redesign drives AI value most.' },
      ],
    },
    endOfChapter: true, tracking: [],
    sources: ['s7', 's8', 's3', 's31'],
  });
}

/* ---- the chapter order: S03 before K1 ---- */
const ch = json.chapters.find((c) => c.id === 'ch1');
if (ch.screens.join() !== 'W1,V1,S03,K1') {
  t = t.replace(/("id": "ch1",[\s\S]*?"screens": \[)[\s\S]*?(\])/, (m, a, b) => a + '\n        "W1",\n        "V1",\n        "S03",\n        "K1"\n      ' + b);
}
// the screens array keeps the learner's order too
{
  const at = (id) => t.indexOf(`\n      "id": "${id}",`);
  if (at('K1') < at('S03')) {
    const [s, e] = range('K1');
    const k1 = t.slice(s, e);
    t = t.slice(0, s) + t.slice(e);
    const [, e3] = range('S03');
    t = t.slice(0, e3) + ',\n' + k1 + t.slice(e3); // (the blank line between blocks, as in the file)
    // the cut left two commas where K1 stood: tidy
    t = t.replace(/\n    },,\n/g, '\n    },\n');
  }
}
// the personal path's first checkpoint (c4) counts graded items only: S01 is now a neutral pick on the own case,
// so the film's first stop (graded, same chapters) takes its place and c4 keeps its nine items and its bands
t = t.replace(/("items": \[\n\s*)"L4_S01_1",/, '$1"L4_V1_1",');
// (no blank lines or doubled commas left between the blocks; JSON strings hold no raw newlines)
t = t.replace(/\}(\s*),\s*,/g, '}$1,');
JSON.parse(t); // still valid JSON
writeFileSync(FILE, t.replace(/\n/g, EOL));
console.log('v2 Intro and Why map written');

// FX4 content edits on content/l4-slice.json (5 Nov 2026, Dor's pilot review + Noy's notes), as text: the
// file's hand format kept. One instruction per screen (verb first, at most 12 words), at most 35 words on
// a practice screen (answer options not counted), one plain "why" sentence of at most 20 words for every
// right answer, per-card tags and a distractor card in the sorts, definitions as tooltips (no boxes),
// the workbook thread (O2, S08B, S12B, S22). Every replacement asserts what it replaces (a second run
// fails loudly instead of doing half the work). Usage: node tools/fx4-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
if (t.includes('"$fx4"')) { console.log('fx4-content: already applied'); process.exit(0); }

const all = (a, b) => { if (!t.includes(a)) throw new Error('missing: ' + a.slice(0, 100)); t = t.split(a).join(b); };
// the text block of one screen: from its id to the next screen's id
const span = (id) => {
  const a = t.indexOf(`"id": "${id}",`);
  if (a < 0) throw new Error('no screen ' + id);
  const ids = [...t.slice(a + 10).matchAll(/\n    \{\n      "id": "([A-Za-z0-9]+)",|\n    \{ "id": "([A-Za-z0-9]+)",/g)];
  const b = ids.length ? a + 10 + ids[0].index : t.length;
  return [a, b];
};
const inScreen = (id, x, y) => {
  const [a, b] = span(id);
  const block = t.slice(a, b);
  if (!block.includes(x)) throw new Error(`${id}: missing ${x.slice(0, 100)}`);
  t = t.slice(0, a) + block.split(x).join(y) + t.slice(b);
};
// remove "key": <value> (an object, array or string) inside a range, with the comma before it
const removeKey = (key, from = 0, to = t.length) => {
  const i = t.indexOf(`"${key}":`, from);
  if (i < 0 || i >= to) return false;
  let j = t.indexOf(':', i) + 1;
  while (/\s/.test(t[j])) j++;
  let depth = 0, inStr = false;
  // a literal (null, true, false, a number) runs to the next comma or closing bracket
  if (/[-0-9a-z]/.test(t[j])) { while (j < t.length && !/[,}\]\s]/.test(t[j])) j++; }
  else for (; j < t.length; j++) {
    const ch = t[j];
    if (inStr) { if (ch === '\\') j++; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') { inStr = true; if (depth === 0) { j = t.indexOf('"', j + 1); while (t[j - 1] === '\\') j = t.indexOf('"', j + 1); j++; break; } continue; }
    if (ch === '{' || ch === '[') depth++;
    if (ch === '}' || ch === ']') { depth--; if (depth === 0) { j++; break; } }
  }
  let s = i; while (/\s/.test(t[s - 1])) s--;
  if (t[s - 1] === ',') s--; else { while (/[\s,]/.test(t[j])) j++; }
  t = t.slice(0, s) + t.slice(j);
  return true;
};
const removeInScreen = (id, key) => { const [a, b] = span(id); while (removeKey(key, a, span(id)[1])); };

/* ---- 1. instructions: verb first, at most 12 words, one sentence ---- */
all('"instruction": "New technology runs on a broken process. What happens?"', '"instruction": "Guess what happens when new technology runs on a broken process."');
all('"instruction": "An employee emails HR a question. In process terms, what is that email?"', '"instruction": "Guess what an employee\'s email to HR is, in process terms."');
all('"instruction": "An employee asks HR about their own salary. May that question go into a public AI tool?"', '"instruction": "Guess: may a salary question go into a public AI tool?"');
inScreen('W3', '"foot": "Chapter {ch3} · HR demo"', '"text": "An employee asks HR about their own salary.", "foot": "Chapter {ch3} · HR demo"');
all('"instruction": "Which decision needs clear human judgment, not AI?"', '"instruction": "Guess which decision needs clear human judgment, not AI."');
all('"question": "Which field lets you check, three months from now, whether the change worked?"', '"question": "Pick the field that shows, in three months, whether the change worked."');
all('"questionHint": "Pick the field you could measure again in three months."', '"questionHint": "Think about what you could measure again later."');
all('"instruction": "Drag the two risk flags onto the fields that show the handoff risk."', '"instruction": "Drag the two risk flags onto the fields with the handoff risk."');
all('"instruction": "Drag the Start flag and the End flag onto the HR process line."', '"instruction": "Drag the Start and End flags onto the HR process line."');
all('"instruction": "Name one step that could fit AI, and one that stays with a person."', '"instruction": "Name one step that could fit AI and one for a person."');
all('"instruction": "Pick the takeaway your map proves most. Then save your record."', '"instruction": "Pick the takeaway your map proves most."');

// S01: its hint said only how to click (the panel is at its height limit, so no Hint row for nothing)
inScreen('S01', '"hint": "Pick one. You can change your mind.",', '"hint": "",');

/* ---- 2. practice screens to 35 words (options not counted) ---- */
// S02
all('"text": "In Lesson 1 you chose one use case for the whole module. Today you map it."', '"text": "Use the case you chose in Lesson 1. Today you map it."');
all('"text": "No Homework 1 at hand? Use any process at your work that repeats and that you know well."', '"text": "No Homework 1 at hand? Use any repeating process you know well."');
all('"placeholder": "3 to 6 words, e.g. Sales call summaries"', '"placeholder": "e.g. Sales call summaries"');
all('"placeholder": "Today X happens, and it hurts because Y."', '"placeholder": "Today X happens, which hurts because Y."');
// S08B (and the workbook thread: where the sketch goes)
inScreen('S08B', '"text": "A rough first try. You build the full map in Chapter {ch5}."', '"text": "This goes into Fields 2 and 3 of your workbook in Chapter {ch5}."');
inScreen('S08B', '"placeholder": "What starts it? e.g. A request form arrives"', '"placeholder": "e.g. A form arrives"');
inScreen('S08B', '"placeholder": "The main steps, and who does them"', '"placeholder": "Steps, and who does them"');
inScreen('S08B', '"placeholder": "What comes out, and to whom"', '"placeholder": "e.g. A summary, to a manager"');
inScreen('S08B', '"text": "Leave out names and identifying details."', '"text": "No names or identifying details."');
// S12B
inScreen('S12B', '"text": "Back to your own case."', '"text": "This goes into Field 8 of your workbook in Chapter {ch5}."');
// S17B (its notes are not a workbook field: they stay off the map, for Lesson 5)
inScreen('S17B', '"text": "Back to your own case. Your steps from Chapter {ch2}:"', '"text": "Your steps from Chapter {ch2}:"');
inScreen('S17B', '"text": "This note stays off your AS-IS map. Lesson 5 starts from it."', '"text": "Not on your map: Lesson 5 starts from this note."');
inScreen('S17B', '"placeholder": "e.g. Sort requests by topic"', '"placeholder": "e.g. Sort by topic"');
inScreen('S17B', '"placeholder": "e.g. Approve an exception"', '"placeholder": "e.g. Approve exceptions"');
inScreen('S17B', '"text": "Leave out names and identifying details."', '"text": "No names or identifying details."');
// S20
inScreen('S20', '"text": "Welcome back. Keep your PDF open."', '"text": "Keep your PDF open."');
all('"text": "Does every step name who exactly does it?"', '"text": "Does every step name who does it?"');
all('"text": "Does Field 4 say what happens if the receiver is unavailable?"', '"text": "Does Field 4 cover an unavailable receiver?"');
all('"text": "Can a number show that the metric improved?"', '"text": "Can a number show the metric improved?"');
all('"fixLine": "Make the fix in the workbook, export again, then press Next."', '"fixLine": "Fix it in the workbook and export again."');
// S12: the eight filled fields, short (the HR map's own words, as S21's map item)
const S12 = [
  ['Answering employees\' repeat questions to HR', 'Repeat HR questions'],
  ['Receiving the request (HR staff) to checking the topic (HR staff) to answer or escalation (HR staff / manager)', 'Receive, check, answer or escalate'],
  ['From HR staff to HR manager when policy is exceeded', 'HR staff to HR manager, beyond policy'],
  ['Vacation, pension, expense, overtime policy. Owner: HR manager. Tag: INTERNAL', 'Four policies; owner HR manager; INTERNAL'],
  ['No formal control: depends on the staffer\'s personal judgment', 'No formal control: staff judgment'],
  ['Unclear how many wrong answers were given; no single handoff channel', 'Errors uncounted; no single handoff channel'],
  ['Baseline ~35% of HR time on repeat questions. Target 20% within 3 months', '~35% of HR time now, 20% in 3 months'],
];
S12.forEach(([a, b]) => all(`"text": "${a}"`, `"text": "${b}"`));
all('"text": "A question by WhatsApp, email, or in person"', '"text": "WhatsApp, email, or in person"');
// S22 (Chapter 7: the PDF map is the deliverable; the record is secondary)
all('"text": "In Lesson 5 this map becomes an AI architecture: Field 5 its knowledge layer, Field 8 its monitoring. Bring your AI notes from Chapter {ch4}."',
  '"text": "Your workbook PDF is your map: bring it to Lesson 5, where it becomes your AI architecture."');
inScreen('S22', '"step2": {', '"step2": {\n        "instruction": "Bring your PDF map to Lesson 5.",');
all('"download": "Your record holds your case title, notes, metric, self-check answers, takeaway and score. Your map stays in your workbook PDF. Bring it to Lesson 5."',
  '"download": "Saved: your notes, answers and score. Your map itself is the workbook PDF."');

// S02: one sentence of context
all('"text": "Use the case you chose in Lesson 1. Today you map it."', '"text": "Use the case you chose in Lesson 1."');
inScreen('S08B', '"text": "This goes into Fields 2 and 3 of your workbook in Chapter {ch5}."', '"text": "It goes into workbook Fields 2 and 3 in Chapter {ch5}."');

/* ---- 2b. presentation screens to 45 words (the review page's flags) ---- */
// O2: from the start, the lesson builds toward the learner's own map (Phase 3)
inScreen('O2', '"line": "Open any lesson to see how it connects to today."', '"line": "By the end you will have your own process map, exported as a PDF."');
inScreen('O2', '"kicker": "Lessons 2 and 3"', '"kicker": "Lessons 2, 3"');
inScreen('O2', '"eyebrow": "Where we are"', '"eyebrow": "Module 1"');
inScreen('O2', '"title": "A full process map"', '"title": "Full process map"');
inScreen('O2', '"text": "Your Lesson 1 case is the raw material for today."', '"text": "Your case: today\'s raw material."');
inScreen('O2', '"text": "The nine-field template looked at one step. Today you map the whole process."', '"text": "Looked at one step only."');
inScreen('O2', '"text": "You map one process as it runs today, and set one number to check it by."', '"text": "One process, as it runs."');
inScreen('O2', '"text": "Next lesson marks on your map where AI enters."', '"text": "Where AI enters your map."');
inScreen('O2', '"text": "You choose how to build it, on an implementation canvas."', '"text": "How you will build it."');
// K2
inScreen('K2', '"text": "Process mapping shows how work really flows: who does each step, what goes in, what comes out."', '"text": "How work really flows."');
inScreen('K2', '"text": "What starts it: a message, a form, a date."', '"text": "What starts it."');
inScreen('K2', '"text": "The path to the result. Three to seven is usually enough."', '"text": "The path to the result."');
inScreen('K2', '"text": "What comes out, and to whom."', '"text": "What comes out, to whom."');
// S05a
inScreen('S05a', '"text": "BPMN is a standard way to draw a process. You only need to recognize three parts."', '"text": "You only need these three parts."');
inScreen('S05a', '"text": "Swimlane: one row per role: who does what."', '"text": "Swimlane: one row per role."');
inScreen('S05a', '"text": "Gateway: a decision. The path splits."', '"text": "Gateway: the path splits."');
inScreen('S05a', '"text": "Event: where the process starts or ends."', '"text": "Event: start or end."');
inScreen('S05a', '"instruction": "How to read a BPMN diagram",', '"instruction": "How to read a BPMN diagram",\n      "terms": ["BPMN"],');
// K4
inScreen('K4', '"text": "AI fits three kinds of step. Everything else stays with a person, or gets fixed first."', '"text": "Otherwise, a person decides."');
inScreen('K4', '"text": "free text in, structured data out"', '"text": "text in, data out"');
inScreen('K4', '"text": "small, reversible calls a person can watch"', '"text": "reversible, watched"');
inScreen('K4', '"text": "AI documents what passes"', '"text": "AI records what passes"');
inScreen('K4', '"term": "Rights or money at stake"', '"term": "Money or rights at stake"');
inScreen('K4', '"term": "Steps the map marks \\"unclear\\""', '"term": "Map says \\"unclear\\""');
// S21R: each missed item, its short name and a few words
inScreen('S21R', '"text": "Review what you missed, then retake the whole check."', '"text": "Review, then retake the check."');
[['Revisit what a handoff must record.', 'Handoff parts'], ['Revisit the three good fits for AI.', 'Good fits for AI'], ['Revisit baseline, target and date.', 'Baseline, target, date'],
  ['Revisit why \'unclear\' belongs in Field 7.', 'Why \'unclear\' is valid'], ['Revisit who keeps a source current.', 'Source owners'], ['Revisit the full HR map, line by line.', 'The HR map']]
  .forEach(([a, b]) => inScreen('S21R', `"text": "${a}"`, `"text": "${b}"`));

/* ---- 3. definitions as tooltips on the term, not boxes (S11, S14, S15) ---- */
removeInScreen('S11', 'band');
removeInScreen('S14', 'band');
removeInScreen('S15', 'band');
inScreen('S11', '"terms": ["Success metric", "Field 8"]', '"terms": ["Success metric", "Field 8", "Baseline", "Target", "Date"]');
inScreen('S14', '"instruction": "Choose what the map must record at this handoff.",', '"instruction": "Choose what the map must record at this handoff.",\n      "terms": ["handoff"],');
inScreen('S15', '"instruction": "Choose the first question to ask about this bottleneck.",', '"instruction": "Choose the first question to ask about this bottleneck.",\n      "terms": ["bottleneck"],');
all('"Bottleneck": "A step limited by the slowest resource.",', '"Bottleneck": "A step limited by the slowest resource.",\n    "handoff": "The moment responsibility passes from one role to another.",\n    "bottleneck": "A step limited by the slowest resource.",\n    "Date": "When you check the number again.",');

/* ---- 4. right-answer lines: one plain sentence, at most 20 words; long wrong lines cut ---- */
const LINES = [
  ['Vendors will ask who answers what, through which channel, and what counts as a wrong answer. Today nobody can tell them.', 'Vendors will ask who answers what and through which channel, and today nobody can tell them.'],
  ['Nobody has yet seen how requests arrive or who answers them. A chatbot on an unmapped flow only speeds up whatever is broken.', 'A chatbot on an unmapped flow only speeds up whatever is broken, so map the flow first.'],
  ['That is the question mapping answers. Watch what it found.', 'That is the question mapping answers: where the work really goes.'],
  ['Both cases changed only after someone saw how the work really flowed. Today you map it in eight fields.', 'Both cases changed only after someone saw how the work really flowed.'],
  ['Both changes were checked by numbers; without one, nobody could tell. Today you set a baseline and a target.', 'Both changes were checked by numbers; without one, nobody could tell whether they worked.'],
  ['Both cases changed once someone saw how the work flowed, and both were checked by numbers. Today you build both: a map and a metric.', 'Both cases changed once someone saw the real flow, and both were checked by numbers.'],
  ['Right: a question in person is another trigger. Requests arrive three ways.', 'Right: asking in person is another trigger; requests arrive three ways.'],
  ['Right: answering or escalating is still a step. The employee is waiting.', 'Right: answering or escalating is still a step, because the employee is still waiting.'],
  ['Right: each row is one role. Escalations sit in the HR manager\'s lane.', 'Right: each row is one role, and escalations sit in the HR manager\'s lane.'],
  ['Right: the diamond is a decision. Within policy, staff answer; beyond it, the manager does.', 'Right: the diamond is a decision where the path splits, within policy or beyond it.'],
  ['Fast to fill alone, enough for a first diagnosis. This is the tool you use for your own case.', 'Fast to fill alone and enough for a first diagnosis, so you use it for your own case.'],
  ['The map now shows a tool nobody uses today. The current state is lost, and Lesson 5 has nothing to build on.', 'The map now shows an AI tool nobody uses today, so the real current state is lost.'],
  ['It records what really happens. That missing check is exactly what the map is meant to reveal.', 'It records what really happens, and that missing check is what the map should reveal.'],
  ['Placed. The map now shows which document an HR answer depends on.', 'Placed: the map now shows which document an HR answer depends on.'],
  ['Placed. Overtime is one of the repeat topics in the Lesson 1 case.', 'Placed: overtime is one of the repeat topics in the HR case.'],
  ['Placed. When a policy goes stale, the map now names who has to update it.', 'Placed: when a policy goes stale, the map names who must update it.'],
  ['Placed. The policies stay inside the company. An employee\'s own details would be CONFIDENTIAL and stay out of public AI tools.', 'Placed: the policies stay inside the company, so they are tagged INTERNAL.'],
  ['Kept out. It describes how answers get checked. That is Field 6.', 'Kept out: it describes how answers get checked, which is Field 6.'],
  ['Kept out. No chatbot runs today. Adding AI while mapping turns the AS-IS map into a plan.', 'Kept out: no chatbot runs today, and adding AI while mapping turns the map into a plan.'],
  ['Placed. A knowledge source: the document an HR answer depends on.', 'Placed: a knowledge source, the document an HR answer depends on.'],
  ['Placed. Another source the HR staff read before they answer.', 'Placed: another source the HR staff read before they answer.'],
  ['Placed. The owner keeps the policies current. When one goes stale, the map names who updates it.', 'Placed: the owner keeps the policies current and updates one when it goes stale.'],
  ['Placed. The sensitivity tag decides what may go to an AI tool. The policies stay inside the company.', 'Placed: the tag decides what may go into an AI tool, and policies stay inside.'],
  ['Kept out. That starts the process. It is the trigger, Field 2.', 'Kept out: that starts the process, so it is the trigger in Field 2.'],
  ['Kept out. That is a step with its role owner, Field 3.', 'Kept out: that is a step with its role owner, in Field 3.'],
  ['Placed. In the car-company case, payment later ran straight from this record.', 'Placed: in the car-company case, payment later ran straight from this record.'],
  ['Placed. One of the three documents the clerks reconcile today.', 'Placed: one of the three documents the clerks reconcile today.'],
  ['Placed. When the payment rules change, the map names who must update them.', 'Placed: when the payment rules change, the map names who must update them.'],
  ['Placed. Supplier bank details are financial data. They stay out of public AI tools.', 'Placed: supplier bank details are financial data, so they stay out of public AI tools.'],
  ['Kept out. Matching is a step and a manual check: Fields 3 and 6.', 'Kept out: matching is a step and a manual check, Fields 3 and 6.'],
  ['Kept out. No AI runs here today. Adding it while mapping turns the AS-IS map into a plan.', 'Kept out: no AI runs here today, and adding it turns the AS-IS map into a plan.'],
  ['\'Unclear\' is a legitimate answer. Field 7 now shows what to investigate before Lesson 5.', '\'Unclear\' is a legitimate answer: Field 7 now shows what to investigate before Lesson 5.'],
  ['Checkable: a start point, a target and a date. One primary number to watch.', 'Checkable: it has a start point, a target and a date for one number.'],
  ['Today\'s number, a target, a date. Checkable later.', 'Today\'s number, a target and a date make it checkable later.'],
  ['Your own baseline, a target and a date. Estimated is fine.', 'Your own baseline, a target and a date make it checkable; estimated is fine.'],
  ['Field 4 shows the question moving from HR staff to the HR manager. Field 7 adds the risk: no single channel for that handoff.', 'Field 4 shows the question passing to the HR manager, and Field 7 adds its risk: no single channel.'],
  ['Field 4 shows responsibility passing from HR staff to the HR manager. Field 7 records the risk there: no single channel.', 'Field 4 shows responsibility passing to the HR manager, and Field 7 records the risk: no single channel.'],
  ['Field 4 now shows sender, receiver, what passes, and the unavailable case. Here nothing covers it, so Field 7 records it.', 'Field 4 records sender, receiver, what passes and the away case; Field 7 records that nobody covers it.'],
  ['Never assume the receiver knows the history. What must travel with the question, and what if nobody is there to take it?', 'Never assume the receiver knows the history: what must travel with the question, and who takes it?'],
  ['All four parts of a handoff. Nothing covers the away case, so Field 7 records it.', 'All four parts of a handoff, and Field 7 records that nobody covers the away case.'],
  ['Sender, receiver, what passes, and the away case. Today nobody covers, so Field 7 records that gap.', 'Sender, receiver, what passes and the away case, with Field 7 recording that nobody covers it.'],
  ['On a good map, every handoff is marked: from whom to whom, what passes, and what if the receiver is unavailable.', 'A good map marks every handoff: from whom, to whom, what passes, and the unavailable case.'],
  ['The cause decides the fix. Sometimes the right fix is to remove the step, not speed it up, as in the car-company case.', 'The cause decides the fix; sometimes you remove the step instead of speeding it up, like the car company.'],
  ['You would speed up a step without knowing why it formed. Faster technology on an unmapped process locks the problem in.', 'You would speed up a step without knowing why it formed, which locks the problem in.'],
  ['You asked why the bottleneck formed. Sometimes the right fix is to remove the step, not speed it up.', 'You asked why it formed; sometimes the right fix is to remove the step, not speed it up.'],
  ['The cause decides the fix. If most disputes need only part of the chat, the full read could go.', 'The cause decides the fix: if most disputes need only part of the chat, the full read could go.'],
  ['Poor fit: irreversible, money at stake. Per reports, the fintech\'s quality dropped on complex cases and it moved to a hybrid model.', 'Poor fit: money is at stake and it is hard to undo, as the fintech found on complex cases.'],
  ['Poor fit, a process problem: nothing is missing but order. AI on top keeps the disorder running faster.', 'Poor fit: this is a process problem, and AI on top keeps the disorder running faster.'],
  ['Poor fit: you cannot build on unknown foundations. This needs diagnosis, not more technology.', 'Poor fit: you cannot build on unknown foundations; this needs diagnosis, not more technology.'],
  ['Poor fit: money and rights at stake, hard to undo. That needs clear human judgment.', 'Poor fit: money and rights are at stake and hard to undo, so a person decides.'],
  ['Poor fit: you cannot build a solution on unknown foundations. Diagnose first.', 'Poor fit: you cannot build on unknown foundations, so diagnose first.'],
  ['Poor fit: money at stake and hard to undo. Per reports, the fintech\'s quality dropped on disputes.', 'Poor fit: money is at stake and hard to undo, and fintech quality dropped on disputes.'],
  ['Good fit, a low-risk decision. Per reports, AI did as well as people on simple requests.', 'Good fit, a low-risk decision: per reports, AI did as well as people on simple requests.'],
  ['Poor fit: drafting looks safe, but the foundations are unknown. This needs diagnosis first.', 'Poor fit: drafting looks safe, but the foundations are unknown, so diagnose first.'],
  ['Controls and gaps are where the findings live. Skipping them leaves Lesson 5 nothing to protect against.', 'Controls and gaps hold the findings, so skipping them leaves Lesson 5 nothing to protect against.'],
  ['The map now describes a wish. Every gap on a normal day stays hidden.', 'The map describes a wish, so every gap on a normal day stays hidden.'],
  ['The most critical mistake. Three channels with no organized system get faster, and the disorder grows with them.', 'The most critical mistake: three disorganized channels get faster, and the disorder grows with them.'],
  ['The map was right once. Lesson 5 would now build on a process that no longer exists.', 'The map was right once, but Lesson 5 would now build on a process that no longer exists.'],
  ['Without a question, nobody can say which process or boundaries matter. The map grows and decides nothing.', 'Without a question, nobody knows which process or boundaries matter, so the map decides nothing.'],
  ['Mapping the aspirational state instead of the actual one. Map what happens, not what is supposed to.', 'The map shows the aspirational state, not the actual one; map what happens, not what should.'],
  ['Rushing the mapping itself. The hard fields hold the findings Lesson 5 needs.', 'Rushed mapping skips the hard fields, which hold the findings Lesson 5 needs.'],
  ['Neglecting to update the map after changes. It was right once, and now it is not.', 'The map was not updated after a change: it was right once, and now it is not.'],
  ['Automating a broken process, the most critical mistake. The disorder runs faster.', 'Automating a broken process is the most critical mistake: the disorder just runs faster.'],
  ['No clear goal for the mapping. Without a question, the map decides nothing.', 'No clear goal: without a question to answer, the map decides nothing.'],
  ['The map describes the procedure, not a normal day. The real gaps stay hidden.', 'The map describes the procedure, not a normal day, so the real gaps stay hidden.'],
  ['The map was right once. Lesson 5 would build on a step that no longer exists.', 'The map was right once, but Lesson 5 would build on a step that no longer exists.'],
  ['The most critical mistake. The car company removed this step; speeding it up keeps the mess.', 'The most critical mistake: the car company removed this step, and speeding it up keeps the mess.'],
  ['Without a question, nobody can say which steps or boundaries matter. The map grows and decides nothing.', 'Without a question, nobody knows which steps or boundaries matter, so the map decides nothing.'],
  ['Placed. An honest unknown. It tells you what to ask before Lesson 5.', 'Placed: an honest unknown that tells you what to ask before Lesson 5.'],
  ['Placed. A concrete event starts the work, as in HR, but here it repeats 8 to 12 times a day per rep.', 'Placed: a concrete event starts the work, here 8 to 12 times a day per rep.'],
  ['Kept out. Your Homework 2 AI step is a future idea too. It stays off your AS-IS map.', 'Kept out: an AI step is a future idea, so it stays off your AS-IS map.'],
  ['Placed. The step and its owner, written as it really runs: often late, not as the rule says.', 'Placed: the step and its owner as it really runs, often late, not as the rule says.'],
  ['Nothing identifying leaves your hands. If unsure whether something is allowed, the Lesson 3 rule applies: leave it out.', 'Nothing identifying leaves your hands; when unsure, the Lesson 3 rule applies: leave it out.'],
  ['Nobody can even estimate who reads it, so \'unclear\' is the honest answer. It shows what to check before Lesson 5.', 'Nobody can even estimate who reads it, so \'unclear\' is the honest answer to check before Lesson 5.'],
  // S08 round 3 ("Don't fix"): the plain reason, no riddle (Noy's note)
  ['The real gap, no single handoff channel, disappears from the Handoffs and Gaps fields before anyone has measured it.', 'The mapper added a channel that does not exist today, which is fixing the process while mapping it.'],
];
LINES.forEach(([a, b]) => all(`"${a}"`, `"${b}"`));

/* ---- 5. sorts: a tag on each card after Check, a distractor in S04, no giveaway words in S16 ---- */
const TAGS = {
  'An employee sends a question by email': 'Starts the work',
  'HR staff check the topic of the question': 'A step on the path',
  'An employee walks over to ask HR': 'Another way it starts',
  'HR staff answer or escalate to the manager': 'Still a step',
  'HR staff send the answer back': 'HR\'s step, not the result',
  'The employee receives an answer': 'What comes out, to whom',
  'Vacation policy': 'A document HR answers from', 'Overtime policy': 'Another source', 'Pension policy': 'Another source',
  'HR manager': 'Keeps the policies current', 'INTERNAL': 'Stays inside the company',
  'No formal control': 'Field 6: controls', 'Chatbot answers policy questions': 'AI idea, not today',
  'WhatsApp question arrives': 'Field 2: trigger', 'Staff check the topic': 'Field 3: a step',
  'Receipt record': 'Payment runs from it', 'Supplier invoice': 'A document clerks reconcile', 'Finance controller': 'Keeps payment rules current',
  'CONFIDENTIAL': 'Financial data', 'Clerks match documents': 'Fields 3 and 6', 'AI reads every invoice': 'AI idea, not today',
  'Sort incoming messages by topic': 'Text in, topic out', 'Decide a financial refund': 'Money at stake',
  'Flag requests due today': 'Low risk if wrong', 'Fix disorder in how requests arrive': 'Process problem first',
  'Answer where the map says \'unclear\'': 'Unknown foundations', 'Brief the manager on a case': 'History travels on',
  'Tag questions by topic': 'Text in, topic out', 'Approve a pension exception': 'Rights at stake', 'Mark urgent or routine': 'Low risk if wrong',
  'Sort out three unmanaged channels': 'Process problem first', 'Build on \'unclear\' error counts': 'Unknown foundations', 'Pass history to the manager': 'History travels on',
  'Extract order numbers': 'Text in, data out', 'Decide a disputed charge': 'Money at stake', 'Route simple requests': 'Low risk if wrong',
  'Auto-reply three unsorted inboxes': 'Process problem first', 'Draft replies where the map says \'unclear\'': 'Unknown foundations', 'Brief whoever takes a dispute': 'History travels on',
};
// S04: "arrives" gave the trigger away; S16: "free-text", "label" and "pass on" named their columns
inScreen('S04', '"text": "A question arrives in person"', '"text": "An employee walks over to ask HR"');
inScreen('S16', '"text": "Tag free-text questions by topic"', '"text": "Sort incoming messages by topic"');
inScreen('S16', '"text": "Label requests urgent or routine"', '"text": "Flag requests due today"');
inScreen('S16', '"text": "Pass on the case history"', '"text": "Brief the manager on a case"');
// S04's distractor: sending looks like the output, but it is still HR's step
inScreen('S04', `            "c": "Escalation passes work on, it does not end it. Someone still has to reply." } },
        { "n": 5,`, `            "c": "Escalation passes work on, it does not end it. Someone still has to reply." } },
        { "n": 6, "text": "HR staff send the answer back", "column": "b",
          "feedback": { "correct": "Right: sending is still HR's step; the output is what the employee receives.",
            "a": "The question was answered before this, so the work has long started.",
            "c": "Sending is something HR does. The output is what the employee ends up with." } },
        { "n": 5,`);
inScreen('S04', '"correctResponse": "1.a,2.b,3.a,4.b,5.c"', '"correctResponse": "1.a,2.b,3.a,4.b,6.b,5.c"');
let tagged = 0;
for (const [text, tag] of Object.entries(TAGS)) {
  // (one line in the core cards, one property per line in the PP1 variants: the tag follows "column" either way)
  const re = new RegExp(`("text": "${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",(\\s*)"column": "[a-d]",)(?!\\s*"tag")`, 'g');
  t = t.replace(re, (m, a, ws) => { tagged++; return `${a}${ws.includes('\n') ? ws : ' '}"tag": "${tag}",`; });
}

/* ---- 6. no more word allowances: every screen fits its budget ---- */
let removed = 0;
while (removeKey('wordLimit')) removed++;

/* ---- 6b. S19 in three screens (Phase 3): S19A brief, S19B open (the old S19), S19C back ---- */
all('"S18B", "S19", "S20"', '"S18B", "S19A", "S19B", "S19C", "S20"'); // the slice and Chapter 6's screens
const S19A = `    {
      "id": "S19A",
      "coach": { "kind": "workbook", "tip": "Read the three steps first. The workbook has its own coach for each field.", "tipDrafted": true },
      "chapter": "ch5",
      "template": "handoff",
      "variant": "brief",
      "presentation": true,
      "step": { "verb": "Map", "icon": "overview" },
      "minutes": 1,
      "eyebrow": "Your workbook",
      "chip": "About 40 min",
      "instruction": "What you will do now",
      "text": "The workbook holds your own process map. Lesson 5 starts from it.",
      "steps": [
        { "n": 1, "text": "Fill eight fields as the process runs today" },
        { "n": 2, "text": "Keep AI ideas off the map" },
        { "n": 3, "text": "Export your PDF" }
      ],
      "image": { "src": "assets/img/l4/s19a-workbook.jpg", "alt": "The workbook's first page: AS-IS Process Mapping for Your Own Use Case, with its mission board and coach", "prompt": "assets/img/prompts/S19A-workbook-shot.md", "temp": false, "position": "50% 0%" },
      "tracking": [],
      "sources": ["FX4 Phase 3 (5 Nov 2026): split from S19", "planning/STORYBOARD-V3-CH5-6.md S19"]
    },

`;
const S19C = `
    {
      "id": "S19C",
      "coach": { "kind": "workbook", "tip": "The export is in the workbook's Mission report, its last step.", "tipDrafted": true },
      "chapter": "ch5",
      "template": "handoff",
      "variant": "back",
      "locked": "pdf",
      "step": { "join": true },
      "minutes": 1,
      "text": "Welcome back.",
      "instruction": "Did you export your PDF?",
      "notYetLine": "Export it from the workbook's last step, then press Yes.",
      "tracking": [],
      "sources": ["FX4 Phase 3 (5 Nov 2026): split from S19"]
    },
`;
{
  const a = t.indexOf('    {\n      "id": "S19",');
  if (a < 0) throw new Error('no S19 block');
  t = t.slice(0, a) + S19A + t.slice(a);
  const b = t.indexOf('    {\n      "id": "S20",');
  t = t.slice(0, b) + S19C.slice(1) + '\n' + t.slice(b);
}
inScreen('S19', '"id": "S19",', '"id": "S19B",');
inScreen('S19B', `      "step": { "verb": "Map", "icon": "overview" },
      "minutes": 42,
      "eyebrow": "Your workbook",
      "chip": "About 40 min",
      "instruction": "Map your own case in the workbook.",`, `      "step": { "join": true },
      "minutes": 40,
      "instruction": "Open the workbook and map your case.",
      "upNext": "When your PDF is exported, press Next.",`);
inScreen('S19B', `      "steps": [
        { "n": 1, "text": "Fill eight fields as the process runs today" },
        { "n": 2, "text": "Keep AI ideas off the map" },
        { "n": 3, "text": "Export your PDF" }
      ],
      "preview": {`, `      "previewFX4": {`);
inScreen('S19B', '"label": "Copy your notes into the workbook",', '"label": "Copy into the workbook",');
inScreen('S19B', '{ "id": "case", "label": "Your case", "from": "S02", "chip": "Field 1 · Process name" },', '{ "id": "case", "from": "S02", "chip": "Field 1" },');
inScreen('S19B', '{ "id": "sketch", "label": "Your sketch from Chapter {ch2}", "from": "S08B", "chip": "Fields 2 and 3" },', '{ "id": "sketch", "from": "S08B", "chip": "Fields 2 and 3" },');
inScreen('S19B', '{ "id": "metric", "label": "Your metric from Chapter {ch3}", "from": "S12B", "chip": "Field 8" },\n          { "id": "notes", "label": "Your notes from Chapter {ch4}", "from": "S17B", "chip": "Not on the map: for Lesson 5", "off": true }',
  '{ "id": "metric", "from": "S12B", "chip": "Field 8" }');
inScreen('S19B', '      "returnLine": "When you export your PDF, come back here and press Next.",\n', '');
all('"openWorkbook": "Next, locked until you open the workbook",', '"openWorkbook": "Next, locked until you open the workbook",\n        "pdf": "Next, locked until you answer Yes once your PDF is exported",');
all('"openWorkbook": "Open the workbook to continue.",', '"openWorkbook": "Open the workbook to continue.",\n        "pdf": "Press Yes once your PDF is exported.",');

/* ---- 7. interface lines ---- */
all('"downloadRecord": "Download my lesson record"', '"downloadRecord": "Download my record (optional)"');
all('"seekAhead": "You can move ahead only to the part you have already watched."', '"seekAhead": "You can move ahead only to the part you have already watched.",\n      "speed": "Playback speed {x} times. Press to change.",\n      "speedChip": "{x}×"');

/* ---- marker ---- */
all('"schemaVersion": "1.0",', '"schemaVersion": "1.0",\n  "$fx4": "FX4 fixes pass (5 Nov 2026): tools/fx4-content.mjs; Dor\'s pilot review and Noy\'s notes.",');

try { JSON.parse(t); } catch (e) { writeFileSync(process.env.TEMP + '/fx4-bad.json', t); throw e; } // still valid JSON
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log(`fx4-content done: ${LINES.length} lines, ${tagged} card tags, ${removed} word allowances removed`);

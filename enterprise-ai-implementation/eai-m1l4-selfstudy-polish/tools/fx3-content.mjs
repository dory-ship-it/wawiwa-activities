// FX3 content edits on content/l4-slice.json (Noy's FX3 work-order, 25 Oct 2026), as text (UTF-8, the
// file's hand format kept): each edit is idempotent, so the script can run again. Usage:
// node tools/fx3-content.mjs [groups], default all, in this order:
//   steps     distinct step verbs and icons within each chapter (S17, S18A no longer "Sort"); Wrap-up
//             gets one step per screen
//   chapters  every chapter number in the text as {chN} (resolved on load to the chapter's place + 1),
//             S21R's review links take their chapter from the screen they open
//   video     V1, V2: the heading without the number of stops; no meta "Video · 2:54 · 2 stops"
//   close     S22 download line, END next line and subtitle (Lesson 5 in class); content version
//   panel     S18 on one panel (onePanel)
//   check     S21 version b of every item (approved text, after the Step 0 review) and its tracking;
//             S21R's short stems for version b
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
const groups = process.argv.slice(2).length ? process.argv.slice(2) : ['steps', 'chapters', 'video', 'close', 'panel', 'check'];

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
const once = (from, to) => { if (!t.includes(to)) { if (!t.includes(from)) throw new Error('not found: ' + from.slice(0, 60)); t = t.replace(from, to); } };
const inScreen = (id, from, to) => editScreen(id, (s) => { if (s.includes(to)) return s; if (!s.includes(from)) throw new Error(`${id}: not found: ${from.slice(0, 60)}`); return s.replace(from, to); });
const step = (id, from, to) => inScreen(id, `"step": ${from}`, `"step": ${to}`);

if (groups.includes('steps')) {
  // Toolkit: Guess, Learn, Sort, Read, Label, Decide, Explore, Spot, Sketch
  if (t.includes('{ "verb": "Read", "icon": "diagram" }')) t = t.replace('{ "verb": "Read", "icon": "diagram" }', '{ "verb": "Read", "icon": "lanes" }');
  step('S05a', '{ "verb": "Learn", "icon": "learn" }', '{ "verb": "Read", "icon": "lanes" }');
  step('S08', '{ "verb": "Decide", "icon": "decide" }', '{ "verb": "Spot", "icon": "eye" }');
  // HR demo: Guess, Watch, Sort, Decide, Measure, Flag, Write
  step('S11', '{ "verb": "Decide", "icon": "decide" }', '{ "verb": "Measure", "icon": "gauge" }');
  step('S12', '{ "verb": "Label", "icon": "label" }', '{ "verb": "Flag", "icon": "flag" }');
  // Critical eye: Guess, Scope, Record, Ask, Learn, Sort, Spot, Write
  step('S13', '{ "verb": "Start", "icon": "start" }', '{ "verb": "Scope", "icon": "start" }');
  step('S14', '{ "verb": "Decide", "icon": "decide" }', '{ "verb": "Record", "icon": "document" }');
  step('S15', '{ "verb": "Decide", "icon": "decide" }', '{ "verb": "Ask", "icon": "decide" }');
  step('S17', '{ "verb": "Sort", "icon": "sort" }', '{ "verb": "Spot", "icon": "eye" }');
  // Build yours: Match, Decide, Write, Map, Review
  step('S18A', '{ "verb": "Sort", "icon": "sort" }', '{ "verb": "Match", "icon": "arrows" }');
  // Wrap-up: Check, Score, Reflect, Finish (one step per screen)
  step('S21R', '{ "verb": "Check", "icon": "check", "join": true }', '{ "verb": "Score", "icon": "gauge" }');
  step('S22', '{ "verb": "Finish", "icon": "start" }', '{ "verb": "Reflect", "icon": "key" }');
  step('END', '{ "verb": "Finish", "icon": "start", "join": true }', '{ "verb": "Finish", "icon": "finish" }');
}

if (groups.includes('chapters')) {
  once('"$comment": "EAI M1 L4 self-study, pilot slice content.', '"$chapterRefs": "FX3: a chapter number in any text is written {chN} (the chapter id) and shown as that chapter\'s place in chapters + 1 (Intro = 1 ... Wrap-up = 7), so no number is typed twice. S21R\'s review links take theirs from the screen they open.",\n  "$comment": "EAI M1 L4 self-study, pilot slice content.');
  // the lesson record (ui.record)
  once('"sketch": "Your sketch from Chapter 2",\n      "metric": "First metric (Chapter 3)",\n      "notes": "Your notes from Chapter 4",',
    '"sketch": "Your sketch from Chapter {ch2}",\n      "metric": "First metric (Chapter {ch3})",\n      "notes": "Your notes from Chapter {ch4}",');
  inScreen('S02', 'Your case comes back in Chapter 5, where', 'Your case comes back in Chapter {ch5}, where');
  inScreen('W1', '"foot": "Chapter 1 · Why map"', '"foot": "Chapter {ch1} · Why map"');
  inScreen('W2', '"foot": "Chapter 2 · Toolkit"', '"foot": "Chapter {ch2} · Toolkit"');
  inScreen('S08B', 'You build the full map in Chapter 5."', 'You build the full map in Chapter {ch5}."');
  inScreen('S08B', '"Saved. Your sketch comes back in Chapter 5."', '"Saved. Your sketch comes back in Chapter {ch5}."');
  inScreen('W3', '"foot": "Chapter 3 · HR demo"', '"foot": "Chapter {ch3} · HR demo"');
  inScreen('S12B', 'You refine it in Chapter 5."', 'You refine it in Chapter {ch5}."');
  inScreen('S12B', '"Saved. It comes back in Chapter 5, ready to refine."', '"Saved. It comes back in Chapter {ch5}, ready to refine."');
  inScreen('W4', '"foot": "Chapter 4 · Critical eye"', '"foot": "Chapter {ch4} · Critical eye"');
  inScreen('S17B', 'Your steps from Chapter 2:"', 'Your steps from Chapter {ch2}:"');
  inScreen('S17B', '"Saved. It comes back in Chapter 5 and Lesson 5."', '"Saved. It comes back in Chapter {ch5} and Lesson 5."');
  inScreen('S19', '"label": "Your sketch from Chapter 2"', '"label": "Your sketch from Chapter {ch2}"');
  inScreen('S19', '"label": "Your metric from Chapter 3"', '"label": "Your metric from Chapter {ch3}"');
  inScreen('S19', '"label": "Your notes from Chapter 4"', '"label": "Your notes from Chapter {ch4}"');
  inScreen('S20B', '"The five mistakes from Chapter 4. Any pick', '"The five mistakes from Chapter {ch4}. Any pick');
  inScreen('S22', 'your AI notes from Chapter 4."', 'your AI notes from Chapter {ch4}."');
  // S21R: the link's chapter comes from the screen it opens (S14, K4 = Critical eye; S11, S10, S12 = HR demo)
  for (const n of [3, 4]) editScreen('S21R', (s) => s.split(`, "chapter": ${n}, "screen": "`).join(', "screen": "'));
}

if (groups.includes('video')) {
  inScreen('V1', '"instruction": "The video stops 2 times to ask you."', '"instruction": "Watch the video. Answer the questions when it stops."');
  inScreen('V2', '"instruction": "The video stops 3 times to ask you."', '"instruction": "Watch the video. Answer the questions when it stops."');
  if (t.includes('      "meta": "Video · {length} · {n} stops",\n')) t = t.replace('      "meta": "Video · {length} · {n} stops",\n', '');
}

if (groups.includes('close')) {
  once('"contentVersion": "slice-0.1 (storyboard v2)",', '"contentVersion": "FX3, 25 Oct 2026 (storyboard v3)",');
  inScreen('S22', 'Your map stays in the workbook PDF."', 'Your map stays in your workbook PDF. Bring it to Lesson 5."');
  inScreen('END', '"sub": "Process Modeling and Workflow Mapping · Module 1",', '"sub": "Process Modeling and Workflow Mapping · Module 1 · Lesson 4",');
  inScreen('END', '"next": "Next: Lesson 6, in your own time.",', '"next": "Next: Lesson 5 in class. Bring your map PDF.",');
}

if (groups.includes('panel')) {
  // S18: one panel for the whole question (situation line, answers, Show me how, attempts, feedback)
  inScreen('S18', '"layout": "stage-decision",\n      "ghost":', '"layout": "stage-decision",\n      "onePanel": true,\n      "ghost":');
}

if (groups.includes('check')) {
  // version b of each item: inserted after the item's version a ("b": { ... } with its own trackingId)
  const B = {
    i1: `"b": { "trackingId": "L4_S21_1b",
            "stem": "Lesson 1 case: student inquiries. Field 4 says 'Coordinator to dean's office.' What is missing?",
            "options": [
              { "id": "a", "label": "A rule that coordinators forward within a day", "correct": false,
                "feedback": "That adds a rule nobody follows today. Record the handoff as it really happens first." },
              { "id": "b", "label": "What passes, and what if nobody is available", "correct": true,
                "feedback": "From and to are there. Without what passes and the unavailable case, an inquiry stalls between offices." },
              { "id": "c", "label": "An AI agent that forwards inquiries", "correct": false,
                "feedback": "That tool does not exist today. The handoff itself stays as vague as before." },
              { "id": "d", "label": "Nothing more: the dean's office knows the history", "correct": false,
                "feedback": "Never assume the receiver knows what happened before. This is the most dangerous moment in the process." }
            ] }`,
    i2: `"b": { "trackingId": "L4_S21_2b",
            "stem": "Lesson 1 case: customer service. Which step suits AI first?",
            "options": [
              { "id": "a", "label": "Approving refunds above a set amount", "correct": false,
                "feedback": "Money is at stake and a wrong call is costly. That decision stays with a person." },
              { "id": "b", "label": "Turning free-text complaints into a topic and urgency", "correct": true,
                "feedback": "Unstructured text in, a structured label out, at low risk. A person still handles the hard cases." },
              { "id": "c", "label": "Handling escalated, angry customers on its own", "correct": false,
                "feedback": "Escalations need empathy and judgment. That is where quality dropped in the fintech case." },
              { "id": "d", "label": "Rerouting requests before routing is mapped", "correct": false,
                "feedback": "A disorganized process gets fixed first. AI on top would only speed up the disorder." }
            ] }`,
    i3: `"b": { "trackingId": "L4_S21_3b",
            "stem": "Lesson 1 case: course feedback. Reading takes 3 to 4 hours per course. Nobody times it. Baseline?",
            "options": [
              { "id": "a", "label": "About 3.5 hours per course, marked as estimated", "correct": true,
                "feedback": "An estimated baseline beats none. You now have a starting number to check the target against." },
              { "id": "b", "label": "Nothing until someone times it", "correct": false,
                "feedback": "Field 8 stays empty. In three months, nobody can show whether anything changed." },
              { "id": "c", "label": "The target, once a tool is chosen", "correct": false,
                "feedback": "That shows where you hope to land, and nothing about where you stand now." },
              { "id": "d", "label": "'Much less reading time' for now", "correct": false,
                "feedback": "That is a feeling, not a number. Nobody could check it later." }
            ] }`,
    i4: `"b": { "trackingId": "L4_S21_4b",
            "stem": "Lesson 1 case: weekly report. Nobody knows who reads it. Where does this go?",
            "options": [
              { "id": "a", "label": "Field 3: add a step to survey readers", "correct": false,
                "feedback": "That adds a step while mapping. The unknown itself stays off the map." },
              { "id": "b", "label": "Field 6: the manager approves each report", "correct": false,
                "feedback": "That records a control nobody reported. Lesson 5 would rely on a check that may not exist." },
              { "id": "c", "label": "Field 8: target more readers", "correct": false,
                "feedback": "A target with no baseline, while the real problem, that nobody knows the readers, stays hidden." },
              { "id": "d", "label": "Field 7: 'unclear', to investigate first", "correct": true,
                "feedback": "A diagnostic result, not a weakness. It shows what to check before Lesson 5." }
            ] }`,
    i5: `"b": { "trackingId": "L4_S21_5b",
            "instruction": "Find the two errors in this AI-drafted map.",
            "hint": "Select two, then press Check. Your first answer counts.",
            "tiles": [
              { "n": 1, "text": "Sales call summaries", "correct": false, "feedback": "This line matches the case. Compare each line with what really happens today." },
              { "n": 2, "text": "A sales call ends", "correct": false, "feedback": "This line matches the case. Compare each line with what really happens today." },
              { "n": 3, "text": "AI drafts the summary; the rep approves it", "correct": true,
                "feedback": "An AI step nobody runs today. The AS-IS map now shows a future tool, and the real step is lost." },
              { "n": 4, "text": "Rep to sales manager, by email", "correct": false, "feedback": "This line matches the case. Compare each line with what really happens today." },
              { "n": 5, "text": "CRM client notes, sales manager, PUBLIC", "correct": true,
                "feedback": "Client notes are not public. Tagged PUBLIC, they could be pasted into any tool. Tag them CONFIDENTIAL." },
              { "n": 6, "text": "No formal control", "correct": false, "feedback": "This line matches the case. Compare each line with what really happens today." },
              { "n": 7, "text": "Unclear whether managers read the summaries", "correct": false, "feedback": "This line matches the case. Compare each line with what really happens today." },
              { "n": 8, "text": "About 2 days now, same day in 3 months", "correct": false, "feedback": "This line matches the case. Compare each line with what really happens today." }
            ] }`,
  };
  // each item ends with "] }" followed by "," (or "\n      ]," for the last); version b goes in before that "}"
  const ends = { i1: '"id": "i2",', i2: '"id": "i3",', i3: '"id": "i4",', i4: '"id": "i5",', i5: '"resultCard":' };
  for (const [item, body] of Object.entries(B)) {
    editScreen('S21', (s) => {
      if (s.includes(`"trackingId": "L4_S21_${item.slice(1)}b"`)) return s;
      const a = s.indexOf(`{ "id": "${item}",`);
      const stop = s.indexOf(ends[item], a);
      const close = s.lastIndexOf('] }', stop);
      if (a < 0 || stop < 0 || close < a) throw new Error('S21: no end of ' + item);
      return s.slice(0, close) + '],\n          ' + body + ' }' + s.slice(close + 3);
    });
  }
  // tracking: one interaction per version (first-attempt rule unchanged: the version's own id)
  inScreen('S21', '{ "id": "L4_S21_5", "type": "choice", "multiple": true, "correctResponse": "5,6", "scored": true, "bloom": "Evaluate", "result": "graded" }',
    `{ "id": "L4_S21_5", "type": "choice", "multiple": true, "correctResponse": "5,6", "scored": true, "bloom": "Evaluate", "result": "graded" },
        { "id": "L4_S21_1b", "version": "b", "type": "choice", "correctResponse": "b", "scored": true, "bloom": "Analyze", "result": "graded" },
        { "id": "L4_S21_2b", "version": "b", "type": "choice", "correctResponse": "b", "scored": true, "bloom": "Apply", "result": "graded" },
        { "id": "L4_S21_3b", "version": "b", "type": "choice", "correctResponse": "a", "scored": true, "bloom": "Apply", "result": "graded" },
        { "id": "L4_S21_4b", "version": "b", "type": "choice", "correctResponse": "d", "scored": true, "bloom": "Analyze", "result": "graded" },
        { "id": "L4_S21_5b", "version": "b", "type": "choice", "multiple": true, "correctResponse": "3,5", "scored": true, "bloom": "Evaluate", "result": "graded" }`);
  inScreen('S21', '"HW2 (fluent but wrong AI output)"]', '"HW2 (fluent but wrong AI output)", "FX3 (25 Oct 2026): version b of every item, approved text; a on the first attempt, b on a retake, alternating"]');
  // item 5b: eight sales-map lines as approved, 53 words with the heading line (45 is the rule)
  inScreen('S21', '"layout": "wide",\n      "items": [', '"layout": "wide",\n      "wordLimit": { "max": 55, "why": "FX3 S21 item 5b (approved text): the eight lines of the AI-drafted sales map, longer than the HR map\'s; the other items stay under 45" },\n      "items": [');
  // S21R: the short stems of version b where the topic differs (a course-feedback baseline, a sales map)
  inScreen('S21R', '"stem": "Report baseline",', '"stem": "Report baseline", "stemB": "Feedback baseline",');
  inScreen('S21R', '"stem": "HR map errors",', '"stem": "HR map errors", "stemB": "Sales map errors",');
}

JSON.parse(t); // still valid JSON
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('fx3-content', groups.join(' '), 'done');

// v2 Chapter 5, round 3 (Noy, 9 Nov 2026, the plan built from the deck's slides):
//   S13 (slide 21) the boundary pair above a line of seven steps, one before and one after the HR process,
//       no numbers; a Start and an End flag
//   S14 (slide 27) no photo: choose the four things the map records at a handoff (the slide's four), multi
//   S15 (slides 28-30) after the right answer, the car company's big number as proof
//   S17 light (dark = learn, light = do)
// Re-runnable: a screen already rewritten is left alone. Usage: node tools/v2-ch5-r3.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
let n = 0;

function range(id) {
  const at = t.indexOf(`\n      "id": "${id}",`);
  if (at < 0) throw new Error('no screen ' + id);
  return [t.lastIndexOf('\n    {', at), t.indexOf('\n    }', at)];
}
const block = (id) => { const [s, e] = range(id); return t.slice(s, e); };
function replaceBlock(id, text) { const [s, e] = range(id); t = t.slice(0, s) + text + t.slice(e); n++; }
function edit(id, from, to) {
  const [s, e] = range(id);
  const b = t.slice(s, e);
  if (b.includes(to) && !b.includes(from)) return;
  if (!b.includes(from)) { console.warn('  skip ' + id + ': ' + from.slice(0, 60)); return; }
  t = t.slice(0, s) + b.replace(from, to) + t.slice(e);
  n++;
}

/* ---- S13: from the lead to the tracking ---- */
if (!block('S13').includes('"n": 7')) {
  const b = block('S13');
  const from = b.indexOf('\n      "lead":');
  const to = b.indexOf('\n      "advance":');
  const mid = `
      "photo": { "src": "assets/img/l4/v2/ch5-opener-map-review.jpg", "position": "60% 40%", "temp": false },
      "ground": { "kind": "blur" },
      "hint": "Look for what starts it from outside, and who picks up the result.",
      "layout": "flags",
      "dragHelp": "helpSteps",
      "dropLabel": "Drop here",
      "line": [
        { "n": 1, "text": "Employee checks the HR portal", "icon": "explore" },
        { "n": 2, "text": "Employee sends a question", "icon": "speech" },
        { "n": 3, "text": "HR staff open the inbox", "icon": "folder" },
        { "n": 4, "text": "HR staff check the topic", "icon": "tag" },
        { "n": 5, "text": "Question reaches the HR manager", "icon": "person" },
        { "n": 6, "text": "Employee gets an answer", "icon": "check-circle" },
        { "n": 7, "text": "Employee submits a leave request", "icon": "calendar" }
      ],
      "flags": [
        {
          "id": "start",
          "code": "s",
          "text": "Start",
          "target": "2",
          "feedback": {
            "1": "Looking it up is the employee's own step: nothing has reached HR yet.",
            "3": "WhatsApp and in-person questions never reach the inbox. The process starts earlier, outside HR.",
            "other": "Start where work enters from outside; end where someone picks up the result."
          }
        },
        {
          "id": "end",
          "code": "e",
          "text": "End",
          "target": "6",
          "feedback": {
            "4": "Nobody receives anything when the topic is checked. Follow the question to its result.",
            "5": "Escalation passes the work on. The employee is still waiting for an answer.",
            "7": "A leave request starts a new process with its own trigger. This one ended earlier.",
            "other": "Start where work enters from outside; end where someone picks up the result."
          }
        }
      ],
      "feedbackCorrect": "Clear boundaries: from the trigger outside HR to the employee's answer. Without them, the map swells.",`;
  const nb = b.slice(0, from) + mid + b.slice(to).replace('"correctResponse": "s.1,e.5"', '"correctResponse": "s.2,e.6"');
  replaceBlock('S13', nb);
}
// (Noy: the pair above the task "looks unrelated there": the idea moves into the closing feedback)
{
  const b = block('S13');
  const p0 = b.indexOf('\n      "pair": [');
  if (p0 >= 0) replaceBlock('S13', b.slice(0, p0) + b.slice(b.indexOf('\n      ],', p0) + '\n      ],'.length));
}
edit('S13', '"feedbackCorrect": "The map opens at the trigger from outside and closes when the employee gets an answer.",',
  '"feedbackCorrect": "Clear boundaries: from the trigger outside HR to the employee\'s answer. Without them, the map swells.",');
edit('S13', '"instructionEnd": "Now click the step where it ends.",',
  '"instructionEnd": "Now click the step where it ends.",\n      "lead": "A process starts with a trigger from outside, and ends when someone receives the result.",');
edit('S13', '"sources": ["planning/STORYBOARD-V3.md Ch4 S13", "s21", "s10", "HR canon Fields 2, 3"]',
  '"sources": ["planning/STORYBOARD-V3.md Ch4 S13", "s21", "s10", "HR canon Fields 2, 3", "v2: the steps before and after the HR process are illustrations of s21 (a process without boundaries swells), not case facts"]');

/* ---- S14: the handoff record, four of six ---- */
if (!block('S14').includes('"variant": "multi"')) {
  replaceBlock('S14', `
    {
      "id": "S14",
      "goal": "g1",
      "coach": { "kind": "practice", "tip": "Picture the manager away for a week. What would the next person need to know?", "tipDrafted": true },
      "chapter": "ch4",
      "template": "decision",
      "variant": "multi",
      "select": 4,
      "step": { "verb": "Record", "icon": "document" },
      "minutes": 3,
      "instruction": "Choose the four things the map must record at this handoff.",
      "terms": ["handoff"],
      "hint": "Think about the moment responsibility changes hands.",
      "ground": { "kind": "dots" },
      "stage": {
        "top": { "kind": "line", "text": "A question goes beyond policy, so HR staff pass it to the HR manager, who is away this week." },
        "bottom": { "kind": "options", "action": "check" }
      },
      "options": [
        { "id": "a", "label": "From whom: HR staff", "correct": true, "feedback": "Who hands the question over." },
        { "id": "b", "label": "To whom: the HR manager", "correct": true, "feedback": "Who takes responsibility next." },
        { "id": "c", "label": "What passes: the question and its history", "correct": true, "feedback": "What travels with the question." },
        { "id": "d", "label": "What happens while the manager is away", "correct": true, "feedback": "The unavailable case, often the gap." },
        { "id": "e", "label": "A rule naming a backup manager", "correct": false, "feedback": "A rule nobody follows today hides the real gap. Record the handoff as it runs now." },
        { "id": "f", "label": "An AI agent to reroute questions", "correct": false, "feedback": "That tool does not exist today. Describe the handoff as it runs now." }
      ],
      "feedbackCorrect": "A good map marks every handoff: from whom, to whom, what passes, and what if the receiver is away.",
      "advance": "after-correct",
      "tracking": [
        { "id": "L4_S14_1", "type": "choice", "multiple": true, "correctResponse": "a,b,c,d", "scored": false, "bloom": "Analyze", "result": "graded" }
      ],
      "sources": ["s27", "s17 field 4", "s19 field 7", "HR canon Fields 4, 7", "'Away' is constructed"],
      "variants": {
        "support": {
          "hint": "A good map marks each handoff: from whom, to whom, what passes, if unavailable.",
          "sources": ["s17", "s20", "s27"]
        },
        "stretch": {
          "pilotCopy": "the handoff (service agent to the disputes team, contact away) is constructed from the fintech case",
          "coach": { "kind": "practice", "tip": "Picture the contact away for a week. What would the next person need to know?", "tipDrafted": true },
          "hint": "Ask: if this dispute stalls, could the map show you why?",
          "stage": {
            "top": { "kind": "line", "text": "A customer disputes a charge. The agent sends it to the disputes team, whose contact is away." },
            "bottom": { "kind": "options", "action": "check" }
          },
          "options": [
            { "id": "a", "label": "From whom: the service agent", "correct": true, "feedback": "Who hands the dispute over." },
            { "id": "b", "label": "To whom: the disputes team", "correct": true, "feedback": "Who takes responsibility next." },
            { "id": "c", "label": "What passes: the dispute and the chat", "correct": true, "feedback": "What travels with the dispute." },
            { "id": "d", "label": "What happens while the contact is away", "correct": true, "feedback": "The unavailable case, often the gap." },
            { "id": "e", "label": "The playbook's backup rule", "correct": false, "feedback": "The playbook shows how it should run. If today differs, the map hides the real gap." },
            { "id": "f", "label": "An AI agent to reroute disputes", "correct": false, "feedback": "That tool does not run today. Map the handoff as it works now." }
          ],
          "sources": ["s25", "s26", "s27", "s34"]
        }
      }`);
}

/* ---- S15: the proof after the right answer ---- */
edit('S15', '"ground": { "kind": "half", "side": "right" },',
  '"ground": { "kind": "half", "side": "right" },\n      "proof": { "eyebrow": "The car company, per reports", "figure": "-75%", "text": "headcount, once mapping removed the manual matching step" },');

/* ---- S17: light (dark = learn, light = do) ---- */
edit('S17', '"ground": { "kind": "split" },', '"ground": { "kind": "blur" },');
edit('S17', '"photo": { "src": "assets/img/l4/v2/ch5-s14-empty-desk.jpg", "position": "38% 50%", "temp": false },', '"photo": { "src": "assets/img/l4/v2/ch5-opener-map-review.jpg", "position": "60% 40%", "temp": false },');

const out = JSON.parse(t);
const s13 = out.screens.find((s) => s.id === 'S13');
if (s13.line.length !== 7 || s13.flags[0].target !== '2') throw new Error('S13 not rebuilt');
if (out.screens.find((s) => s.id === 'S14').variant !== 'multi') throw new Error('S14 not rebuilt');
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('v2-ch5-r3: ' + n + ' edits');

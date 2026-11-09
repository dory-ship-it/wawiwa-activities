// FX8 content (Noy, 8 Nov 2026: the lesson back to her Artifacts boards; Chapters 4 to 7 as in
// planning/fx8-board): the S12 and S13 wording for clicking, the flag count, and the icons the board
// gives K4's items, S16's columns and the five mapping mistakes (S17, S20B). Re-runnable: each edit is
// made only when its text is still the old one. Tracking ids, answers and feedback are not touched.
// Usage: node tools/fx8-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');
let n = 0;
const edit = (from, to) => { if (t.includes(to)) return; if (!t.includes(from)) throw new Error('not found: ' + from.slice(0, 80)); t = t.replace(from, to); n++; };

// the flag count on S12 (src/templates/flags.js)
edit('"marks": { "yours": "Your answer", "right": "Right answer" },', '"marks": { "yours": "Your answer", "right": "Right answer" },\n    "flagCount": "{x} of {n} flags",');

// S12 (Noy: "Risk flag: unclear what to do there"): a plain question, and what to click, how many
edit('"instruction": "Click the two fields that show the handoff risk.",',
  '"instruction": "Where could the question get lost?",\n      "lead": "Click the two fields that show the handoff and its risk. Each click places a flag.",');
// S13: start first, then the heading moves on to the end
edit('"instruction": "Click where the HR process starts, then where it ends.",',
  '"instruction": "Click where the HR process starts.",\n      "instructionEnd": "Now click where it ends.",\n      "lead": "Look for what starts it from outside, and who picks up the result.",');

// K4: an icon per kind (good fit teal, poor fit grey)
edit('{ "term": "Unstructured to structured", "text": "text in, data out" }', '{ "term": "Unstructured to structured", "text": "text in, data out", "icon": "arrows" }');
edit('{ "term": "Low-risk decision points", "text": "reversible, watched" }', '{ "term": "Low-risk decision points", "text": "reversible, watched", "icon": "lightning" }');
edit('{ "term": "Handoffs with delay or loss", "text": "AI records what passes" }', '{ "term": "Handoffs with delay or loss", "text": "AI records what passes", "icon": "route" }');
edit('"items": [{ "term": "Money or rights at stake" }, { "term": "A disorganized process" }, { "term": "Map says \\"unclear\\"" }]',
  '"items": [{ "term": "Money or rights at stake", "icon": "shield" }, { "term": "A disorganized process", "icon": "gear-broken" }, { "term": "Map says \\"unclear\\"", "icon": "help-circle" }]');

// S16: the same icons on the columns
edit('{ "id": "a", "label": "Unstructured to structured" },', '{ "id": "a", "label": "Unstructured to structured", "icon": "arrows", "kind": "good" },');
edit('{ "id": "b", "label": "Low-risk decision" },', '{ "id": "b", "label": "Low-risk decision", "icon": "lightning", "kind": "good" },');
edit('{ "id": "c", "label": "Handoff delay or loss" },', '{ "id": "c", "label": "Handoff delay or loss", "icon": "route", "kind": "good" },');
edit('{ "id": "d", "label": "Poor fit", "width": 1.8 }', '{ "id": "d", "label": "Poor fit", "width": 1.8, "icon": "x", "kind": "poor" }');

// S19C on Stage: the chapter photo turned so the person faces the panel
edit('"id": "S19C",', '"id": "S19C",\n      "photo": { "src": "assets/img/l4/md1/ch6-build-yours.jpg", "position": "35% 50%", "mirror": true, "temp": false },');

// S13: an icon per step on the process line (the board)
for (const [n, text, icon] of [[1, 'Employee sends a question', 'speech'], [2, 'HR staff open the inbox', 'folder'], [3, 'HR staff check the topic', 'tag'], [4, 'Question reaches the HR manager', 'person'], [5, 'Employee gets an answer', 'check-circle']]) {
  edit(`{ "n": ${n}, "text": "${text}" }`, `{ "n": ${n}, "text": "${text}", "icon": "${icon}" }`);
}

// the five mapping mistakes: one icon each, the same on S17 and S20B
const MISTAKES = [['Ideal, not actual', 'eye'], ['No clear goal', 'target'], ['Rushed mapping', 'clock'], ['Not updated', 'history'], ['Automating a broken process', 'gear-broken']];
for (const [label, icon] of MISTAKES) {
  const re = new RegExp(`"label": "${label}", "sub"`, 'g');
  t = t.replace(re, () => { n++; return `"label": "${label}", "icon": "${icon}", "sub"`; });
}

if (!t.includes('"$fx8"')) { t = t.replace('"schemaVersion": "1.0",', '"schemaVersion": "1.0",\n  "$fx8": "FX8 (8 Nov 2026): back to Noy\'s boards (L4 Screens Intro to Ch2, planning/fx8-board); tools/fx8-content.mjs: S12/S13 click wording, flag count, icons on K4, S16, S17, S20B.",'); n++; }
const out = JSON.parse(t);
if (out.ui.flagCount !== '{x} of {n} flags') throw new Error('flagCount not set');
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('fx8-content: ' + n + ' edits');

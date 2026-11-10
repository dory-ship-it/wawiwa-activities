// PP1: review/pp1/VARIANTS.md for Noy's content review, built from content/l4-slice.json (so it always
// matches what the screens show): one table per adaptive screen, Support | Core | Stretch side by side.
// Usage: node tools/pp1-variants-md.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';
import { variantOf } from '../src/adapt.js';
import { screenViews, words } from '../src/review/words.js';

const C = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const LEVELS = ['support', 'core', 'stretch'];
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const br = (list) => list.filter((x) => x !== null && x !== undefined && x !== '').map(esc).join('<br>');
const goals = Object.fromEntries(C.screens.find((s) => s.id === 'O3').goals.map((g) => [g.id, g.label]));
const ok = '✔';

// the case or stem a screen shows above its answers
function stem(x) {
  const out = [];
  if (x.context) out.push(x.context);
  if (x.situation) out.push(x.situation.text);
  if (x.fieldRows) out.push(...x.fieldRows.map((f) => `${f.label} ${f.value ?? '[slot]'}`));
  if (x.stage?.top) out.push([x.stage.top.eyebrow ? `*${x.stage.top.eyebrow}*` : '', x.stage.top.text].filter(Boolean).join(' '));
  if (x.visual) out.push(`Visual: ${x.visual.from} → ${x.visual.to} (${x.visual.away})`);
  if (x.band) out.push(`Band: ${x.band.items ? x.band.label + ' ' + x.band.items.map((i) => (typeof i === 'object' ? `${i.term}: ${i.text}` : i)).join('; ') : `${x.band.term}: ${x.band.text}`}`);
  else if (x.variant === 'metric') out.push('Band: none');
  if (x.header) out.push(`Header: ${x.header}`);
  return out;
}
// the answers, each with its feedback
function answers(x) {
  if (x.variant === 'cases') {
    const name = Object.fromEntries(x.options.map((o) => [o.id, o.label]));
    return x.cards.map((c) => `**${c.id}.** ${esc(c.text)} → **${esc(name[c.column])}**<br>${ok} ${esc(c.feedback.correct)}<br>✘ ${esc(c.feedback.wrong)}`);
  }
  if (x.template === 'sortDeck') {
    const name = Object.fromEntries(x.columns.map((c) => [c.id, c.label]));
    return x.cards.map((c) => `**${c.n}.** ${esc(c.text)} → **${esc(name[c.column])}**<br>${ok} ${esc(c.feedback.correct)}<br>✘ ${esc(c.feedback.wrong)}`);
  }
  if (x.template === 'flags') return x.map.map((f) => `**${f.n}. ${esc(f.title)}**${f.correct ? ` ${ok} flag` : ''}: ${esc(f.text)}<br>${esc(f.feedback)}`);
  const L = (i) => String.fromCharCode(97 + i);
  return x.options.map((o, i) => `**${L(i)}.** ${esc(o.label)}${o.correct ? ` **${ok} correct**` : ''}${o.checks ? ` (B ${o.checks.baseline ? 'y' : 'n'} / T ${o.checks.target ? 'y' : 'n'} / D ${o.checks.date ? 'y' : 'n'})` : ''}<br>${esc(o.feedback)}`);
}

const lines = [
  '# PP1 variants: Support | Core | Stretch',
  '',
  `Built from content/l4-slice.json by tools/pp1-variants-md.mjs (${new Date().toISOString().slice(0, 10)}). Core = the screen as it was, untouched. ${ok} = the correct answer; ✘ = the line a wrong placement shows. Words = the screen's fullest view, counted as the check counts (instruction and buttons excluded). The instruction line is the same on all three levels.`,
  '',
  'Same for every level: the template, layout, instruction, number of answers / cards / fields, the tracking id and Bloom level. S21 and S21R are not touched.',
  '',
];
for (const s of C.screens.filter((x) => x.variants)) {
  const v = Object.fromEntries(LEVELS.map((lv) => [lv, variantOf(s, lv)]));
  const raw = { support: s.variants.support, core: s, stretch: s.variants.stretch };
  const n = (x) => Math.max(...screenViews(x, C).map(([, l]) => l.reduce((a, t) => a + words(t), 0)));
  lines.push(`## ${s.id}: ${s.instruction}`, '', `Goal ${s.goal} (${goals[s.goal]}) · ${s.template}${s.variant ? ' / ' + s.variant : ''} · Bloom ${s.tracking[0].bloom}`, '');
  lines.push('| | Support | Core | Stretch |', '|---|---|---|---|');
  const row = (label, fn) => lines.push(`| ${label} | ${LEVELS.map((lv) => fn(v[lv], lv) || '').join(' | ')} |`);
  // a line the core shows too is written once, in the core column
  const coreStem = stem(v.core);
  row('Case / stem', (x, lv) => { if (lv === 'core') return br(coreStem); const own = stem(x).filter((l) => !coreStem.includes(l)); return own.length ? br(own) + (own.length < stem(x).length ? '<br>*(rest as core)*' : '') : '*as core*'; });
  row('Hint', (x) => esc(x.hint));
  const list = Object.fromEntries(LEVELS.map((lv) => [lv, answers(v[lv])]));
  const label = s.variant === 'cases' ? 'Case' : s.template === 'sortDeck' ? 'Card' : s.template === 'flags' ? 'Field' : 'Option';
  for (let i = 0; i < list.core.length; i++) row(`${label} ${i + 1}`, (x, lv) => list[lv][i]);
  if (s.feedbackCorrect) row('Both right', (x) => esc(x.feedbackCorrect));
  if (raw.support.coach || raw.stretch.coach) row('Coach tip', (x) => esc(x.coach?.tip));
  row('Sources', (x) => esc((x.sources || []).join(', ')));
  row('pilotCopy', (x, lv) => (lv === 'core' ? '' : raw[lv].pilotCopy ? esc(raw[lv].pilotCopy) : 'no'));
  row('Words on screen', (x) => `${n(x)}${x.wordLimit ? ` (allowance ${x.wordLimit.max})` : ' (max 45)'}`);
  lines.push('');
}
mkdirSync(join(ROOT, 'review', 'pp1'), { recursive: true });
writeFileSync(join(ROOT, 'review', 'pp1', 'VARIANTS.md'), lines.join('\n') + '\n', 'utf8');
console.log('review/pp1/VARIANTS.md written');

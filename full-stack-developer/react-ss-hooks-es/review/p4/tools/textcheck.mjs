// P4: word counts per screen and "no text outside the strings files".
//   node textcheck.mjs <path to react-ss-hooks-es>
// 1. Word counts: every learner-facing field of every screen, counted as build.mjs counts
//    (backticks and asterisks removed, split on spaces), against STORYBOARD 4.1:
//    instruction/question <= 35, one feedback box <= 30, steps <= 4 items of <= 20.
// 2. Text source: every visible text run and every aria-label/alt/title/placeholder in the generated
//    index.html / index.en.html must be found in that page's strings or the shared strings.
//    Also lists any string literal with letters in practice.js that ends up on screen.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
const L = process.argv[2];
const PAGES = ['p1-usestate', 'p2-useeffect', 'p3-limpieza', 'p4-useref', 'p5-hooks-propios', 'checkin'];
const words = (s) => String(s).replace(/[`*]/g, '').trim().split(/\s+/).filter(Boolean).length;
const load = (f, key) => { const sb = { window: {} }; vm.runInNewContext(readFileSync(f, 'utf8'), sb); return sb.window[key]; };
const flat = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (o && typeof o === 'object') Object.values(o).forEach((v) => flat(v, out)); return out; };
const norm = (s) => s.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
let bad = 0;
for (const lang of ['es', 'en']) {
  const S = load(join(L, 'shared', `strings.${lang}.js`), 'RH_SHARED');
  for (const p of PAGES) {
    const P = load(join(L, p, `strings.${lang}.js`), 'RH_PAGE');
    // 1. word counts
    const rows = [];
    let total = 0;
    const count = (what, t, max) => { if (!t) return; const n = words(t); total += n; rows.push({ what, n, max }); };
    count('name', P.name, 99); count('lead', P.lead, 99);
    P.screens.forEach((s, i) => {
      const id = `${i + 1} ${s.type}`;
      count(id + ' question', s.question || s.title, 35);
      if (s.steps) { if (s.steps.length > 4) rows.push({ what: id + ' steps count', n: s.steps.length, max: 4 }); s.steps.forEach((t) => count(id + ' step', t, 20)); }
      (s.options || []).forEach((o) => { count(id + ' option', o.text, 99); count(id + ' feedback', o.why, 30); });
      ['why', 'ok', 'none', 'other', 'note', 'after'].forEach((k) => count(id + ' ' + k, s[k], 30));
      (s.hints || []).forEach((h) => count(id + ' hint', h.text, 30));
      (s.missing || []).forEach((h) => count(id + ' hint', h.text, 30));
      (s.points || []).forEach((t) => count(id + ' point', t, 30));
      if (s.back) count(id + ' back', s.back, 30);
    });
    const over = rows.filter((r) => r.n > r.max);
    const mx = (re) => Math.max(0, ...rows.filter((r) => re.test(r.what)).map((r) => r.n));
    console.log(`${lang} ${p.padEnd(17)} screens ${String(P.screens.length).padStart(2)}  words on the page ${String(total).padStart(4)}  longest question ${mx(/question/)} (35)  longest feedback ${mx(/feedback|why|ok|none|other|note|after|hint|back|point/)} (30)  longest step ${mx(/ step$/)} (20)  over the limit ${over.length}`);
    over.forEach((r) => { bad++; console.log('   OVER ' + r.what + ' ' + r.n + '/' + r.max); });
    // 2. text source
    const known = flat(P).concat(flat(S)).map(norm);
    const hay = known.join('\n');
    const html = readFileSync(join(L, p, lang === 'es' ? 'index.html' : `index.${lang}.html`), 'utf8');
    const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
    const runs = [];
    // code lines are data in the strings; take text outside <ol class=...code> blocks
    const noCode = body.replace(/<ol[^>]*>[\s\S]*?<\/ol>/g, ' ');
    noCode.replace(/>([^<]+)</g, (m, t) => { t = decode(t).replace(/\s+/g, ' ').trim(); if (/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(t)) runs.push(t); });
    noCode.replace(/\s(?:aria-label|alt|title|placeholder)="([^"]*)"/g, (m, t) => { t = decode(t).trim(); if (/[A-Za-z]/.test(t)) runs.push(t); });
    const tl = html.match(/<title>([^<]*)<\/title>/); if (tl) runs.push(decode(tl[1]));
    // A run the build composes from several strings ("Paso" + 1 + "·" + "Predice") counts as from the
    // strings when each of its words is in the strings; the build adds only digits and punctuation.
    const vocab = new Set(hay.split(/[^A-Za-zÁÉÍÓÚÜáéíóúüñÑ]+/).filter(Boolean));
    const uniq = [...new Set(runs)];
    const composed = uniq.filter((t) => !hay.includes(norm(t)) && t.split(/[^A-Za-zÁÉÍÓÚÜáéíóúüñÑ]+/).filter(Boolean).every((w) => vocab.has(w)));
    const missing = uniq.filter((t) => !hay.includes(norm(t)) && !composed.includes(t));
    console.log(`   text runs in the page ${runs.length}, composed from several strings ${composed.length} (${composed.map((t) => JSON.stringify(t)).join(', ')}), not from the strings ${missing.length}`);
    missing.forEach((t) => { bad++; console.log('   NOT IN STRINGS: ' + JSON.stringify(t)); });
  }
}
// practice.js: string literals with letters (besides selectors, attribute names, CSS)
const js = readFileSync(join(L, 'shared', 'practice.js'), 'utf8');
const lits = [...js.matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2]).filter((s) => /[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/.test(s) && !/[.#\[:]/.test(s));
console.log(`practice.js string literals that look like words: ${lits.length ? lits.map((s) => JSON.stringify(s)).join(', ') : 'none'}`);
console.log(`\n${bad} problems`);

// Personal path (PP1): silent adaptive practice inside the lesson. Two checkpoints set a level for a
// chapter from the first answers the learner already gave (state.a); the level picks the variant of each
// adaptive screen in that chapter (screen.variants.support / .stretch merged over the screen; core = the
// screen as it is). Same goal, template and layout on every level. The level is never shown to the
// learner: no text, label, badge, colour or record line names it. Once set it is frozen (state.p
// { c4, c5 }), so Back, the menu, resume and S21R's review links show the same variant.
// The checkpoints come from content (lesson.adapt.checkpoints, in order): the chapter they open, the
// interaction ids they count, how many must be answered, and the neutral interaction that records them.
//   c4 (entering the HR demo chapter): 9 items; 8-9 first-attempt correct = stretch, 5-7 core, 0-4 support
//   c5 (entering Critical eye): 4 items; stretch stays stretch with 3-4, support stays support with 0-1,
//      anything else core; core stays core
//   missing data: fewer than minAnswered answered = core; otherwise an unanswered item counts as not
//   correct. Retries never count (only the first answer is kept in state.a).
// Journeys (the five paths): 1 stretch>stretch, 2 stretch>core, 3 core>core, 4 support>core,
// 5 support>support. Pure functions: no DOM, so tools/test-adapt.mjs runs them in Node.
export const LEVELS = ['support', 'core', 'stretch'];
export const JOURNEYS = { 1: ['stretch', 'stretch'], 2: ['stretch', 'core'], 3: ['core', 'core'], 4: ['support', 'core'], 5: ['support', 'support'] };

// first: (trackingId) => { result } | null (the engine's firstAnswer)
export function tally(items, first) {
  const res = items.map((id) => first(id)?.result).filter(Boolean);
  return { answered: res.length, correct: res.filter((r) => r === 'correct').length };
}

// the level a checkpoint sets; prev = the level of the checkpoint before (none for the first)
export function levelAt(cp, { answered, correct }, prev = null) {
  if (answered < cp.minAnswered) return 'core';
  const n = cp.items.length;
  if (!prev) return correct >= n - 1 ? 'stretch' : correct >= n - 4 ? 'core' : 'support'; // 9 items: 8-9, 5-7, 0-4
  if (prev === 'stretch') return correct >= n - 1 ? 'stretch' : 'core';                    // 4 items: 3-4
  if (prev === 'support') return correct <= 1 ? 'support' : 'core';                          // 0-1
  return 'core';
}

// { c4, c5 } -> journey 1..5 (null while a level is missing)
export function journeyOf(p = {}) {
  const hit = Object.entries(JOURNEYS).find(([, [a, b]]) => p.c4 === a && p.c5 === b);
  return hit ? Number(hit[0]) : null;
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
// a variant over its screen: objects merge key by key (stage.top.text), arrays and values replace
export function merge(base, over) {
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? merge(base[k], v) : v;
  return out;
}

// the screen as a learner on this level sees it (core, or a screen without variants: itself)
export function variantOf(screen, level) {
  const v = screen.variants?.[level];
  if (!v) return screen;
  const { variants, ...base } = screen;
  return merge(base, v);
}

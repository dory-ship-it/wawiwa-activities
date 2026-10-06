// Learner name: kept only in this browser (localStorage), never sent anywhere.
// Every access is wrapped in try/catch: private windows and blocked storage must not break the page.
const KEY = 'wawiwa.gfm.s1.learnerName';

export const nameStore = {
  get() { try { return (localStorage.getItem(KEY) || '').trim(); } catch { return ''; } },
  set(value) {
    const v = (value || '').trim().slice(0, 40);
    try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* storage unavailable: ignore */ }
    return v;
  },
};

// "What can you do towards the next session, {name}?"  →  "..., Dana?"  or, with no name, "...?"
export function withName(text, name) {
  if (!text || !text.includes('{name}')) return text;
  if (!name) return text.replace(/,\s*\{name\}/g, '').replace(/\{name\}/g, '').replace(/\s+([?!.,])/g, '$1').replace(/\s{2,}/g, ' ');
  return text.replace(/\{name\}/g, name);
}

// The same for a paragraph split into styled runs, e.g. ["…next session, ", "{name}", "?"]: with no
// name the comma and space before the placeholder go too, even when they sit in the run before it,
// so screen 33 reads "…next session?" and never "…next session, ?" (P5.1 fix 3). Run boundaries are
// kept with a marker so each run keeps its own style.
const RUN = '\u0001';
export function withNameRuns(runs, name) {
  if (!runs.some(r => (r.t || '').includes('{name}'))) return runs;
  if (name) return runs.map(r => ({ ...r, t: (r.t || '').replace(/\{name\}/g, name) }));
  let s = runs.map(r => r.t || '').join(RUN);
  s = s.replace(/,\s*(\u0001*)\{name\}/g, '$1').replace(/\{name\}/g, '')
    .replace(/\s+(\u0001*)([?!.,])/g, '$1$2').replace(/ +(\u0001*) +/g, ' $1');
  const parts = s.split(RUN);
  return runs.map((r, i) => ({ ...r, t: parts[i] }));
}

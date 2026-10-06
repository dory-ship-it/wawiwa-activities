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

// Lesson state. P0 STUB: keeps place and done screens in localStorage only, in the PRD's
// compact shape ({ v, s, d, a }). P4 replaces this with the full codec and the SCORM
// suspend_data path (store.js pattern from genai-for-marketing/s1-ai-awareness: every storage
// access in try/catch, so private windows and blocked storage never break the page).
const KEY = 'wawiwa.eai.l4.slice';

export function emptyState() {
  return { v: 1, s: null, d: [], a: {} };
}

// Returns { state, ok }: ok is false when storage could not be read.
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: emptyState(), ok: true };
    const s = JSON.parse(raw);
    if (!s || s.v !== 1 || !Array.isArray(s.d)) return { state: emptyState(), ok: true };
    return { state: { ...emptyState(), ...s }, ok: true };
  } catch {
    return { state: emptyState(), ok: false };
  }
}

// Returns true when written.
export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; }
}

export function clearState() {
  try { localStorage.removeItem(KEY); return true; } catch { return false; }
}

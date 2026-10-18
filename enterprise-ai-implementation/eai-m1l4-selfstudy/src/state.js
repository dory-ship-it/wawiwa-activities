// Lesson state. P0/P1 STUB: keeps the state in localStorage only, in the PRD's compact shape:
//   s place, d done screens, a first answers by interaction id ("b|c", "b,d|w", "|n"),
//   r fast-track route by card id ({ FT1: 'skip', FT2: 'full' }), f stored free text by store key,
//   x retry counts.
// P4 replaces this with the full codec and the SCORM
// suspend_data path (store.js pattern from genai-for-marketing/s1-ai-awareness: every storage
// access in try/catch, so private windows and blocked storage never break the page).
const KEY = 'wawiwa.eai.l4.slice';

export function emptyState() {
  return { v: 1, s: null, d: [], a: {}, r: {}, f: {}, x: {} };
}

// Returns { state, ok }: ok is false when storage could not be read.
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: emptyState(), ok: true };
    const s = JSON.parse(raw);
    if (!s || s.v !== 1 || !Array.isArray(s.d)) return { state: emptyState(), ok: true };
    const state = { ...emptyState(), ...s };
    if (!state.r || typeof state.r !== 'object') state.r = {}; // P1 kept one route string
    return { state, ok: true };
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

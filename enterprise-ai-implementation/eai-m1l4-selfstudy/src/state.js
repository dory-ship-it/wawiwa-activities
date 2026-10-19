// Lesson state and its compact codec (PRD section 7), one object in short keys:
//   s place, d done screens, a first answers by interaction id ("b|c", "b,d|w", "|n"),
//   r fast-track route by card id ({ FT1: 'skip' }), f stored free text by store key, x retry counts,
//   g small per-screen flags (handoff opened / back, checkbox, chosen chip, ...), fin finish status,
//   h ghost-hand interaction types already shown (one letter each: t tabs, v video stop, s pick two).
// Local mode keeps it in localStorage; SCORM 1.2 mode keeps it in cmi.suspend_data (encode / decode).
// Every storage access sits in try/catch (store.js pattern from genai-for-marketing/s1-ai-awareness),
// so private windows and blocked storage never break the page.
const KEY = 'wawiwa.eai.l4.slice';
export const SUSPEND_MAX = 4096;   // SCORM 1.2 cmi.suspend_data limit
const SUSPEND_DROP_AT = 3800;      // over this, the retry counts (x) go first
const ID_PREFIX = 'L4_';           // interaction ids lose the shared prefix inside suspend data

export function emptyState() {
  return { v: 1, s: null, d: [], a: {}, r: {}, f: {}, x: {}, g: {}, h: '', fin: null };
}

// fill the gaps of a parsed state (older shapes, missing keys); null when it is not ours
function normalize(s) {
  if (!s || s.v !== 1 || !Array.isArray(s.d)) return null;
  const state = { ...emptyState(), ...s };
  for (const k of ['a', 'f', 'x', 'g']) if (!state[k] || typeof state[k] !== 'object') state[k] = {};
  if (!state.r || typeof state.r !== 'object') state.r = {}; // P1 kept one route string
  if (typeof state.h !== 'string') state.h = '';
  return state;
}

// state -> suspend_data string under 4096 chars (drops x first when long, empty keys left out)
export function encode(state) {
  const short = (obj) => Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [k.startsWith(ID_PREFIX) ? k.slice(ID_PREFIX.length) : k, v]));
  const out = { v: 1, s: state.s, d: state.d, a: short(state.a), r: state.r, f: state.f, x: short(state.x), g: state.g };
  if (state.fin) out.fin = state.fin;
  if (state.h) out.h = state.h;
  for (const k of ['r', 'f', 'x', 'g']) if (!Object.keys(out[k] || {}).length) delete out[k];
  let str = JSON.stringify(out);
  if (str.length > SUSPEND_DROP_AT) { delete out.x; str = JSON.stringify(out); }
  if (str.length >= SUSPEND_MAX) throw new Error('suspend_data_over_limit ' + str.length);
  return str;
}

// suspend_data string -> state; anything missing or corrupt gives a fresh start, never a crash
export function decode(str) {
  try {
    const s = JSON.parse(str);
    const long = (obj) => Object.fromEntries(Object.entries(obj || {}).map(([k, v]) => [ID_PREFIX + k, v]));
    return normalize({ ...s, a: long(s.a), x: long(s.x) }) || emptyState();
  } catch {
    return emptyState();
  }
}

// Returns { state, ok }: ok is false when storage could not be read.
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: emptyState(), ok: true };
    return { state: normalize(JSON.parse(raw)) || emptyState(), ok: true };
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

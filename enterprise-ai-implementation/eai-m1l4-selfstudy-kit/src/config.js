// The lesson's own settings, from kit.json at the lesson's root (the only lesson-specific values the kit's
// code reads): where the content is, the storage keys, the interaction id prefix, the live coach page, the
// lesson's own templates. The engine and the review page load it first (loadConfig); every other module
// reads it at call time through cfg(), never at import time. Kept on globalThis, so one module loaded under two
// URLs (a stamped and an unstamped import in node tools) still sees the same settings.
const G = globalThis;

export async function loadConfig(base) {
  // no-cache, like the content: the browser asks the server every time whether it changed
  const res = await fetch(new URL('../kit.json', base), { cache: 'no-cache' });
  if (!res.ok) throw new Error('kit.json HTTP ' + res.status);
  G.__wlKit = await res.json();
  return G.__wlKit;
}

// tests and tools (node) set it directly
export function setConfig(c) { G.__wlKit = c; }

export function cfg() {
  if (!G.__wlKit) throw new Error('kit_json_not_loaded');
  return G.__wlKit;
}

// the storage key prefix for the small per-browser values (film speed, review notes): the lesson code,
// lower case ("m2l2-speed", "m2l2-review-notes")
export const localKey = (name) => `${String(cfg().code || 'lesson').toLowerCase()}-${name}`;

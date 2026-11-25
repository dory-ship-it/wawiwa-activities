// art: this lesson's own line illustrations (EAI M2 L3 design pass, 24 Nov 2026). One drawing language for the whole
// lesson: 24-unit grid, 1.75 strokes, round caps, no fills except the one accent shape per drawing (currentColor at
// low opacity), so each icon takes the colour of where it sits. Used by the lesson's templates only (never the kit's).
// Each entry is the inner SVG of a 24 x 24 viewBox; art(name, size, label) returns the element.
const P = {
  // the card's sections
  problem: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/><path d="M11 8v3.5M11 14h.01"/>',
  people: '<circle cx="8.5" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M3 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 14.2c2.6-.4 5.1 1 5.9 4.8"/>',
  opportunity: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.2" fill="currentColor" fill-opacity=".18"/>',
  readiness: '<path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 9.5-4-1.8-7-5.2-7-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>',
  // what the learner brings (O3)
  log: '<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="M9 10h6M9 13.5h6M9 17h3.5"/>',
  inventory: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9h16M4 14h16M10 4v16"/>',
  topTen: '<path d="M5 20V10M10 20V6M15 20v-7M20 20v-4"/><path d="M3 20h18"/>',
  // the root-cause tools (F0)
  chain: '<path d="M12 3v3.5M12 10v3.5M12 17v3.5"/><circle cx="12" cy="8.2" r="1.7"/><circle cx="12" cy="15.3" r="1.7"/><path d="M8 20.5h8" stroke-width="2.4"/>',
  fish: '<path d="M2.5 12h15"/><path d="M17.5 12l3.5-3v6z" fill="currentColor" fill-opacity=".18"/><path d="M6 12l-2-4M10 12l-2-4M14 12l-2-4M6 12l-2 4M10 12l-2 4M14 12l-2 4"/>',
  bars: '<path d="M4 20V6M9 20V10M14 20v-5M19 20v-3"/><path d="M4 6l5 4 5 5 5 2" stroke-dasharray="1.5 2"/><path d="M2 20h20"/>',
  // the five solution categories
  redesign: '<path d="M4 7h11l3-3M4 17h11l3 3"/><path d="M15 7c-3 0-3 10 0 10" stroke-dasharray="2 2"/><circle cx="4" cy="7" r="1.4"/><circle cx="4" cy="17" r="1.4"/>',
  agent: '<rect x="4" y="5" width="16" height="11" rx="3"/><path d="M9 20l3-4 3 4"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="10.5" r="1"/>',
  automation: '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 12h5l5-6M12 12l5 6"/>',
  bi: '<rect x="3" y="4" width="18" height="14" rx="1.5"/><path d="M7 14v-3M11 14V8M15 14v-5M8 21h8"/>',
  docai: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h2M13 12h2M9 15.5h6" /><path d="M3 9h3M3 17h3" stroke-dasharray="1 1.5"/>',
  // people and roles (G1)
  painOwner: '<circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.8-4 3.4-6.3 6.5-6.3s5.7 2.3 6.5 6.3"/><path d="M19 4l-1.5 3h2.5L18.5 10" />',
  sponsor: '<circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.8-4 3.4-6.3 6.5-6.3s5.7 2.3 6.5 6.3"/><circle cx="19" cy="6" r="2.6"/><path d="M19 4.8v2.4"/>',
  // misc
  tool: '<path d="M14.5 4.5a4 4 0 00-5 5L4 15l2.5 2.5L12 12a4 4 0 005-5l-2.4 2.4-2.2-.6-.6-2.2z"/>',
  library: '<path d="M4 19V5M8 19V5M12 19l3.5-14 3.5 1-3.5 14z"/><path d="M2.5 19.5h19"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18M7 13h4M7 16h7"/><circle cx="16.5" cy="14" r="1.6" fill="currentColor" fill-opacity=".2"/>',
  pin: '<path d="M12 21s-6-6-6-11a6 6 0 0112 0c0 5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  speech: '<path d="M4 5h16v10H10l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};

export function art(name, size = 24, label = null) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('width', String(size)); s.setAttribute('height', String(size));
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '1.75'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('class', 'm-art m-art-' + name);
  if (label) { s.setAttribute('role', 'img'); s.setAttribute('aria-label', label); } else s.setAttribute('aria-hidden', 'true');
  s.innerHTML = P[name] || P.card;
  return s;
}
export const ART = Object.keys(P);
export const PATHS = P;

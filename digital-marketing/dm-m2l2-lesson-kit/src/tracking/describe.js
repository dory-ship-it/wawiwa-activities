// PK1: what an LMS report can show for an interaction (SCORM 1.2 has no question text): the question
// and the answers as words, from the screen the learner saw (PP1: its variant). The codes the
// templates send stay as they are (state.a, suspend data); this only translates them for the LMS:
//   question  the item's stem / the stop's question / the situation, round or row text / the field's
//             label / the screen's question or instruction
//   answers   letters (on-screen order, or the option id on S21) -> option labels; "1.a" pairs ->
//             "card text -> column label"; numbers (lines, tiles, map steps) -> their text; fill-in as is
// The id the LMS shows: the interaction id, then the question in words (A-Z, 0-9, "_"; no spaces,
// as SCORM 1.2 identifiers require), at most ID_MAX characters.
const ID_MAX = 200;
const TEXT_MAX = 250;

const words = (o) => (o == null ? '' : String(o.label ?? o.text ?? o.title ?? o.name ?? o.line ?? ''));
const idx = (code) => (/^[a-z]$/.test(code) ? code.charCodeAt(0) - 97 : -1);
const cut = (s, n) => (s.length > n ? s.slice(0, n - 3).trimEnd() + '...' : s);

// where an interaction lives on its screen: its own question and its own option list
function locate(screen, trackingId) {
  for (const it of screen.items || []) {
    if (it.trackingId === trackingId) return { question: it.stem || it.instruction, options: it.options, tiles: it.tiles, byId: true };
    if (it.b && it.b.trackingId === trackingId) { const b = { ...it, ...it.b }; return { question: b.stem || b.instruction, options: b.options, tiles: b.tiles, byId: true }; }
  }
  for (const s of screen.stops || []) if (s.tracking?.id === trackingId) return { question: s.question, options: s.options };
  for (const s of screen.situations || []) if (s.trackingId === trackingId) return { question: s.text, options: s.options };
  for (const r of screen.rounds || []) if (r.trackingId === trackingId) return { question: r.line, options: screen.options };
  for (const r of screen.rows || []) if (r.trackingId === trackingId) return { question: r.text, choices: screen.choices };
  const fields = [...(screen.fields || []), ...Object.values(screen.states || {}).flatMap((st) => st.fields || []), ...(screen.step2?.field ? [screen.step2.field] : [])];
  for (const f of fields) if (f.trackingId === trackingId) return { question: f.label, fill: true };
  return { question: screen.question || screen.instruction, options: screen.options };
}

// one response (or correct pattern) code -> words
function say(screen, at, code, type, ui) {
  const s = String(code ?? '');
  if (!s) return '';
  if (type === 'fill-in' || at.fill) return s;
  const parts = s.split(',');
  if (parts.every((p) => p.includes('.'))) {
    // pairs: left (card / label / flag) . right (column / option / target / line)
    const left = [...(screen.cards || []), ...(screen.labels || []), ...(screen.flags || [])];
    const right = [...(screen.columns || []), ...(screen.options || []), ...(screen.targets || [])];
    const lines = [...(screen.line || []), ...(screen.map || [])];
    const L = (k) => left.find((x) => String(x.code) === k) || left.find((x) => String(x.id ?? x.n) === k) || left.find((x) => String(x.n) === k);
    const R = (k) => right.find((x) => String(x.id) === k) || lines.find((x) => String(x.n) === k);
    return parts.map((p) => { const [a, b] = p.split('.'); return `${words(L(a)) || a} -> ${words(R(b)) || b || '(none)'}`; }).join('; ');
  }
  return parts.map((p) => {
    if (at.choices) { const c = at.choices[idx(p)]; return (c && ui?.buttons?.[c]) || c || p; }
    if (/^\d+$/.test(p)) {
      const pool = [...(at.tiles || []), ...(screen.tiles || []), ...(screen.map || []), ...(screen.line || [])];
      return words(pool.find((x) => String(x.n) === p)) || p;
    }
    const list = at.options || [];
    const o = at.byId ? list.find((x) => x.id === p) : list[idx(p)];
    return words(o) || p;
  }).join('; ');
}

export function slug(s) {
  return String(s ?? '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// { id, question, response, correct } for the LMS (correct null when the content has none)
export function describe(screen, trackingId, { type, response, correctResponse }, ui) {
  if (!screen) return { id: trackingId, question: '', response: cut(String(response ?? ''), TEXT_MAX), correct: null };
  const at = locate(screen, trackingId);
  const question = String(at.question || '').trim();
  return {
    id: `${trackingId}_${slug(question)}`.slice(0, ID_MAX).replace(/_+$/, ''),
    question,
    response: cut(say(screen, at, response, type, ui), TEXT_MAX),
    correct: correctResponse == null ? null : cut(say(screen, at, correctResponse, type, ui), TEXT_MAX),
  };
}

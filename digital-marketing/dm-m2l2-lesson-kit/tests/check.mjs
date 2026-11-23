// DM M2 L2's own rules for npm run check (the kit's tools/check.mjs runs them as section 17), and the contrast
// pairs of this lesson's screens and the DM profile's tokens (added to the kit's table in section 6).

export const pairs = [
  ['wl-acc-green', 'wl-white', 3, 'S11: the Leads card strip (graphic)'],
  ['wl-acc-amber', 'wl-white', 3, 'S11: the Visits card strip (graphic)'],
  ['wl-acc-purple', 'wl-white', 3, 'S11: the Information card strip (graphic)'],
  ['wl-teal', 'wl-white', 3, 'S11: the Sales card strip (graphic)'],
  ['wl-correct-head', 'wl-chip-bg', 4.5, 'S06: "I can answer" chip'],
  ['wl-text-2', 'wl-neutral-bg', 4.5, 'S06: "Gap" chip'],
  ['wl-muted', 'wl-ivory', 4.5, 'O3: "Click to see"'],
];

// the work order's rules (sections 3 to 6)
export default function dmRules(content, { ok, fail }) {
  const bad = [];
  const byId = Object.fromEntries(content.screens.map((s) => [s.id, s]));
  // every screen names its sources (deck slides, speaker notes, the trainer guide, the practice PDFs)
  content.screens.filter((s) => !Array.isArray(s.sources) || !s.sources.length).forEach((s) => bad.push(`${s.id}: no sources`));
  // presentation screens never lock Next; a locking screen names why (ui.footer.locked) and what is missing (need)
  const L = content.ui.footer.locked, N = content.ui.footer.need;
  for (const s of content.screens.filter((x) => !x.presentation)) {
    const key = [s.locked, s.variant, s.template].find((k) => k && L[k]);
    if (!key) bad.push(`${s.id}: no ui.footer.locked line for ${s.locked || s.variant || s.template}`);
    else if (!N[key]) bad.push(`${s.id}: no ui.footer.need line for ${key}`);
  }
  // the workbook stops: one pattern, one picture, one link, never a navigation away (new tab)
  const stops = content.screens.filter((s) => s.template === 'workbookStop');
  const one = (f) => new Set(stops.map(f)).size === 1;
  if (!one((s) => s.image?.src) || !one((s) => s.handoff?.href) || !one((s) => s.openFeedback)) bad.push('workbook stops differ in picture, link or feedback line');
  stops.filter((s) => s.handoff?.href !== '@links.workbook' || s.handoff.newTab !== true || !/noopener/.test(s.handoff.rel || '')).forEach((s) => bad.push(`${s.id}: the workbook link must be @links.workbook in a new tab with rel noopener`));
  stops.filter((s) => s.part && !new RegExp(`Part ${s.part} of 4`).test(s.instruction)).forEach((s) => bad.push(`${s.id}: the heading must carry "Part ${s.part} of 4"`));
  if (!/^https:\/\/dory-ship-it\.github\.io\/wawiwa-activities\/digital-marketing\/dm-m2l2-selfstudy\/$/.test(content.links.workbook || '')) bad.push('links.workbook is not the live dm-m2l2-selfstudy workbook');
  // no minutes on screen: no learner-facing string of a screen shows a duration (the engine's own minutes field weighs progress only)
  const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object'
    ? Object.entries(v).filter(([k]) => !['sources', 'pilotCopy', 'production', 'media', 'words', 'coach', '$comment', 'photo', 'image', 'removed'].includes(k)).flatMap(([, x]) => strings(x)) : []);
  for (const s of content.screens) strings(s).filter((t) => /\b\d+\s*(min|minutes?)\b/i.test(t)).forEach((t) => bad.push(`${s.id}: a duration on screen ("${t.slice(0, 40)}")`));
  // chapter titles never show the source lecture's block numbers
  content.chapters.filter((c) => /\d/.test(c.title)).forEach((c) => bad.push(`chapter ${c.id}: a number in its title`));
  // the lesson ends with its slice; every slice screen sits in a chapter, in order
  const inChapters = content.chapters.flatMap((c) => c.screens);
  if (inChapters.join() !== content.lesson.slice.join()) bad.push('lesson.slice is not the chapters\' screens in order');
  if (!byId[content.lesson.slice[content.lesson.slice.length - 1]]) bad.push('the last slice screen is missing');
  bad.length ? fail('DM lesson rules: ' + bad.join('; '))
    : ok(`DM lesson rules: sources on all ${content.screens.length} screens, a locked and a need line for every locking screen, ${stops.length} workbook stops on one pattern (one picture, the live workbook in a new tab), no duration on screen, no number in a chapter title, slice = chapters in order`);
}

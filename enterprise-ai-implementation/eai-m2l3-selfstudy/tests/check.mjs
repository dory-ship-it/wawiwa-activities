// EAI M2 L3's own rules for npm run check (the kit's tools/check.mjs runs them), and this lesson's contrast pairs.

export const pairs = [
  ['wl-o1-ground', 'wl-turquoise', 4.5, 'F1: the Why? button label and the W numbers'],
  ['wl-turquoise', 'wl-o1-ground', 3, 'F1: the W badge (large text)'],
];

export default function m2l3Rules(content, { ok, fail }) {
  const bad = [];
  // every screen names its sources (deck slides, notes, the trainer guide, the booklet)
  content.screens.filter((s) => !Array.isArray(s.sources) || !s.sources.length).forEach((s) => bad.push(`${s.id}: no sources`));
  // a screen that locks Next names why and what is missing
  const L = content.ui.footer.locked, N = content.ui.footer.need;
  for (const s of content.screens.filter((x) => !x.presentation)) {
    const key = [s.locked, s.variant, s.template].find((k) => k && L[k]);
    if (!key) bad.push(`${s.id}: no ui.footer.locked line for ${s.locked || s.variant || s.template}`);
    else if (!N[key]) bad.push(`${s.id}: no ui.footer.need line for ${key}`);
  }
  // the slice is the chapters' screens in order
  if (content.chapters.flatMap((c) => c.screens).join() !== content.lesson.slice.join()) bad.push("lesson.slice is not the chapters' screens in order");
  bad.length ? fail('M2 L3 lesson rules: ' + bad.join('; '))
    : ok(`M2 L3 lesson rules: sources on all ${content.screens.length} screens, a locked and a need line for every locking screen, slice = chapters in order`);
}

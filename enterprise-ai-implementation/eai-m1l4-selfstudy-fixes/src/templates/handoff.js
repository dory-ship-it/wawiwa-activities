// Handoff template (S19, rebuilt in NL4), a Focus panel in document view (styled by analogy):
//   head    the eyebrow ("Your workbook") with the time chip, the instruction as the heading
//   left    the brief and the main action (FX3): three numbered steps, the hint line, "Open workbook"
//           with the return line (bold, always shown) and the coach line under it, then a small preview of
//           the workbook (the visual anchor): its eight field rows drawn in HTML/CSS, every name in full,
//           the fields the learner's notes go into marked
//   right   secondary, compact: "Copy your notes into the workbook": four read-only cards of what the
//           learner wrote earlier (S02 case, S08B sketch, S12B metric, S17B notes), one line per part
//           (FX3: two lines did not fit the panel with notes at full length; the full text for screen
//           readers and in the copy), each with Copy and the workbook
//           field it goes into (a chip). A card with nothing filled shows "Not filled in" and its Copy is
//           disabled.
//   "Open workbook" is a real link to the
//           EXISTING workbook (content links, new tab, rel noopener noreferrer). Opening it unlocks Next
//           (the flag "o" in suspend data, so a reload or LMS resume keeps it) and the band says so.
// Copy: navigator.clipboard first; when it is blocked (an LMS iframe without clipboard permission) the
// card's text is selected and the button says "Press Ctrl+C" (the selection copies with the keys).
// The ghost hand shows the first Copy once (it points beside it and taps nothing). Nothing is tracked.
import { h, resolveLink } from '../util.js?v=250c2853';
import { glyph, icon } from '../icons.js?v=250c2853';
import { layout, sheet, privacyLine, ruleLabel, picture } from './stage.js?v=250c2853';
import { scaleOf } from '../ghost.js?v=250c2853';

const COPIED_MS = 2000;

// FX4 (Phase 3, Dor stuck on S19's 123 words): S19 is three screens, one task each.
//   brief  (S19A) "What you will do now": what the workbook is and why, three steps, one screenshot of it.
//                 A presentation screen (Next open).
//   open   (S19B, the default) the old S19 without its brief: Open workbook, the copy cards, the coach line.
//                 Next unlocks after Open, and the line beside it says so.
//   back   (S19C) "Did you export your PDF?": Yes opens Next; Not yet shows the reopen link. Nothing tracked.
export const handoff = {
  mount(ctx) {
    if (ctx.screen.variant === 'brief') return brief(ctx);
    if (ctx.screen.variant === 'back') return back(ctx);
    return openScreen(ctx);
  },
};

function brief(ctx) {
  const { screen, zones } = ctx;
  const head = h('div', { class: 'w-handoff-head' }, h('div', {}, ruleLabel(screen.eyebrow), zones.instruction),
    h('p', { class: 'w-time-chip' }, icon('clock', { size: 17.92 }), h('span', {}, screen.chip)));
  const steps = h('ol', { class: 'w-steps' }, screen.steps.map((s) => h('li', {}, h('span', { class: 'w-step-n', 'aria-hidden': 'true' }, String(s.n)), h('span', {}, s.text))));
  const shot = h('figure', { class: 'w-wb-shot' }, picture(screen.image, 'w-wb-shot-img'));
  layout(ctx, 'focus', sheet('focus w-col-handoff w-sheet-doc w-sheet-brief', head,
    h('div', { class: 'w-brief-grid' }, h('div', { class: 'w-brief-left' }, h('p', { class: 'w-context' }, screen.text), steps), shot)));
  return { unmount() {} };
}

function back(ctx) {
  const { screen, ui, zones, content } = ctx;
  const reopen = h('a', { class: 'w-btn w-btn-ghost', href: resolveLink(content, '@links.workbook'), target: '_blank', rel: 'noopener noreferrer', dataset: { action: 'reopen' } },
    h('span', {}, ui.buttons.reopenWorkbook), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')'));
  const yes = h('button', { class: 'w-btn w-btn-primary', type: 'button', 'aria-pressed': 'false', dataset: { action: 'pdfYes' } }, ui.buttons.yes);
  const notYet = h('button', { class: 'w-btn w-btn-ghost', type: 'button', 'aria-pressed': 'false', dataset: { action: 'pdfNotYet' } }, ui.buttons.notYet);
  const fix = h('div', { class: 'w-pdf-fix', hidden: true }, h('p', { class: 'w-context' }, screen.notYetLine), reopen);
  layout(ctx, 'focus', sheet('focus w-sheet-back', screen.text ? h('p', { class: 'w-context' }, screen.text) : null, zones.instruction,
    h('div', { class: 'w-pdf-choice', role: 'group', 'aria-labelledby': 'w-instruction', dataset: { interaction: '' } }, yes, notYet), fix, zones.band));
  zones.setFeedback({ state: 'hint', text: '' });
  const done = (focus) => {
    yes.setAttribute('aria-pressed', 'true'); notYet.setAttribute('aria-pressed', 'false'); fix.hidden = true;
    ctx.flags.set('pdf', 1); ctx.complete(); ctx.unlockNext({ focus });
  };
  yes.addEventListener('click', () => done(true));
  notYet.addEventListener('click', () => { notYet.setAttribute('aria-pressed', 'true'); fix.hidden = false; reopen.focus(); });
  if (ctx.revisit || ctx.flags.get('pdf')) done(false);
  return { unmount() {} };
}

function openScreen(ctx) {
    const { screen, ui, zones, content } = ctx;
    const href = resolveLink(content, screen.handoff.href);

    /* ---- head (FX4: the eyebrow and time chip only when the content gives them; S19B has none) ---- */
    const head = h('div', { class: 'w-handoff-head' },
      h('div', {}, screen.eyebrow ? ruleLabel(screen.eyebrow) : null, zones.instruction),
      screen.chip ? h('p', { class: 'w-time-chip' }, icon('clock', { size: 17.92 }), h('span', {}, screen.chip)) : null);

    /* ---- left: (FX4) the steps and the workbook preview moved to S19A; only when the content still has them ---- */
    const steps = screen.steps ? h('ol', { class: 'w-steps' }, screen.steps.map((s) => h('li', {}, h('span', { class: 'w-step-n', 'aria-hidden': 'true' }, String(s.n)), h('span', {}, s.text)))) : null;
    const pv = screen.preview;
    const preview = pv ? h('figure', { class: 'w-wb-preview', role: 'img', 'aria-label': pv.alt },
      h('span', { class: 'w-wb-icon', 'aria-hidden': 'true' }, icon('workbook', { size: 20.48 })),
      h('ol', { class: 'w-wb-rows', 'aria-hidden': 'true' }, pv.fields.map((name, i) => h('li', { dataset: { notes: String(pv.fromNotes.includes(i + 1)) } },
        h('b', {}, String(i + 1)), h('span', {}, name))))) : null;

    /* ---- right: the copy cards ---- */
    const cc = screen.copyCards;
    const cards = cc.cards.map((c) => {
      const fields = content.screens.find((s) => s.id === c.from)?.fields || [];
      const rows = fields.map((f) => ({ label: f.label, value: ctx.store.get(f.store).trim() }));
      const filled = rows.filter((r) => r.value);
      const copyText = filled.map((r) => `${r.label}: ${r.value}`).join('\n');
      const name = c.label || rows.map((r) => r.label).join(', ');
      const list = h('dl', { class: 'w-sketch-list w-copy-rows' }, rows.map((r) => h('div', { class: 'w-sketch-row' }, h('dt', {}, r.label + ':'), ' ',
        h('dd', { dataset: { empty: String(!r.value) } }, r.value || ui.record.empty))));
      const btnText = h('span', {}, ui.buttons.copy);
      const btn = h('button', { class: 'w-btn w-btn-action w-copy-btn', type: 'button', dataset: { action: 'copy', card: c.id }, disabled: !filled.length,
        'aria-label': ui.buttons.copy + ': ' + name }, btnText);
      // the card's name across the card (FX3: never cut), then its field chip with Copy on the right, then the parts
      const el = h('section', { class: 'w-copy-card', dataset: { card: c.id }, 'aria-label': name },
        c.label ? h('p', { class: 'w-copy-title' }, c.label) : null,
        h('div', { class: 'w-copy-head' },
          h('div', { class: 'w-copy-id' }, h('span', { class: 'w-field-chip' + (c.off ? ' w-chip-off' : '') }, c.chip)),
          btn),
        list);
      let timer = null;
      const say = (text) => { btnText.textContent = text; clearTimeout(timer); timer = setTimeout(() => { btnText.textContent = ui.buttons.copy; }, COPIED_MS); };
      // the fallback: select the card's rows so Ctrl+C copies them, and say so
      const fallback = () => {
        const sel = window.getSelection();
        sel.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(list);
        sel.addRange(range);
        // FX2 H2: the full line ("Press Ctrl+C (Cmd+C on Mac)") in the strip; the button only its keys, so
        // the card keeps its width (the full line in the button squeezed the field chip)
        say(ui.copyKeys);
        zones.setFeedback({ state: 'notice', text: ui.copyFallback + '.' });
      };
      btn.addEventListener('click', () => {
        if (!copyText) return;
        const cb = navigator.clipboard;
        if (!cb || !window.isSecureContext) { fallback(); return; }
        cb.writeText(copyText).then(() => say(ui.buttons.copied), fallback);
      });
      return { el, btn, copyText, stop: () => clearTimeout(timer) };
    });
    const right = h('div', { class: 'w-handoff-right' }, ruleLabel(cc.label), h('div', { class: 'w-copy-grid' }, cards.map((c) => c.el)));

    /* ---- the main action: Open workbook, the return line and the coach line, under the brief ---- */
    const coach = privacyLine(screen.privacy);
    const open = h('a', { class: 'w-btn w-btn-primary w-open-wb', href, target: '_blank', rel: screen.handoff.rel, dataset: { action: 'open' } },
      h('span', {}, ui.buttons.open), glyph('g-arrow', { size: 19.2 }), h('span', { class: 'w-sr-only' }, ' (' + ui.newTabNote + ')'));
    // FX3: the brief (three steps, the hint) and Open workbook lead the left column; the coach line
    // beside the button, the return line under them; the workbook preview last (every field name in full)
    const left = h('div', { class: 'w-handoff-left' }, steps, // (FX4: the hint behind the Hint link)
      h('div', { class: 'w-handoff-open' }, open, coach.el, screen.returnLine ? h('p', { class: 'w-return-line' }, screen.returnLine) : null), preview);

    // (FX4 S19B: without the brief, one column: the heading, Open and the coach line, the copy cards in a row)
    layout(ctx, 'focus', sheet('focus w-col-handoff w-sheet-doc' + (steps ? '' : ' w-sheet-open1'), head,
      h('div', { class: 'w-handoff-grid', dataset: { interaction: '' } }, left, right), zones.band));
    zones.setHintVisible(false); // the hint is the line in the left column: the band keeps it for screen readers
    zones.setFeedback({ state: 'hint', text: screen.hint });

    // the ghost hand: once, beside the first Copy that can copy (it points, it never presses)
    const first = cards.find((c) => !c.btn.disabled);
    if (!ctx.revisit && first) {
      ctx.ghost({ type: screen.ghost?.type || 'copy',
        steps: () => [{ point: () => { const r = first.btn.getBoundingClientRect(), k = scaleOf(first.btn); return { x: r.left - 14 * k, y: r.top + r.height / 2 }; }, sweep: true, hold: 1200 }] });
    }

    function opened(announce) {
      ctx.complete();
      ctx.unlockNext({ focus: false });
      if (announce) zones.setFeedback({ state: 'notice', text: screen.openFeedback });
    }
    open.addEventListener('click', () => { ctx.flags.set('o', 1); opened(true); }); // the link itself opens the new tab
    if (ctx.revisit || ctx.flags.get('o')) opened(false);
    return { unmount() { cards.forEach((c) => c.stop()); } };
}

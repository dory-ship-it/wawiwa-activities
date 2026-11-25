// meeting: "Who hurts?" as a moment in a NorthRiver meeting (EAI M2 L3, G1; deck slide 13). Round 3 (25 Nov 2026, Noy
// chose the meeting room over a third drag). A full photo of the meeting; a name tag over each person. One person
// speaks at a time: their speech bubble lights (the line, with a play button when the line has audio) and a ring marks
// them. The learner decides from what is said: does this person feel the pain, or fund the fix? One try per line;
// the feedback card says why. After the six lines, the deck's executive sentence with
// two blanks: who feels the pain, who carries it (slide 13: "here is who feels it ... here is who carries it").
// Tracking: [0] the six roles, one graded matching ("1.pain,2.funds,..."); [1] the sentence, graded.
// Content: people [{ id, name, role, tag: [x, y], head: [x, y] }] (stage px), lines [{ who, text, audio, role,
// bubble: [x, y], tail, feedback: { correct, wrong } }], roles { pain, funds }, nextVoice, pitch { before, mid, after,
// blanks: [{ id, answer, label }], check, feedback: { correct, wrong } }.
import { h, reducedMotion } from '../src/util.js?v=34b6caae';
import { layout } from '../src/templates/stage.js?v=34b6caae';
import { checkButton } from '../src/templates/decision.js?v=34b6caae';

const BAR = 80.64; // the stage's top bar: the content positions are stage px, the main zone starts under the bar
const at = (el, [x, y]) => { el.style.left = x + 'px'; el.style.top = (y - BAR) + 'px'; return el; };

export const meeting = {
  scene: () => 'focus',
  mount(ctx) {
    const { screen, ui, zones } = ctx;
    const still = reducedMotion() || ctx.revisit;
    const P = Object.fromEntries(screen.people.map((p) => [p.id, p]));
    const tags = Object.fromEntries(screen.people.map((p) => [p.id, at(h('span', { class: 'm-mt-tag' }, h('b', {}, p.name), ' · ' + p.role, h('span', { class: 'm-mt-role', hidden: true })), p.tag)]));
    const ring = h('span', { class: 'm-mt-ring', 'aria-hidden': 'true' });
    const who = h('span', { class: 'm-mt-who' });
    const audio = h('audio', { preload: 'none' });
    const play = h('button', { class: 'm-mt-play', type: 'button', 'aria-label': ui.buttons.play || 'Play' });
    const wave = h('span', { class: 'm-mt-wave', 'aria-hidden': 'true' });
    const sound = h('span', { class: 'm-mt-sound' }, play, wave);
    const said = h('p', { class: 'm-mt-line' });
    const bubble = h('div', { class: 'm-mt-bubble', role: 'group', 'aria-live': 'polite' }, who, sound, said);
    play.addEventListener('click', () => { audio.currentTime = 0; audio.play().catch(() => {}); });
    const r1 = h('button', { class: 'm-mt-role-btn', type: 'button', dataset: { role: 'pain' } }, screen.roles.pain);
    const r2 = h('button', { class: 'm-mt-role-btn', type: 'button', dataset: { role: 'funds' } }, screen.roles.funds);
    const roles = h('div', { class: 'm-mt-roles', role: 'group', 'aria-labelledby': 'w-instruction' }, r1, r2);
    const dots = h('div', { class: 'm-mt-dots', 'aria-hidden': 'true' }, screen.lines.map(() => h('i')));
    const panel = h('div', { class: 'm-mt-panel' }, zones.instruction, roles, dots, h('div', { class: 'm-mt-band' }, zones.band));
    const scene = h('div', { class: 'm-mt' }, Object.values(tags), ring, bubble, panel);
    layout(ctx, 'meeting', scene);
    zones.setHintVisible(false);
    zones.setFeedback({ state: 'hint', text: screen.hint });

    const picks = [];
    let i = 0;
    const paintDots = () => [...dots.children].forEach((d, k) => { d.dataset.state = k < i ? 'done' : k === i ? 'now' : ''; });
    const speak = () => {
      const l = screen.lines[i], p = P[l.who];
      Object.entries(tags).forEach(([id, t]) => { t.dataset.speaking = String(id === l.who); });
      who.replaceChildren(h('b', {}, p.name), ' · ' + p.role);
      said.textContent = '"' + l.text + '"';
      sound.hidden = !l.audio;
      if (l.audio) audio.src = l.audio;
      at(bubble, l.bubble); bubble.style.setProperty('--tail', l.tail + 'px');
      at(ring, p.head);
      if (!still) { bubble.classList.remove('m-mt-pop'); void bubble.offsetWidth; bubble.classList.add('m-mt-pop'); }
      [r1, r2].forEach((b) => { b.disabled = false; b.dataset.result = ''; });
      paintDots();
    };
    const judge = (role) => {
      const l = screen.lines[i];
      const right = role === l.role;
      picks.push(`${i + 1}.${role}`);
      [r1, r2].forEach((b) => { b.disabled = true; b.dataset.result = b.dataset.role === l.role ? 'correct' : b.dataset.role === role ? 'wrong' : ''; });
      // (no role tag stays on the person: Sarah speaks twice, once funding and once feeling a pain; the role belongs
      // to what is said)
      const last = i === screen.lines.length - 1;
      const next = { id: 'nextVoice', label: last ? screen.pitchButton : screen.nextVoice, onClick: () => { i++; if (last) pitch(); else { zones.setFeedback({ state: 'hint', text: screen.hint }); speak(); r1.focus(); } } };
      zones.setFeedback(right ? { state: 'correct', text: l.feedback.correct, actions: [next] } : { state: 'wrong', verdict: ui.feedback.revealed, text: l.feedback.wrong, actions: [next] });
      if (last) ctx.answer({ trackingId: screen.tracking[0].id, response: picks.join(','), result: picks.every((x, k) => x.endsWith('.' + screen.lines[k].role)) ? 'correct' : 'wrong' });
      zones.band.querySelector('[data-action="nextVoice"]')?.focus();
    };
    [r1, r2].forEach((b) => b.addEventListener('click', () => judge(b.dataset.role)));

    // the executive sentence, after the six lines
    function pitch() {
      i = screen.lines.length; paintDots();
      bubble.hidden = true; ring.hidden = true; roles.hidden = true; dots.hidden = true;
      const pc = screen.pitch;
      const sel = (b) => h('select', { class: 'm-mt-select', 'aria-label': b.label, dataset: { blank: b.id } }, h('option', { value: '' }, b.label), screen.people.map((p) => h('option', { value: p.id }, p.name)));
      const s1 = sel(pc.blanks[0]), s2 = sel(pc.blanks[1]);
      const sentence = h('p', { class: 'm-mt-pitch' }, pc.before, ' ', s1, ' ', pc.mid, ' ', s2, pc.after);
      zones.instruction.textContent = pc.instruction;
      const check = checkButton(ui, ui.buttons.check, () => commit(true), ui.checkWhy.one);
      const sync = () => { check.disabled = !(s1.value && s2.value); };
      [s1, s2].forEach((s) => s.addEventListener('change', sync));
      panel.classList.add('m-mt-panel-pitch');
      zones.instruction.after(sentence);
      zones.setFeedback({ state: 'hint', text: screen.hint });
      zones.setTool(check);
      sync();
      function commit(focus) {
        const ok = s1.value === pc.blanks[0].answer && s2.value === pc.blanks[1].answer;
        if (!ctx.revisit) ctx.answer({ trackingId: screen.tracking[1].id, response: `${s1.value},${s2.value}`, result: ok ? 'correct' : 'wrong' });
        [s1, s2].forEach((s) => { s.disabled = true; });
        if (!ok) { s1.value = pc.blanks[0].answer; s2.value = pc.blanks[1].answer; }
        zones.setTool();
        zones.setFeedback(ok ? { state: 'correct', text: pc.feedback.correct } : { state: 'wrong', verdict: ui.feedback.revealed, text: pc.feedback.wrong });
        ctx.complete();
        ctx.unlockNext({ focus });
      }
      if (ctx.revisit) { s1.value = pc.blanks[0].answer; s2.value = pc.blanks[1].answer; commit(false); } else s1.focus();
    }

    // the hand, on arrival: it points at the two choices (it presses nothing)
    if (!ctx.revisit) ctx.ghost({ type: 'choice', steps: () => [{ el: roles, hold: 900 }] });
    if (ctx.revisit) pitch();
    else { speak(); ctx.need(ui.footer.need.meeting); }
    return { unmount() { audio.pause(); } };
  },
};

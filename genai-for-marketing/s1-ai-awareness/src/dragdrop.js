// Drag-and-drop (screen 28): drag a coloured label onto the grey box of a role. The original's
// answer logic: each label has one correct box; a correct drop turns the label and the role green,
// a wrong drop turns the label red. SUBMIT checks all six (one attempt), then Correct/Incorrect layers.
export function makeDragDrop(S, dd) {
  const { ctx } = S;
  const items = new Map();   // itemId → { node, home: {x,y}, target: targetId|null, correct, lights }
  const occupied = new Map(); // targetId → itemId
  let answered = false, dragged = false;
  let picked = null;          // keyboard: item being moved, and the highlighted target index

  const targets = [...new Set(dd.items.map(i => i.target))];
  const rectOf = (id) => { const n = S.node(id); return n ? { x: n.obj.x, y: n.obj.y, w: n.obj.w, h: n.obj.h } : null; };

  function init() {
    for (const it of dd.items) {
      const node = S.node(it.id); if (!node) continue;
      items.set(it.id, { node, home: { x: node.obj.x, y: node.obj.y }, target: null, correct: it.target, lights: it.lights });
      const w = node.wrap;
      w.classList.add('drag-item'); w.tabIndex = 0; w.setAttribute('role', 'button');
      w.setAttribute('aria-label', (S.screen.text?.[it.id] || []).map(p => p.runs.map(r => r.t).join('')).join(' ') + '. Press Enter, then arrows to choose a role box, Enter to drop.');
      w.addEventListener('pointerdown', (e) => startDrag(it.id, e));
      w.addEventListener('keydown', (e) => onKey(it.id, e));
    }
    for (const t of targets) { const n = S.node(t); if (n) n.wrap.classList.add('drop-target'); }
  }

  function moveTo(itemId, x, y) { const it = items.get(itemId); it.node.wrap.style.left = x + 'px'; it.node.wrap.style.top = y + 'px'; }

  function place(itemId, targetId) {
    const it = items.get(itemId);
    if (it.target) { occupied.delete(it.target); unlight(it); }
    if (!targetId || (occupied.has(targetId) && occupied.get(targetId) !== itemId)) { moveTo(itemId, it.home.x, it.home.y); it.target = null; S.setState(itemId, '_default'); return; }
    const r = rectOf(targetId);
    moveTo(itemId, r.x + (r.w - it.node.obj.w) / 2, r.y + (r.h - it.node.obj.h) / 2);
    it.target = targetId; occupied.set(targetId, itemId);
    const ok = targetId === it.correct;
    S.setState(itemId, ok ? 'Drop Correct' : 'Drop Incorrect');
    if (ok && it.lights) S.setState(it.lights, 'Correct');
  }
  function unlight(it) { if (it.lights && it.target === it.correct) S.setState(it.lights, '_default'); }

  function startDrag(itemId, e) {
    if (answered || e.button !== 0) return;
    const it = items.get(itemId);
    const w = it.node.wrap;
    const stage = w.closest('.screen').getBoundingClientRect();
    const scale = stage.width / 960;
    const startX = parseFloat(w.style.left), startY = parseFloat(w.style.top);
    const ox = e.clientX, oy = e.clientY;
    w.setPointerCapture(e.pointerId); w.classList.add('dragging'); dragged = true;
    w.style.zIndex = 50;
    const onMove = (ev) => { moveTo(itemId, startX + (ev.clientX - ox) / scale, startY + (ev.clientY - oy) / scale); };
    const onUp = (ev) => {
      w.removeEventListener('pointermove', onMove); w.removeEventListener('pointerup', onUp); w.removeEventListener('pointercancel', onUp);
      w.classList.remove('dragging'); w.style.zIndex = '';
      const cx = startX + (ev.clientX - ox) / scale + it.node.obj.w / 2, cy = startY + (ev.clientY - oy) / scale + it.node.obj.h / 2;
      const hit = targets.find(t => { const r = rectOf(t); return r && cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h; });
      place(itemId, hit || null);
    };
    w.addEventListener('pointermove', onMove); w.addEventListener('pointerup', onUp); w.addEventListener('pointercancel', onUp);
    e.preventDefault();
  }

  // keyboard: Enter picks the label up, arrows walk the role boxes, Enter drops, Escape cancels
  function onKey(itemId, e) {
    if (answered) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); e.stopPropagation();
      if (!picked) { picked = { itemId, index: 0 }; highlight(); }
      else if (picked.itemId === itemId) { dragged = true; place(itemId, targets[picked.index]); clearHighlight(); picked = null; }
      return;
    }
    if (!picked || picked.itemId !== itemId) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { picked.index = (picked.index + 1) % targets.length; highlight(); e.preventDefault(); e.stopPropagation(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { picked.index = (picked.index + targets.length - 1) % targets.length; highlight(); e.preventDefault(); e.stopPropagation(); }
    else if (e.key === 'Escape') { clearHighlight(); picked = null; e.preventDefault(); e.stopPropagation(); }
  }
  function highlight() { targets.forEach((t, i) => S.node(t)?.wrap.classList.toggle('target-focus', i === picked.index)); }
  function clearHighlight() { targets.forEach(t => S.node(t)?.wrap.classList.remove('target-focus')); }

  function submit() {
    if (answered) return;
    if (!dragged || ![...items.values()].some(i => i.target)) { prompt(dd.hint); return; }
    answered = true;
    for (const it of items.values()) it.node.wrap.classList.add('locked');
    const allRight = [...items.values()].every(i => i.target === i.correct);
    ctx.setSubmit(null); ctx.setNavHidden(false);
    S.showLayer(allRight ? dd.feedback.correct : dd.feedback.incorrect, 'oncomplete');
  }

  function prompt(message) {
    const box = ctx.h('div', { class: 'prompt', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'prompt-title' });
    box.innerHTML = `<div class="prompt-win"><h2 id="prompt-title">Invalid Answer</h2><p></p><button type="button" class="prompt-ok">OK</button></div>`;
    box.querySelector('p').textContent = message;
    const ok = box.querySelector('button');
    const close = () => box.remove();
    ok.addEventListener('click', close);
    box.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); e.stopPropagation(); });
    S.el.appendChild(box); ok.focus();
  }

  return {
    mount() { init(); ctx.setSubmit(submit); ctx.setNavHidden(true); },
    dispose() { ctx.setSubmit(null); },
  };
}

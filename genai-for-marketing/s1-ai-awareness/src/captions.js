// Captions: WebVTT parsing and one caption bar per screen, shared by its videos and narration.
export function parseVTT(text) {
  const cues = [];
  const toMs = (s) => { const [h, m, rest] = s.trim().split(':'); const [sec, ms] = rest.split('.'); return ((+h) * 3600 + (+m) * 60 + (+sec)) * 1000 + (+(ms || 0)); };
  for (const block of text.replace(/\r\n/g, '\n').split(/\n\n+/)) {
    const lines = block.split('\n').filter(Boolean);
    const i = lines.findIndex(l => l.includes('-->'));
    if (i < 0) continue;
    const [a, b] = lines[i].split('-->');
    cues.push({ start: toMs(a), end: toMs(b.split(' ')[0] || b), text: lines.slice(i + 1).join('\n') });
  }
  return cues;
}

export function createCaptionBar(stageEl, ctx) {
  const el = document.createElement('div');
  el.className = 'caption-bar'; el.hidden = true; el.setAttribute('aria-live', 'polite');
  stageEl.appendChild(el);
  const bound = new Map(); // media → cues
  let enabled = ctx.cc.get();
  const refresh = () => {
    if (!enabled) { el.hidden = true; return; }
    let text = '';
    for (const [m, cues] of bound) {
      if (m.paused || m.ended) continue;
      const t = m.currentTime * 1000;
      const cue = cues.find(c => t >= c.start && t <= c.end);
      if (cue) text = cue.text;
    }
    el.textContent = text; el.hidden = !text;
  };
  const unsub = ctx.cc.on((on) => { enabled = on; refresh(); });
  return {
    async bind(media, url) {
      try { const res = await fetch(url); if (!res.ok) return; bound.set(media, parseVTT(await res.text())); } catch { return; }
      for (const ev of ['timeupdate', 'pause', 'play', 'ended', 'seeked']) media.addEventListener(ev, refresh);
    },
    dispose() { unsub(); el.remove(); },
  };
}

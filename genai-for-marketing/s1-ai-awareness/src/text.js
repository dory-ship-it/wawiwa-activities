// Text boxes: paragraphs and runs flow in CSS with the original's metrics
// (line heights, indents, bullets, alignment come from the layout; words come from content).
const VALIGN = { top: 'flex-start', center: 'center', bottom: 'flex-end' };

export function renderText(style, paragraphs, ctx) {
  const t = style;
  const box = document.createElement('div');
  box.className = 'txtbox' + (t.shadow ? ' txt-shadow' : '');
  box.style.cssText = `left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px;justify-content:${VALIGN[t.valign] || 'flex-start'};`;
  (paragraphs || []).forEach((para, i) => {
    const ps = t.paragraphs[Math.min(i, t.paragraphs.length - 1)] || {};
    const p = document.createElement('p');
    p.style.cssText = `text-align:${ps.align === 'justify' ? 'justify' : (ps.align || 'left')};line-height:${ps.lh}px;font-family:var(--font-${ps.font});font-size:${ps.size}px;color:${ps.color};padding-left:${ps.indent || 0}px;margin-top:${i ? (ps.sb || 0) : 0}px;margin-bottom:${ps.sa || 0}px;`;
    const hasText = (para.runs || []).some(r => (r.t || '').trim());
    if (ps.bullet && hasText) {
      const b = document.createElement('span');
      b.className = 'bullet'; b.textContent = ps.bullet.char; b.setAttribute('aria-hidden', 'true');
      b.style.cssText = `left:${ps.first || 0}px;color:${ps.bullet.color};font-family:var(--font-${ps.bullet.font});`;
      p.appendChild(b);
    }
    let any = false;
    for (const r of para.runs || []) {
      const text = ctx.withName(r.t || '');
      if (!text) continue;
      any = true;
      const span = document.createElement('span');
      let css = '';
      if (r.font) css += `font-family:var(--font-${r.font});`;
      else if (r.b) css += `font-family:var(--font-${String(ps.font || 'calibri').replace(/-bold$/, '')}-bold);`;
      if (r.size) css += `font-size:${r.size}px;`;
      if (r.color) css += `color:${r.color};`;
      if (r.i) css += 'font-style:italic;';
      if (r.u) css += 'text-decoration:underline;';
      if (css) span.style.cssText = css;
      text.replace(/\t/g, ' ').split('\r').forEach((part, j) => {
        if (j) span.appendChild(document.createElement('br'));
        span.appendChild(document.createTextNode(part));
      });
      p.appendChild(span);
    }
    if (!any) p.appendChild(document.createTextNode('​'));
    box.appendChild(p);
  });
  return box;
}

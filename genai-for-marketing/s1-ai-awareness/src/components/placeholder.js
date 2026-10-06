// Phase-1 stand-in for screens whose real component arrives in P2. It carries the shared frame
// (background, small logo, footer, title) so navigation can be reviewed end to end.
import { footer, smallLogo } from './footer.js';
import { nameField } from './name-field.js';

export const placeholder = {
  render(screen, ctx, el) {
    const { h } = ctx;
    const navy = screen.n === 2; // the original screen 2 is a full navy slide (#1C3B62) that covers the master logo
    el.style.background = navy ? '#1C3B62' : '#FFFFFF';
    if (!navy) el.appendChild(smallLogo(ctx));
    const title = h('h1', { class: 'txt', style: `left:50px;top:60px;width:828px;height:79px;font-family:var(--font-calibri);font-weight:normal;font-size:36px;line-height:43px;color:${navy ? '#fff' : '#1C3B62'};` });
    title.textContent = ctx.withName(screen.title);
    el.appendChild(title);
    const note = h('p', { class: 'txt', style: `left:50px;top:144px;width:828px;font-family:var(--font-calibri);font-size:16px;line-height:22px;color:${navy ? 'rgba(255,255,255,.7)' : '#7F7F7F'};` });
    note.textContent = `Screen ${screen.n} · ${screen.type} · content arrives in phase P2`;
    el.appendChild(note);
    if (screen.nameField) el.appendChild(nameField(ctx, { x: 224, y: 198, w: 316, h: 57, placeholder: screen.nameField.placeholder, fontSize: screen.nameField.fontSize }));
    el.appendChild(footer(ctx, ctx.content.footer.text));
    return {};
  },
};

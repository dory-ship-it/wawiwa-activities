// Footer, written once, used on every screen. Positions, images and text styles are the
// original slide master's (Storyline slide data), with Dor's two changes:
//   * "© Oded Israeli, Wawiwa Tech" with no year (the original had "2024 © …")
//   * cover: "Confidencial" → "Confidential"
const IMG = 'source/storyline-published/mobile/';

// Slides 2–33: teal parallelogram (70x27) + light strip (890x27) at y=513, text at (96,519).
export function footer(ctx, text) {
  const g = ctx.h('div', { class: 'obj footer', style: 'left:0;top:513px;width:960px;height:27px;' });
  g.appendChild(img(ctx, IMG + '6a5Np7l19jz.png', 0, 0, 70, 27));
  g.appendChild(img(ctx, IMG + '5jvLA0N71bH.png', 70, 0, 890, 27));
  const t = ctx.h('p', { class: 'txt', style: 'left:96px;top:6px;width:347px;height:17px;font-family:var(--font-calibri-bold);font-size:14px;line-height:17px;color:#7F7F7F;text-align:left;' });
  t.textContent = text;
  g.appendChild(t);
  return g;
}

// Cover: taller strip at y=505 (teal 93x35, strip 864x34), "© Wawiwa Tech" bold + " | Confidential" regular, Open Sans 14px #808080.
export function coverFooter(ctx, brand, note) {
  const g = ctx.h('div', { class: 'obj footer footer-cover', style: 'left:0;top:505px;width:959px;height:36px;' });
  g.appendChild(img(ctx, IMG + '6SJqSC2OT6b.png', 95, 2, 864, 34));
  g.appendChild(img(ctx, IMG + '6hHBi77btpi.png', 0, 0, 93, 35));
  const t = ctx.h('p', { class: 'txt', style: 'left:121px;top:10px;width:247px;height:18px;font-size:14px;line-height:18px;color:#808080;white-space:nowrap;' });
  const b = ctx.h('span', { style: 'font-family:var(--font-open-sans-bold);' }); b.textContent = brand;
  const n = ctx.h('span', { style: 'font-family:var(--font-open-sans);' }); n.textContent = ' ' + note;
  t.append(b, n);
  g.appendChild(t);
  return g;
}

// Small "wawiwa" logo from the slide master at (15,16): red callout + letter images.
export function smallLogo(ctx) {
  const g = ctx.h('div', { class: 'obj small-logo', style: 'left:15px;top:16px;width:52px;height:19px;', 'aria-hidden': 'true' });
  g.appendChild(img(ctx, IMG + '6HH1BAfpdg4.png', 0, 0, 52, 19));
  for (const [file, x, y, w, hh] of [
    ['6e8QyKjXZQj.png', 4, 5, 9, 6], ['5Wvm6SoDMS1.png', 14, 5, 6, 6], ['5tQhsUQncCW.png', 20, 5, 9, 6],
    ['5qz9orPbnoc.png', 30, 2, 2, 9], ['5tQhsUQncCW.png', 32, 5, 9, 6], ['5Wvm6SoDMS1.png', 42, 5, 6, 6],
  ]) g.appendChild(img(ctx, IMG + file, x, y, w, hh));
  return g;
}

export function img(ctx, path, x, y, w, hh, alt = '') {
  const d = ctx.h('div', { class: 'obj', style: `left:${x}px;top:${y}px;width:${w}px;height:${hh}px;` });
  const i = ctx.h('img', { src: ctx.asset(path), alt, draggable: 'false' });
  d.appendChild(i);
  return d;
}

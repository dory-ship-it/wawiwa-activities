// Generic screen renderer: draws a screen from src/screens/layout.json (design) and content/s1.json
// (words, images, media), then runs its layers, timeline, animations and triggers like the original.
import { svgFromCommandset } from './svg.js';
import { renderText } from './text.js';
import { playAnim } from './anim.js';
import { createCaptionBar } from './captions.js';
import { footer, smallLogo } from './components/footer.js';
import { nameField } from './components/name-field.js';
import { makeSlider } from './slider.js';
import { makeDragDrop } from './dragdrop.js';

const VOLUME = 0.75;

export const genericScreen = {
  render(screen, ctx, el) {
    const lay = ctx.layout.screens[screen.n];
    if (!lay) { el.textContent = `Screen ${screen.n}: no layout`; return {}; }
    const S = new ScreenInstance(screen, lay, ctx, el);
    S.build();
    return { mount: () => S.mount(), dispose: () => S.dispose() };
  },
};

class ScreenInstance {
  constructor(screen, lay, ctx, el) {
    Object.assign(this, { screen, lay, ctx, el });
    this.nodes = new Map();   // id → { obj, wrap, visual, textBox, state, visited, layer }
    this.layers = new Map();  // id → { el, def, open }
    this.media = new Map();   // id → HTMLMediaElement
    this.timers = [];
    this.anims = [];
    this.disposed = false;
  }

  /* ---------- build ---------- */
  build() {
    const { lay, ctx, el } = this;
    el.style.background = lay.bg || '#fff';
    for (const obj of lay.objects) this.renderObject(obj, el, null);
    for (const [lid, L] of Object.entries(lay.layers)) {
      const lel = ctx.h('div', { class: 'layer', 'data-layer': lid });
      lel.style.display = 'none';
      for (const obj of L.objects) this.renderObject(obj, lel, lid);
      el.appendChild(lel);
      this.layers.set(lid, { el: lel, def: L, open: false });
    }
    // narration audio
    for (const [aid, a] of Object.entries(lay.audio || {})) {
      const src = this.screen.media?.[aid]?.src;
      if (!src) continue;
      const audio = ctx.h('audio', { preload: 'auto' });
      audio.src = ctx.asset(src); audio.volume = VOLUME;
      el.appendChild(audio);
      this.media.set(aid, audio);
      if (a.captions) this.captionsFor(audio, a.captions);
    }
    if (lay.dragdrop) this.dragdrop = makeDragDrop(this, lay.dragdrop);
  }

  captionsFor(mediaEl, url) {
    if (!this.captionBar) { this.captionBar = createCaptionBar(this.el, this.ctx); this.hasCaptions = true; }
    this.captionBar.bind(mediaEl, this.ctx.asset(url));
  }

  renderObject(obj, parent, layerId) {
    const { ctx, screen } = this;
    if (obj.kind === 'master') { parent.appendChild(smallLogo(ctx)); parent.appendChild(footer(ctx, ctx.content.footer.text)); return; }
    if (obj.kind === 'footer') { parent.appendChild(footer(ctx, ctx.content.footer.text)); return; }
    if (obj.container) return; // invisible holder of per-paragraph fragments
    const wrap = ctx.h('div', { class: 'obj', 'data-id': obj.id });
    wrap.style.cssText = `left:${obj.x}px;top:${obj.y}px;width:${obj.w}px;height:${obj.h}px;` + (obj.rot ? `transform:rotate(${obj.rot}deg);` : '') + (obj.alpha != null ? `opacity:${obj.alpha};` : '');
    if (obj.hidden) wrap.style.display = 'none';
    const node = { obj, wrap, layer: layerId, state: null, visited: false, hover: false, down: false };
    this.nodes.set(obj.id, node);

    switch (obj.kind) {
      case 'group': for (const c of obj.children || []) this.renderObject(c, wrap, layerId); break;
      case 'image': {
        const im = screen.images?.[obj.id];
        if (im) wrap.appendChild(ctx.h('img', { src: ctx.asset(im.src), alt: im.alt || '', draggable: 'false' }));
        break;
      }
      case 'shape': this.paintShape(node); break;
      case 'video': {
        const m = screen.media?.[obj.id] || {};
        const v = ctx.h('video', { playsinline: true, preload: 'auto', poster: m.poster ? ctx.asset(m.poster) : null, 'aria-label': m.alt || 'Video' });
        if (obj.video?.controls) v.controls = true;
        if (obj.video?.loop) v.loop = true;
        v.src = ctx.asset(m.src); v.volume = VOLUME;
        wrap.appendChild(v);
        this.media.set(obj.id, v);
        if (obj.video?.captions) this.captionsFor(v, obj.video.captions);
        if (!obj.on?.click) obj.on = { ...(obj.on || {}), click: [{ toggle: obj.id }] };
        break;
      }
      case 'web': {
        const yt = screen.links?.[obj.id]?.youtube;
        if (yt) wrap.appendChild(ctx.h('iframe', { src: `https://www.youtube-nocookie.com/embed/${yt}`, title: 'YouTube video', allow: 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share', referrerpolicy: 'strict-origin-when-cross-origin', allowfullscreen: true, loading: 'lazy' }));
        break;
      }
      case 'input': {
        const nf = screen.nameField || { placeholder: screen.text?.[obj.id]?.placeholder || '', fontSize: obj.input?.size || 24 };
        const input = nameField(ctx, { x: 0, y: 0, w: obj.w, h: obj.h, placeholder: nf.placeholder, fontSize: nf.fontSize });
        input.style.fontFamily = `var(--font-${obj.input?.font || 'calibri-bold'})`;
        input.style.color = obj.input?.color || '#fff';
        wrap.appendChild(input);
        break;
      }
      case 'slider': makeSlider(this, node); break;
      default: break;
    }

    if (obj.on?.click || obj.button) this.makeInteractive(node);
    parent.appendChild(wrap);
  }

  // shape = vector art (from paths.js) + optional text; redrawn when its state changes
  paintShape(node) {
    const { obj, wrap } = node;
    const { ctx, screen } = this;
    if (node.visual) node.visual.remove();
    if (node.textBox) node.textBox.remove();
    const pr = this.visualFor(node);
    if (obj.box) {
      const b = obj.box;
      wrap.style.background = b.fill || 'transparent';
      wrap.style.border = b.stroke ? `${b.strokeWidth || 1}px solid ${b.stroke}` : '';
      wrap.style.borderRadius = (b.radius || 0) + 'px';
      wrap.style.boxSizing = 'border-box';
    }
    if (pr != null) {
      const cs = ctx.paths.Lib['commandset-' + pr];
      const im = screen.images?.[obj.id];
      const image = im ? { url: ctx.asset(im.src), w: obj.img?.w || obj.w * 2, h: obj.img?.h || obj.h * 2 } : null;
      node.visual = svgFromCommandset(cs, { w: obj.w, h: obj.h, image });
      wrap.insertBefore(node.visual, wrap.firstChild);
    }
    if (obj.text) {
      const alt = node.state && obj.textStates?.[node.state];
      const style = alt || obj.text;
      const paras = alt ? screen.text?.[obj.id + '@' + node.state] : screen.text?.[obj.id];
      node.textBox = renderText(style, paras || [], ctx);
      wrap.appendChild(node.textBox);
    }
  }

  visualFor(node) {
    const { obj } = node;
    const st = obj.states || {};
    const cands = [];
    const v = node.visited ? 'Visited' : null;
    if (node.down) cands.push(v && `Hover_Down_${v}`, 'Hover_Down', v && `Down_${v}`, 'Down');
    else if (node.hover) cands.push(v && `Hover_${v}`, 'Hover');
    if (node.state && node.state !== '_default') cands.unshift(node.state);
    if (v) cands.push(v);
    for (const c of cands) if (c && st[c] != null) return st[c];
    return obj.svg;
  }

  makeInteractive(node) {
    const { wrap, obj } = node;
    wrap.classList.add('hot');
    wrap.setAttribute('role', 'button'); wrap.tabIndex = 0;
    if (obj.alt) wrap.setAttribute('aria-label', obj.alt);
    else if (obj.text && this.screen.text?.[obj.id]) wrap.setAttribute('aria-label', this.screen.text[obj.id].map(p => p.runs.map(r => r.t).join('')).join(' ').trim() || obj.id);
    const repaint = () => { if (obj.kind === 'shape' && obj.states) this.paintShape(node); };
    wrap.addEventListener('pointerenter', () => { node.hover = true; repaint(); });
    wrap.addEventListener('pointerleave', () => { node.hover = false; node.down = false; repaint(); });
    wrap.addEventListener('pointerdown', () => { node.down = true; repaint(); });
    wrap.addEventListener('pointerup', () => { node.down = false; repaint(); });
    const fire = (e) => {
      if (e.target.closest && e.target.closest('input, a, iframe')) return;
      if (obj.visitable) node.visited = true;
      this.run(obj.on?.click || [], node);
      repaint();
    };
    wrap.addEventListener('click', fire);
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(e); } });
  }

  /* ---------- actions ---------- */
  run(actions, from) {
    for (let i = 0; i < actions.length; i++) {
      const a = actions[i];
      if (a.show) this.show(a.show, a.anim);
      else if (a.hide) this.hide(a.hide, a.anim);
      else if (a.showLayer) this.showLayer(a.showLayer === 'self' ? from?.layer : a.showLayer, a.hideOthers);
      else if (a.hideLayer) this.hideLayer(a.hideLayer === 'self' ? from?.layer : a.hideLayer);
      else if (a.play) this.play(a.play);
      else if (a.pause) this.pause(a.pause === '_this' ? from?.obj.id : a.pause);
      else if (a.seek) { const m = this.media.get(a.seek); if (m) m.currentTime = 0; }
      else if (a.toggle) { const m = this.media.get(a.toggle); if (m) { m.paused ? this.play(a.toggle) : m.pause(); } }
      else if (a.openUrl) window.open(a.openUrl, '_blank', 'noopener');
      else if (a.goto !== undefined) { if (a.goto === 'next') this.ctx.next(); else if (a.goto === 'prev') this.ctx.prev(); else this.ctx.go(a.goto - 1); }
      else if (a.setState) {
        const next = actions[i + 1];
        if (next?.toggleBack && next.toggleBack.id === a.setState.id) { this.toggleState(a.setState.id, a.setState.state); i++; }
        else this.setState(a.setState.id, a.setState.state);
      }
      else if (a.toggleBack) this.toggleState(a.toggleBack.id, a.toggleBack.state);
    }
  }

  node(id) { return this.nodes.get(id.split('.').pop()); }

  show(id, animName) {
    const n = this.node(id); if (!n) return;
    n.wrap.style.display = '';
    const a = animName && n.obj.anims?.[animName];
    if (a) {
      const an = playAnim(n.wrap, a, { x: n.obj.x, y: n.obj.y });
      if (an) { this.anims.push(an); if (n.obj.on?.animEnd) an.onfinish = () => this.run(n.obj.on.animEnd, n); }
    }
    if (n.obj.on?.shown) this.run(n.obj.on.shown, n);
  }
  hide(id, animName) {
    const n = this.node(id); if (!n) return;
    const a = animName && n.obj.anims?.[animName];
    if (a) {
      const an = playAnim(n.wrap, a, { x: n.obj.x, y: n.obj.y }, a.type !== 'alpha');
      if (an) { this.anims.push(an); an.onfinish = () => { n.wrap.style.display = 'none'; an.cancel(); }; return; }
    }
    n.wrap.style.display = 'none';
  }
  setState(id, state) {
    const n = this.node(id); if (!n) return;
    n.state = state === '_default' ? null : state;
    if (n.obj.kind === 'shape') this.paintShape(n);
    n.wrap.dataset.state = n.state || '';
  }
  toggleState(id, state) {
    const n = this.node(id); if (!n) return;
    this.setState(id, n.state === state ? '_default' : state);
  }
  showLayer(id, hideOthers) {
    const L = this.layers.get(id); if (!L) return;
    if (hideOthers && hideOthers !== 'never') for (const [lid, o] of this.layers) if (lid !== id && o.open) this.hideLayer(lid);
    L.el.style.display = ''; L.open = true;
    this.run(L.def.onOpen || [], null);
    this.schedule(L.def.timeline || [], L);
    const first = L.el.querySelector('.hot'); if (first) first.focus({ preventScroll: true });
  }
  hideLayer(id) {
    const L = this.layers.get(id); if (!L) return;
    L.el.style.display = 'none'; L.open = false;
    for (const t of L.timers || []) clearTimeout(t);
    L.timers = [];
  }
  play(id) {
    const m = this.media.get(id); if (!m) return;
    m.volume = VOLUME;
    m.play().catch(() => { /* no gesture yet: the learner can click to play */ });
  }
  pause(id) { const m = this.media.get(id); if (m) m.pause(); }

  schedule(timeline, layer) {
    const bucket = layer ? (layer.timers = layer.timers || []) : this.timers;
    for (const entry of timeline) {
      if (entry.t <= 0) { this.run(entry.actions, null); continue; }
      bucket.push(setTimeout(() => { if (!this.disposed) this.run(entry.actions, null); }, entry.t));
    }
  }

  /* ---------- lifecycle ---------- */
  mount() {
    const { ctx, lay } = this;
    ctx.setCaptionsAvailable(!!this.hasCaptions);
    // autoplaying videos start with the screen
    for (const [id, n] of this.nodes) if (n.obj.kind === 'video' && n.obj.video?.autoplay && !n.obj.hidden) this.play(id);
    this.schedule(lay.timeline || [], null);
    if (this.dragdrop) this.dragdrop.mount();
  }
  dispose() {
    this.disposed = true;
    for (const t of this.timers) clearTimeout(t);
    for (const L of this.layers.values()) for (const t of L.timers || []) clearTimeout(t);
    for (const a of this.anims) { try { a.cancel(); } catch { /* finished */ } }
    for (const m of this.media.values()) { try { m.pause(); m.removeAttribute('src'); m.load(); } catch { /* ignore */ } }
    if (this.captionBar) this.captionBar.dispose();
    if (this.dragdrop) this.dragdrop.dispose();
    this.ctx.setCaptionsAvailable(false);
    this.ctx.setSubmit(null);
  }
}

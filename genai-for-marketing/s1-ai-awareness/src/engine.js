// Engine: fixed 16:9 stage scaled like the Storyline player, PREV/NEXT, progress, slide menu,
// keyboard arrows, swipe, per-screen entrance transitions, learner name.
// Content (text, images, links) comes from content/s1.json; design never does.
import { components } from './components/index.js';
import { nameStore, withName } from './store.js';

const SLIDE_W = 960, SLIDE_H = 540;
const DESKTOP = { barH: 65, topPad: 15, sidePad: 10 };
const COMPACT = { barH: 48, topPad: 8, sidePad: 6 };
const COMPACT_BELOW = 600; // player narrower than this: compact chrome

const ICON = {
  prev: '<svg width="10" height="18" viewBox="0 -1 10 18" aria-hidden="true" focusable="false"><path transform="translate(0,1)" d="M2.81685219,7.60265083 L9.00528946,1.41421356 L7.5910759,0 L0,7.5910759 L0.0115749356,7.60265083 L0,7.61422577 L7.5910759,15.2053017 L9.00528946,13.7910881 L2.81685219,7.60265083 Z"/></svg>',
  next: '<svg width="10" height="18" viewBox="0 -1 10 18" aria-hidden="true" focusable="false"><path transform="rotate(180,5,8)" d="M2.81685219,7.60265083 L9.00528946,1.41421356 L7.5910759,0 L0,7.5910759 L0.0115749356,7.60265083 L0,7.61422577 L7.5910759,15.2053017 L9.00528946,13.7910881 L2.81685219,7.60265083 Z"/></svg>',
  menu: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><rect y="1" width="14" height="2"/><rect y="6" width="14" height="2"/><rect y="11" width="14" height="2"/></svg>',
  fsOpen: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M1.99 2.3H5.1V0.4H0.1V5.2H1.9L1.9 2.3Z"/><path d="M5.1 11.8H1.9V8.9H0.1V13.6H5.1L5.1 11.8Z"/><path d="M11.5 11.8H8.4V13.6H13.3V8.9H11.5L11.5 11.8Z"/><path d="M8.4 2.3H11.5V5.2H13.3V0.4H8.4L8.4 2.3Z"/></svg>',
  cc: '<svg width="19" height="16" viewBox="0 0 19 16" aria-hidden="true" focusable="false"><rect x="0.5" y="0.5" width="18" height="15" rx="2" fill="none" stroke="currentColor"/><path d="M8.2 5.3Q7.6 4.6 6.6 4.6 5.2 4.6 4.6 5.4 4 6.2 4 8 4 9.8 4.6 10.6 5.2 11.4 6.6 11.4 7.7 11.4 8.3 10.6L7.4 9.8Q7.1 10.2 6.6 10.2 6 10.2 5.7 9.7 5.4 9.2 5.4 8 5.4 6.8 5.7 6.3 6 5.8 6.6 5.8 7.1 5.8 7.4 6.2Z"/><path d="M14.7 5.3Q14.1 4.6 13.1 4.6 11.7 4.6 11.1 5.4 10.5 6.2 10.5 8 10.5 9.8 11.1 10.6 11.7 11.4 13.1 11.4 14.2 11.4 14.8 10.6L13.9 9.8Q13.6 10.2 13.1 10.2 12.5 10.2 12.2 9.7 11.9 9.2 11.9 8 11.9 6.8 12.2 6.3 12.5 5.8 13.1 5.8 13.6 5.8 13.9 6.2Z"/></svg>',
  submit: '<svg width="12" height="18" viewBox="0 0 12 18" aria-hidden="true" focusable="false"><path d="M1 9.5l3.2 3.2L11 5.5l-1.4-1.4-5.4 5.4-1.8-1.8z"/></svg>',
  fsClose: '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M3.3 0.4H5.1V5.2H0.1V3.4H3.3Z"/><path d="M0.1 8.9H5.1V13.6H3.3V10.7H0.1Z"/><path d="M8.4 8.9H13.3V10.7H10.2V13.6H8.4Z"/><path d="M8.4 0.4H10.2V3.4H13.3V5.2H8.4Z"/></svg>',
};

const h = (tag, attrs = {}, html = '') => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (v !== null && v !== undefined && v !== false) el.setAttribute(k, v === true ? '' : v);
  }
  if (html) el.innerHTML = html;
  return el;
};

export async function boot(root) {
  const [content, layout, paths] = await Promise.all([
    fetch(new URL('../content/s1.json', import.meta.url)).then(r => { if (!r.ok) throw new Error('content/s1.json not found (' + r.status + ')'); return r.json(); }),
    fetch(new URL('./screens/layout.json', import.meta.url)).then(r => { if (!r.ok) throw new Error('layout.json not found'); return r.json(); }),
    loadPaths(),
  ]);
  const player = new Player(root, content, layout, paths);
  player.mount();
  return player;
}

// The original's vector art lives in paths.js, which calls window.globalProvideData('paths', json).
// Load it as a plain script (allowed by the page's CSP) and parse the JSON it hands over.
function loadPaths() {
  return new Promise((resolve, reject) => {
    window.globalProvideData = (key, json) => { if (key === 'paths') resolve(JSON.parse(json)); };
    const s = document.createElement('script');
    s.src = new URL('../source/storyline-published/html5/data/js/paths.js', import.meta.url).href;
    s.onerror = () => reject(new Error('paths.js failed to load'));
    document.head.appendChild(s);
  });
}

class Player {
  constructor(root, content, layout, paths) {
    this.root = root;
    this.content = content;
    this.layoutData = layout;
    this.paths = paths;
    this.cc = true;                 // captions on (the avatar videos are captioned)
    this.ccListeners = new Set();
    this.submitHandler = null;
    this.screens = content.screens;
    this.total = this.screens.length;
    this.index = 0;
    this.viewed = new Set();
    this.current = null; // { screen, el, component, dispose }
    this.navHidden = false;
    this.ctx = {
      content,
      total: this.total,
      next: () => this.next(),
      prev: () => this.prev(),
      go: (n) => this.go(n),
      asset: (p) => new URL('../' + p, import.meta.url).href,
      name: nameStore,
      withName: (t) => withName(t, nameStore.get()),
      hideNav: (hidden) => this.setNavHidden(hidden),
      setNavHidden: (hidden) => this.setNavHidden(hidden),
      setSubmit: (fn) => this.setSubmit(fn),
      setCaptionsAvailable: (on) => { this.ccBtn.style.display = on ? '' : 'none'; },
      cc: { get: () => this.cc, on: (cb) => { this.ccListeners.add(cb); return () => this.ccListeners.delete(cb); } },
      layout,
      paths,
      h,
    };
  }

  mount() {
    const r = this.root;
    r.innerHTML = '';
    r.setAttribute('role', 'application');
    r.setAttribute('aria-label', this.content.course.title);
    r.tabIndex = -1;

    this.stageWrap = h('div', { class: 'stage-wrap' });
    this.stage = h('div', { class: 'stage', role: 'region', 'aria-live': 'polite', 'aria-label': 'Slide', tabindex: '-1' });
    this.stageWrap.appendChild(this.stage);
    r.appendChild(this.stageWrap);

    // bottom bar
    this.bar = h('section', { class: 'bottom-bar', 'aria-label': 'Navigation' });
    this.progress = h('div', { class: 'progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': this.total, 'aria-label': 'Course progress' }, '<span></span>');
    this.bar.appendChild(this.progress);

    const left = h('div', { class: 'nav-left' });
    this.menuBtn = h('button', { class: 'cs-button', type: 'button', 'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'slide-menu' }, ICON.menu + '<span class="label">Menu</span>');
    left.appendChild(this.menuBtn);
    this.bar.appendChild(left);

    const right = h('div', { class: 'nav-controls' });
    this.ccBtn = h('button', { class: 'cs-button icon-only', type: 'button', 'aria-label': 'Hide captions', 'aria-pressed': 'true', style: 'display:none' }, ICON.cc);
    right.appendChild(this.ccBtn);
    this.submitBtn = h('button', { class: 'cs-button', type: 'button', 'aria-label': 'Submit', style: 'display:none' }, '<span class="label">Submit</span>' + ICON.submit);
    this.fsBtn = h('button', { class: 'cs-button icon-only', type: 'button', 'aria-label': 'Enter full-screen' }, ICON.fsOpen);
    this.prevBtn = h('button', { class: 'cs-button', type: 'button', 'aria-label': 'Previous' }, ICON.prev + '<span class="label">Prev</span>');
    this.nextBtn = h('button', { class: 'cs-button', type: 'button', 'aria-label': 'Next' }, '<span class="label">Next</span>' + ICON.next);
    if (document.fullscreenEnabled) right.appendChild(this.fsBtn);
    right.appendChild(this.prevBtn);
    right.appendChild(this.nextBtn);
    right.appendChild(this.submitBtn);
    this.bar.appendChild(right);
    r.appendChild(this.bar);

    // menu panel
    this.menu = h('nav', { class: 'menu-panel', id: 'slide-menu', 'data-open': 'false', 'aria-label': 'Slide menu' });
    this.menu.appendChild(h('div', { class: 'menu-head' }, `<span>Menu</span><span class="count">${this.total} screens</span>`));
    const list = h('ol', { class: 'menu-list' });
    this.menuItems = this.screens.map((s, i) => {
      const li = h('li');
      const b = h('button', { class: 'menu-item', type: 'button', 'data-index': i }, `<span class="num">${s.n}</span><span class="t"></span>`);
      b.querySelector('.t').textContent = withName(s.title, nameStore.get());
      b.addEventListener('click', () => { this.closeMenu(); this.go(i); });
      li.appendChild(b);
      list.appendChild(li);
      return b;
    });
    this.menu.appendChild(list);
    r.appendChild(this.menu);

    // events
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    this.menuBtn.addEventListener('click', () => this.toggleMenu());
    this.fsBtn.addEventListener('click', () => this.toggleFullscreen());
    this.ccBtn.addEventListener('click', () => this.toggleCaptions());
    this.submitBtn.addEventListener('click', () => { if (this.submitHandler) this.submitHandler(); });
    document.addEventListener('fullscreenchange', () => this.syncFullscreenIcon());
    document.addEventListener('keydown', (e) => this.onKey(e));
    r.addEventListener('pointerdown', (e) => { if (this.menu.dataset.open === 'true' && !this.menu.contains(e.target) && e.target !== this.menuBtn && !this.menuBtn.contains(e.target)) this.closeMenu(); });
    this.bindSwipe();

    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(r);
    this.layout();

    const q = new URLSearchParams(location.search).get('screen');
    const start = q ? Math.min(Math.max(parseInt(q, 10) - 1, 0), this.total - 1) : 0;
    this.go(start, { initial: true });
  }

  /* ---- layout: Storyline's rule — fixed bottom bar, slide fits the rest, 15px above, ≥10px at the sides ---- */
  layout() {
    const W = this.root.clientWidth, H = this.root.clientHeight;
    if (!W || !H) return;
    const compact = W < COMPACT_BELOW;
    this.root.classList.toggle('compact', compact);
    const m = compact ? COMPACT : DESKTOP;
    const availW = W - 2 * m.sidePad, availH = H - m.barH - m.topPad;
    const scale = Math.max(0.05, Math.min(availW / SLIDE_W, availH / SLIDE_H));
    const sw = SLIDE_W * scale, sh = SLIDE_H * scale;
    const left = (W - sw) / 2;
    const heightLimited = availH / SLIDE_H <= availW / SLIDE_W;
    const top = heightLimited ? m.topPad : m.topPad + (availH - sh) / 2;
    this.stageWrap.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
    this.scale = scale;
    // progress line sits right under the slide, as wide as the slide
    this.progress.style.left = left + 'px';
    this.progress.style.width = sw + 'px';
  }

  /* ---- navigation ---- */
  go(i, opts = {}) {
    if (i < 0 || i >= this.total) return;
    const screen = this.screens[i];
    const prevCurrent = this.current;
    this.index = i;
    this.viewed.add(i);

    this.setSubmit(null);
    const def = components[screen.type] || components.placeholder;
    const el = h('div', { class: 'screen', 'data-n': screen.n, 'data-type': screen.type });
    const inst = def.render(screen, this.ctx, el) || {};
    this.setNavHidden(!!def.hideNav);

    const t = screen.transition || { type: 'none' };
    if (t.type === 'fade') {
      el.classList.add('enter-fade');
      el.style.animationDuration = (t.ms || 750) + 'ms';
    }
    if (prevCurrent) {
      try { prevCurrent.dispose && prevCurrent.dispose(); } catch (e) { console.warn(e); }
      prevCurrent.el.remove();
    }
    this.stage.appendChild(el);
    this.current = { screen, el, dispose: inst.dispose };
    if (inst.mount) inst.mount();

    this.updateChrome();
    if (!opts.initial) {
      // move focus to the slide region so keyboard users continue from the new screen
      this.stage.focus({ preventScroll: true });
      try { history.replaceState(null, '', `?screen=${screen.n}`); } catch { /* file:// or sandbox */ }
    }
  }
  next() { if (this.index < this.total - 1) this.go(this.index + 1); }
  prev() { if (this.index > 0) this.go(this.index - 1); }

  updateChrome() {
    const n = this.index + 1;
    this.progress.querySelector('span').style.width = (n / this.total * 100) + '%';
    this.progress.setAttribute('aria-valuenow', n);
    this.progress.setAttribute('aria-valuetext', `Screen ${n} of ${this.total}`);
    this.prevBtn.setAttribute('aria-disabled', this.index === 0 ? 'true' : 'false');
    this.nextBtn.setAttribute('aria-disabled', this.index === this.total - 1 ? 'true' : 'false');
    this.menuItems.forEach((b, i) => {
      b.setAttribute('aria-current', i === this.index ? 'true' : 'false');
      b.classList.toggle('viewed', this.viewed.has(i));
      b.querySelector('.t').textContent = withName(this.screens[i].title, nameStore.get());
    });
    document.title = `${withName(this.screens[this.index].title, nameStore.get())} · ${this.content.course.shortTitle}`;
  }

  setNavHidden(hidden) {
    this.navHidden = hidden;
    this.prevBtn.style.display = hidden ? 'none' : '';
    this.nextBtn.style.display = hidden ? 'none' : '';
  }
  setSubmit(fn) {
    this.submitHandler = fn;
    this.submitBtn.style.display = fn ? '' : 'none';
  }
  toggleCaptions() {
    this.cc = !this.cc;
    this.ccBtn.setAttribute('aria-pressed', String(this.cc));
    this.ccBtn.setAttribute('aria-label', this.cc ? 'Hide captions' : 'Show captions');
    this.ccBtn.classList.toggle('off', !this.cc);
    for (const cb of this.ccListeners) cb(this.cc);
  }

  /* ---- menu ---- */
  toggleMenu() { this.menu.dataset.open === 'true' ? this.closeMenu() : this.openMenu(); }
  openMenu() {
    this.menu.dataset.open = 'true';
    this.menuBtn.setAttribute('aria-expanded', 'true');
    const cur = this.menuItems[this.index];
    cur.scrollIntoView({ block: 'nearest' });
    cur.focus();
  }
  closeMenu() {
    if (this.menu.dataset.open !== 'true') return;
    this.menu.dataset.open = 'false';
    this.menuBtn.setAttribute('aria-expanded', 'false');
  }

  /* ---- fullscreen ---- */
  toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else this.root.requestFullscreen?.().catch(() => { this.fsBtn.style.display = 'none'; }); // not allowed here (e.g. an embed without allowfullscreen)
  }
  syncFullscreenIcon() {
    const on = !!document.fullscreenElement;
    this.fsBtn.innerHTML = on ? ICON.fsClose : ICON.fsOpen;
    this.fsBtn.setAttribute('aria-label', on ? 'Exit full-screen' : 'Enter full-screen');
  }

  /* ---- keyboard: arrows move, Escape closes the menu. Typing in a field is left alone. ---- */
  onKey(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if (e.key === 'Escape' && this.menu.dataset.open === 'true') { this.closeMenu(); this.menuBtn.focus(); e.preventDefault(); return; }
    if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('[data-keys]')) return; // a component that owns arrow keys (slider, carousel)
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { this.next(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { this.prev(); e.preventDefault(); }
  }

  /* ---- swipe (touch): horizontal flick on the slide moves prev/next ---- */
  bindSwipe() {
    let start = null;
    this.stageWrap.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      if (e.target.closest('[data-no-swipe], input, textarea, button, a, video, audio, [role=button], [role=slider], .drag-item')) { start = null; return; }
      start = { x: e.clientX, y: e.clientY, t: Date.now() };
    });
    this.stageWrap.addEventListener('pointerup', (e) => {
      if (!start || e.pointerType !== 'touch') return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y, dt = Date.now() - start.t;
      start = null;
      if (dt > 800 || Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      dx < 0 ? this.next() : this.prev();
    });
    this.stageWrap.addEventListener('pointercancel', () => { start = null; });
  }
}

// Builds the screen layouts from the published Storyline block.
//   src/screens/layout.json  — design: object geometry, shapes (refs into paths.js), text styles,
//                              layers, timeline, animations, triggers, slider/drag-drop wiring.
//   content/s1.json          — content: every text (per object id), image, media and link,
//                              merged into the existing file (screen 1 and the header are kept).
// Also applies the "newer wins" decisions of the work-order (section 7): screens 13, 22, 28.
// Run:  node tools/extract-screens.mjs
import { load } from './storyline.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const JS = join(root, 'source/storyline-published/html5/data/js');
const SC = join(root, 'source/storyline-published/story_content');
const data = load(join(JS, 'data.js'));
const paths = load(join(JS, 'paths.js'));
const slides = data.scenes[0].slides;
const asset = (id) => data.assetLib.find(a => a.id === id);
const assetPath = (id) => { const a = asset(id); return a ? 'source/storyline-published/' + a.url : null; };
const px = (pt) => Math.round(pt * 4 / 3 * 100) / 100;
const MASTER_IDS = new Set(['5cyH4t6JCxt', '6nfcoSKLifG', '5ntBxrdGw5E', '5WqhO9hryMY']);
const isFooterGroup = (o) => o.kind === 'objgroup' && o.yPos === 513 && o.width === 960 && (o.objects || []).every(c => c.imagelib && [5, 6].includes(c.imagelib[0]?.assetId));
const isYearLine = (o) => o.textLib && JSON.stringify(o.textLib).includes('2024 © Oded Israeli');
const hasCaptions = (id) => existsSync(join(SC, id + '_captions.js')) ? `assets/captions/${id}.vtt` : null;
const YOUTUBE = {}; // webobject html → youtube id
for (const f of ['67naOSTSqsB', '6NyRGHrifzK', '6T2Z6vKZjpW']) {
  const html = readFileSync(join(SC, f + '.html'), 'utf8');
  YOUTUBE[f] = /youtube\.com\/embed\/([A-Za-z0-9_-]+)/.exec(html)?.[1] || null;
}

// ---------- fonts & text ----------
const fontKey = (family, bold) => {
  const f = (family || '').replace(/"/g, '');
  if (/^Open Sans/.test(f)) return /Bold/.test(f) || bold ? 'open-sans-bold' : 'open-sans';
  if (/^Arial/.test(f)) return /Bold/.test(f) || bold ? 'arial-bold' : 'arial';
  if (/^Lato/.test(f)) return /Bold/.test(f) || bold ? 'lato-bold' : 'lato';
  return /Bold/.test(f) || bold ? 'calibri-bold' : 'calibri';
};
const NATURAL = { calibri: 1.2207, 'calibri-bold': 1.2207, arial: 1.1499, 'arial-bold': 1.1499, 'open-sans': 1.3618, 'open-sans-bold': 1.3618, lato: 1.2, 'lato-bold': 1.2 };
function lineHeight(style, size, font) {
  const nat = NATURAL[font] * size;
  const rule = style.lineSpacingRule, v = style.lineSpacing;
  if (rule === 'atLeast') return Math.round(Math.max(v || 0, nat) * 100) / 100;
  if (rule === 'multiple') return Math.round(nat * ((v || 20) / 20) * 100) / 100;
  if (rule === 'singlePt5') return Math.round(nat * 1.5 * 100) / 100;
  if (rule === 'double') return Math.round(nat * 2 * 100) / 100;
  if (rule === 'exact' || rule === 'exactly') return v;
  return Math.round(nat * 100) / 100;
}
const clean = (t) => (t || '').replace(/\^%\^/g, '%').replace(/%_player\.LeanerName%/g, '{name}').replace(/\r\n/g, '\n');

// returns { style: {paragraphs...}, content: [ {runs:[...]} ] }
function renderedFontScale(tl) {
  const pr = tl.vectortext?.pr; if (!pr || pr.l !== 'Lib') return 1;
  const sizes = [];
  (function v(m) { if (!m || typeof m !== 'object') return; if (Array.isArray(m)) { m.forEach(v); return; } if (m.nodeType === 'text' && m['font-size']) sizes.push(parseFloat(m['font-size'])); for (const k of Object.keys(m)) if (typeof m[k] === 'object') v(m[k]); })(paths.Lib['commandset-' + pr.i]);
  const declared = [];
  for (const b of tl.vartext?.blocks || []) for (const sp of b.spans || []) if (sp.style?.fontSize && sp.text && sp.text.trim()) declared.push(px(sp.style.fontSize));
  if (!sizes.length || !declared.length) return 1;
  const ratio = Math.max(...sizes) / Math.max(...declared);
  return ratio < 0.98 ? ratio : 1;
}

function textOf(tl) {
  const vt = tl.vartext; if (!vt) return null;
  const fit = renderedFontScale(tl);
  const fitPx = (v) => Math.round(v * fit * 100) / 100;
  const base = vt.defaultBlockStyle?.baseSpanStyle || {};
  const paragraphs = [], content = [];
  for (const b of vt.blocks) {
    const st = b.style || {};
    const spans = (b.spans || []).filter(s => s.text !== undefined);
    const first = spans.find(s => s.style && (s.style.fontSize || s.style.fontFamily)) || spans[0] || { style: {} };
    const fs = first.style || {};
    const size = fitPx(px(fs.fontSize || base.fontSize || 12));
    const font = fontKey(fs.fontFamily || base.fontFamily, fs.fontIsBold ?? base.fontIsBold);
    const color = fs.foregroundColor || base.foregroundColor || '#000000';
    const ls = st.listStyle;
    const para = {
      align: st.justification || vt.defaultBlockStyle?.justification || 'left',
      lh: lineHeight(st, size, font),
      sb: Math.round((st.spacingBefore || 0) * 4 / 3 * 100) / 100,
      sa: Math.round((st.spacingAfter || 0) * 4 / 3 * 100) / 100,
      indent: Math.round((st.leadingMargin || 0) * 2 / 3 * 100) / 100,
      first: Math.round((st.firstLineMargin || 0) * 2 / 3 * 100) / 100,
      font, size, color,
    };
    if (ls && ls.listType && ls.listType !== 'none') para.bullet = { char: String.fromCharCode(ls.bulletChar || 8226), color: ls.color || color, font: fontKey(ls.bulletFont, false) };
    paragraphs.push(para);
    const runs = [];
    for (const s of spans) {
      const ss = s.style || {};
      let text = clean(s.text);
      // a paragraph break at the end of a run is structure, not text
      text = text.replace(/\n$/, '');
      if (!text && spans.length > 1) continue;
      const r = { t: text };
      const rf = fontKey(ss.fontFamily || fs.fontFamily || base.fontFamily, ss.fontIsBold ?? false);
      if (rf !== font) r.font = rf;
      if (ss.fontSize && fitPx(px(ss.fontSize)) !== size) r.size = fitPx(px(ss.fontSize));
      if (ss.foregroundColor && ss.foregroundColor !== color) r.color = ss.foregroundColor;
      if (ss.fontIsItalic) r.i = true;
      if (ss.fontIsUnderline) r.u = true;
      runs.push(r);
    }
    content.push({ runs });
  }
  return { style: { x: tl.xPos, y: tl.yPos, w: tl.width, h: tl.height, valign: tl.valign || 'top', shadow: !!tl.textshadow, paragraphs }, content };
}

// ---------- vector shapes ----------
const svgOf = (pr) => (pr && pr.l === 'Lib' ? pr.i : null);
const trivialImageFrame = (pr) => {
  const cs = paths.Lib['commandset-' + pr]; if (!cs) return false;
  const kids = cs.children || [];
  return kids.length === 2 && kids[0].nodeType === 'path' && kids[0].fill === 'none' && !kids[0].stroke && kids[1].nodeType === 'image';
};

// ---------- actions ----------
const stripRef = (v) => (v || '').replace(/^(_parent\.)+/, '').replace(/^_player\.[^.]+\./, '');
function mapActions(acts, ctx) {
  const out = [];
  for (const a of acts || []) {
    switch (a.kind) {
      case 'show_slidelayer': { const ref = a.objRef?.value || ''; out.push({ showLayer: ref === '_parent' ? 'self' : stripRef(ref), hideOthers: a.hideOthers || 'never', anim: a.transition === 'custom' ? a.animationId : null }); break; }
      case 'hide_slidelayer': { const ref = a.objRef?.value || ''; out.push({ hideLayer: ref === '_parent' ? 'self' : stripRef(ref) }); break; }
      case 'show': out.push({ show: stripRef(a.objRef?.value), anim: a.transition === 'custom' ? a.animationId : null }); break;
      case 'hide': out.push({ hide: stripRef(a.objRef?.value), anim: a.transition === 'custom' ? a.animationId : null }); break;
      case 'media_play': out.push({ play: stripRef(a.objRef?.value) }); break;
      case 'media_pause': out.push({ pause: stripRef(a.objRef?.value) }); break;
      case 'media_seek': out.push({ seek: stripRef(a.objRef?.value) }); break;
      case 'media_toggle': out.push({ toggle: stripRef(a.objRef?.value) === '_this' ? ctx.self : stripRef(a.objRef?.value) }); break;
      case 'open_url': out.push({ openUrl: a.url }); break;
      case 'gotoplay': { const id = (a.objRef?.value || '').split('.').pop(); const i = slides.findIndex(s => s.id === id); out.push({ goto: i >= 0 ? i + 1 : 'next' }); break; }
      case 'history_prev': out.push({ goto: 'prev' }); break;
      case 'exe_actiongroup': if (/ActGrpSetVisitedState$/.test(a.id)) out.push({ visited: true }); break;
      case 'adjustvar': { const m = /^(?:_parent\.)*([A-Za-z0-9]+)\._state$/.exec(a.variable || ''); if (m && a.operator === 'set') out.push({ setState: { id: m[1], state: a.value?.value } }); break; }
      case 'if_action': {
        // "if state == V then (keep) else set V" → set V ; "if _savevisited then set default" → toggle back
        const cond = JSON.stringify(a.condition || {});
        if (/_savevisited/.test(cond)) { const inner = mapActions(a.thenActions, ctx).find(x => x.setState); if (inner) out.push({ toggleBack: inner.setState }); break; }
        if (/\$OnStage/.test(cond)) { out.push(...mapActions(a.thenActions, ctx)); break; }
        if (/#_state/.test(cond)) { out.push(...mapActions(a.elseActions, ctx)); break; }
        out.push(...mapActions(a.thenActions, ctx)); break;
      }
      default: break;
    }
  }
  // collapse duplicates
  const seen = new Set();
  return out.filter(x => { const k = JSON.stringify(x); if (seen.has(k)) return false; seen.add(k); return true; });
}

// ---------- animations ----------
function animOf(an) {
  const tw = an.tweens?.[0]; if (!tw) return null;
  const easing = ({ linear: 'linear', cubic: 'cubic-bezier(0.33,1,0.68,1)', quadradic: 'cubic-bezier(0.45,0,0.55,1)' })[tw.alpha?.easing || tw.position?.easing || tw.scale?.easing || tw.mask?.easing || 'linear'] || 'linear';
  const out = { ms: an.duration, easing };
  if (tw.alpha) { out.type = 'alpha'; out.from = +tw.alpha.path[0].start; out.to = +tw.alpha.path[0].end; }
  else if (tw.position) {
    const seg = tw.position.path[0];
    if (/^\$/.test(seg.anchora.x)) out.type = 'slide', out.dx = +seg.anchora.dx, out.dy = +seg.anchora.dy;
    else out.type = 'move', out.from = { x: +seg.anchora.x, y: +seg.anchora.y }, out.to = { x: +seg.anchorb.x, y: +seg.anchorb.y };
  }
  else if (tw.scale) { out.type = 'scale'; out.from = 1 + (+tw.scale.path[0].dsx) / 100; }
  else if (tw.mask) { out.type = 'wipe'; out.direction = tw.mask.settings?.find(s => s.name === 'direction')?.value || 'fromtop'; }
  else return null;
  return out;
}

// ---------- objects ----------
function convertObject(o, ctx) {
  if (MASTER_IDS.has(o.id)) { ctx.hasMaster = true; return null; }
  if (isFooterGroup(o)) return { kind: 'footer', id: o.id };
  if (isYearLine(o)) return null;
  const obj = { id: o.id, x: o.xPos, y: o.yPos, w: o.width, h: o.height };
  if (o.rotation) obj.rot = o.rotation;
  if (o.alpha != null && o.alpha !== 100) obj.alpha = o.alpha / 100;
  if (o.altText) obj.alt = o.altText;
  const pr = svgOf(o.data?.vectorData?.pr);
  if (o.kind === 'objgroup') {
    obj.kind = 'group';
    obj.children = (o.objects || []).map(c => convertObject(c, ctx)).filter(Boolean);
  } else if (o.kind === 'table') {
    obj.kind = 'group';
    obj.children = (o.objects || []).map(c => convertObject(c, ctx)).filter(Boolean);
    // table cells: the text box is smaller than the cell; the original centres it (cell padding)
    for (const c of obj.children) if (c.text && c.text.w < c.w) { c.text.x = Math.round((c.w - c.text.w) / 2 * 100) / 100; c.text.y = Math.round((c.h - c.text.h) / 2 * 100) / 100; }
  } else if (o.kind === 'video') {
    obj.kind = 'video';
    const vd = o.data.videodata;
    ctx.content.media[o.id] = { src: assetPath(vd.assetId), poster: assetPath(vd.posterAssetId), alt: vd.altText || '' };
    obj.video = { autoplay: !!o.autoplay, controls: !!o.showcontrols, loop: !!o.loop, captions: hasCaptions(o.id) };
  } else if (o.kind === 'webobject') {
    obj.kind = 'web';
    const file = (o.url || '').replace(/^story_content\//, '').replace(/\.html$/, '');
    ctx.content.links[o.id] = { youtube: YOUTUBE[file] || null };
  } else if (o.kind === 'textinput') {
    obj.kind = 'input';
    obj.input = { font: fontKey(o.font, o.bold), size: o.fontsize, color: '#' + String(o.textcolor).replace(/^0x/, ''), align: o.align, border: pr };
    ctx.content.text[o.id] = { placeholder: o.placeholder };
  } else if (o.kind === 'stategroup' && o.objects?.some(c => c.accType === 'slider')) {
    obj.kind = 'slider';
    const thumb = o.objects.find(c => c.accType === 'slider'), track = o.objects.find(c => /_track$/.test(c.id));
    const dp = thumb.dragpath;
    obj.slider = { min: dp.startvalue, max: dp.endvalue, step: dp.increment, initial: dp.initialValue, bind: stripRef(dp.bindto).replace(/^_player\./, ''), pathEnd: +dp.path[0].anchorb.x,
      thumb: { x: thumb.xPos, y: thumb.yPos, w: thumb.width, h: thumb.height, svg: svgOf(thumb.data?.vectorData?.pr), hover: svgOf(thumb.states?.find(s => /Hover/.test(s.name))?.data?.vectorData?.pr) },
      track: { x: track.xPos, y: track.yPos, w: track.width, h: track.height, svg: svgOf(track.data?.vectorData?.pr) }, thresholds: [] };
    for (const ev of o.events || []) if ((ev.eventName || ev.kind) === 'onvarchanged') for (const a of ev.actions || []) {
      const cond = JSON.stringify(a.condition || {});
      const gte = /"operator":"gte"[^}]*"valueb":(\d+)/.exec(cond);
      const lte = /"operator":"lte"[^}]*"valueb":(\d+)/.exec(cond);
      const layer = a.thenActions?.find(x => x.kind === 'show_slidelayer');
      if (gte && layer) obj.slider.thresholds.push({ min: +gte[1], max: lte ? +lte[1] : obj.slider.max, layer: stripRef(layer.objRef.value) });
    }
    obj.slider.thresholds.sort((a, b) => a.min - b.min);
  } else {
    // vectorshape: image, text, shape, button
    if (o.imagelib && pr != null && trivialImageFrame(pr)) {
      obj.kind = 'image';
      ctx.content.images[o.id] = { src: assetPath(o.imagelib[0].assetId), alt: o.imagelib[0].altText || o.altText || '' };
    } else {
      obj.kind = 'shape';
      obj.svg = pr;
      if (o.imagelib) { const a = asset(o.imagelib[0].assetId); ctx.content.images[o.id] = { src: assetPath(o.imagelib[0].assetId), alt: o.imagelib[0].altText || '' }; obj.img = { w: a?.width || o.width * 2, h: a?.height || o.height * 2 }; }
    }
    if (o.textLib && o.textLib.length) {
      const main = textOf(o.textLib[0]);
      if (main) { obj.text = main.style; ctx.content.text[o.id] = main.content; }
      // a second textLib is the text of an alternate state (e.g. "with AI")
      if (o.textLib[1]) {
        const alt = textOf(o.textLib[1]);
        const stName = (o.states || []).map(s => s.name).find(n => !/^_default/.test(n)) || 'alt';
        if (alt) { obj.textStates = { [stName]: alt.style }; ctx.content.text[o.id + '@' + stName] = alt.content; }
      }
    }
    if (o.accType === 'button' || o.useHandCursor && (o.events || []).some(e => e.eventName === 'onrelease')) obj.button = true;
  }
  if (o.states && o.states.length) {
    obj.states = {};
    for (const s of o.states) {
      const spr = svgOf(s.data?.vectorData?.pr);
      const name = s.name.replace(/^_default_/, '').replace(/^_default$/, 'default');
      if (spr != null && spr !== pr) obj.states[name] = spr;
    }
    if (!Object.keys(obj.states).length) delete obj.states;
  }
  if (o.animations && o.animations.length) {
    obj.anims = {};
    for (const an of o.animations) { const a = animOf(an); if (a) obj.anims[an.id] = a; }
  }
  const evName = (e) => e.eventName || e.kind;
  const click = (o.events || []).filter(e => evName(e) === 'onrelease' || evName(e) === 'onlinkrelease').flatMap(e => mapActions(e.actions, { self: o.id }));
  const press = (o.events || []).filter(e => evName(e) === 'onpress').flatMap(e => mapActions(e.actions, { self: o.id })).filter(a => a.toggle);
  const all = [...click, ...press.filter(p => !click.some(c => c.pause || c.play))];
  if (all.length) obj.on = { click: all.filter(a => !(a.visited)) };
  if (click.some(a => a.visited)) obj.visitable = true;
  if (obj.on && !obj.on.click.length) delete obj.on;
  // hooks used by demo animations: actions when the object has been shown, and when its entrance animation ends
  const shown = (o.events || []).filter(e => evName(e) === 'ontransitionin').flatMap(e => mapActions(e.actions, { self: o.id })).filter(a => a.hide || (a.show && a.show !== '_this'));
  const animEnd = (o.events || []).filter(e => evName(e) === 'onanimationcomplete').flatMap(e => mapActions(e.actions, { self: o.id })).filter(a => a.hide || a.show || a.setState).map(a => a.hide === '_this' ? { hide: o.id, anim: a.anim } : a);
  if (shown.length) obj.on = { ...(obj.on || {}), shown };
  if (animEnd.length) obj.on = { ...(obj.on || {}), animEnd };
  // drag & drop wiring
  const dc = (o.events || []).find(e => evName(e) === 'ondragconnect');
  if (dc) {
    const cond = JSON.stringify(dc.actions?.[0]?.condition || {});
    const target = /"valueb":"([A-Za-z0-9]+)"/.exec(cond)?.[1];
    const lights = /_parent\.([A-Za-z0-9]+)\.\$OnStage/.exec(JSON.stringify(dc.actions))?.[1];
    obj.drag = { target, lights };
  }
  return obj;
}

function timelineOf(L) {
  const out = [];
  for (const e of L.timeline?.events || []) {
    const acts = mapActions(e.actions, {}).filter(a => !(e.time === 0 && a.show && !a.anim));
    if (acts.length) out.push({ t: e.time, actions: acts });
  }
  return out;
}
const shownAtZero = (L) => new Set((L.timeline?.events || []).filter(e => e.time === 0).flatMap(e => e.actions.filter(a => a.kind === 'show').map(a => stripRef(a.objRef.value))));

function convertSlide(n) {
  const slide = slides[n - 1];
  const s = load(join(JS, slide.id + '.js'));
  const base = s.slideLayers[0];
  const ctx = { content: { text: {}, images: {}, media: {}, links: {} }, hasMaster: false };
  const out = { id: slide.id, bg: '#' + String(s.background?.fill?.colors?.[0]?.rgb || '0xFFFFFF').replace(/^0x/, ''), objects: [], layers: {}, timeline: [], audio: {} };
  for (const o of base.objects || []) { const c = convertObject(o, ctx); if (c) out.objects.push(c); }
  if (ctx.hasMaster) out.objects.unshift({ kind: 'master', id: 'master' });
  out.timeline = timelineOf(base);
  for (const a of base.audiolib || []) { ctx.content.media[a.id] = { src: assetPath(a.assetId), alt: '' }; out.audio[a.id] = { captions: hasCaptions(a.id) }; }
  // initial visibility: anything shown later (timeline, layer open, trigger) but not at t=0 starts hidden
  const at0 = shownAtZero(base);
  const shownLater = new Set();
  const collectShows = (acts) => { for (const a of acts || []) { if (a.show) shownLater.add(a.show); } };
  for (const t of out.timeline) if (t.t > 0) collectShows(t.actions);
  for (const L of s.slideLayers.slice(1)) {
    const layer = { id: L.id, objects: [], onOpen: [], timeline: [] };
    for (const o of L.objects || []) { const c = convertObject(o, ctx); if (c) layer.objects.push(c); }
    for (const ev of L.events || []) if ((ev.eventName || ev.kind) === 'onslidestart') layer.onOpen.push(...mapActions(ev.actions, {}));
    collectShows(layer.onOpen);
    layer.timeline = timelineOf(L);
    for (const t of layer.timeline) collectShows(t.actions);
    for (const a of L.audiolib || []) { ctx.content.media[a.id] = { src: assetPath(a.assetId), alt: '' }; out.audio[a.id] = { captions: hasCaptions(a.id) }; }
    out.layers[L.id] = layer;
  }
  const walkObjs = (objs, fn) => { for (const o of objs) { fn(o); if (o.children) walkObjs(o.children, fn); } };
  walkObjs(out.objects, (o) => { for (const a of o.on?.click || []) if (a.show) shownLater.add(a.show); });
  for (const L of Object.values(out.layers)) walkObjs(L.objects, (o) => { for (const a of o.on?.click || []) if (a.show) shownLater.add(a.show); });
  walkObjs(out.objects, (o) => { if (shownLater.has(o.id) && !at0.has(o.id)) o.hidden = true; });
  // text boxes animated "by paragraph": the full box is an invisible container, its fragments carry the visuals
  const groups = new Map();
  for (const o of out.objects) if (o.kind === 'shape' && o.text) { const k = `${o.x},${o.y},${o.w},${o.h}`; (groups.get(k) || groups.set(k, []).get(k)).push(o); }
  for (const g of groups.values()) if (g.length > 1) {
    const container = g.find(o => o.text.y === 0 && g.some(f => f !== o && (f.text.y > 0 || f.text.paragraphs.length <= o.text.paragraphs.length)));
    const biggest = g.reduce((a, b) => (ctx.content.text[b.id]?.length || 0) > (ctx.content.text[a.id]?.length || 0) ? b : a);
    const c = container && (ctx.content.text[container.id]?.length || 0) >= (ctx.content.text[biggest.id]?.length || 0) ? container : biggest;
    if (g.some(f => f !== c)) c.container = true;
  }
  // drag & drop interaction (screen 28)
  const dragItems = out.objects.filter(o => o.drag);
  if (dragItems.length) {
    const layersByTitle = {};
    for (const [lid, L] of Object.entries(out.layers)) { const t = JSON.stringify(L.objects.map(o => ctx.content.text[o.id])); if (/"Incorrect"/.test(t)) layersByTitle.incorrect = lid; else if (/"Correct"/.test(t)) layersByTitle.correct = lid; }
    out.dragdrop = { items: dragItems.map(o => ({ id: o.id, target: o.drag.target, lights: o.drag.lights })), feedback: layersByTitle, hint: 'You must complete the question before submitting.' };
    out.submit = true;
    for (const o of dragItems) delete o.drag;
  }
  return { layout: out, content: ctx.content, transition: slide.transition };
}

// ---------- deck-newer overrides (work-order §7) ----------
function applyOverrides(n, layout, content) {
  if (n === 22) {
    const t = content.text['5qVwXFM10uO']; if (t) t[0].runs = [{ t: '(and Photoshop, ChatGPT, Ideogram, …)' }];
  }
  if (n === 28) {
    // label 4 maps to SEO Specialist: the deck's wording
    const t = content.text['6PENKDN5Dre']; if (t) t[0].runs = [{ t: 'AEO + Do faster, more' }];
    // the feedback layers carry no panel in the published data and were unreadable over the slide:
    // dim the slide and put the title, message and buttons on a white card (Dor, 6 Oct 2026)
    const fb = layout.dragdrop?.feedback || {};
    for (const [kind, lid] of Object.entries(fb)) {
      const L = layout.layers[lid]; if (!L) continue;
      L.objects.unshift(
        { id: lid + '_dim', kind: 'shape', svg: null, x: 0, y: 0, w: 960, h: 540, box: { fill: 'rgba(0,0,0,0.30)' } },
        { id: lid + '_panel', kind: 'shape', svg: null, x: 193, y: 206, w: 574, h: 200, box: { fill: '#FFFFFF', stroke: '#BFBFBF', strokeWidth: 1, radius: 6, shadow: true } },
      );
      if (kind === 'incorrect') {
        const cont = L.objects.find(o => o.text && content.text[o.id]?.[0]?.runs?.[0]?.t === 'Continue');
        if (cont) {
          cont.x = 490;
          const again = { id: lid + '_again', kind: 'shape', svg: null, x: 303, y: cont.y, w: cont.w, h: cont.h, button: true, box: { fill: '#FFFFFF', stroke: '#A6A6A6', strokeWidth: 1, radius: 4 },
            text: { ...cont.text, paragraphs: cont.text.paragraphs.map(p => ({ ...p })) }, on: { click: [{ reset: 'dragdrop' }, { hideLayer: 'self' }] } };
          L.objects.push(again);
          content.text[again.id] = [{ runs: [{ t: 'Try Again' }] }];
        }
      }
    }
  }
  if (n === 13) {
    // The Storyline shows the deck's "What can LLMs do nowadays?" list as a picture (teal card).
    // Keep the LLM list as it was and draw that card as live text at the picture's exact spot,
    // so the words can be edited by the sync while the screen looks the same.
    const shot = layout.objects.find(o => o.id === '6ktghTINrKX');
    if (shot) {
      const i = layout.objects.indexOf(shot);
      delete content.images['6ktghTINrKX'];
      const line = { align: 'left', lh: 26, sb: 0, sa: 0, indent: 70, first: 46, font: 'calibri', size: 17.5, color: '#FFFFFF', bullet: { char: '\u25CF', color: '#FFFFFF', font: 'calibri' } };
      const head = { ...line, indent: 36, first: 0, lh: 28 }; delete head.bullet;
      layout.objects[i] = { id: 'llmCan', kind: 'shape', svg: null, x: 577, y: 217, w: 332, h: 250,
        box: { fill: '#6CC1A0', stroke: '#2E75D6', strokeWidth: 2, radius: 3 },
        text: { x: 0, y: 22, w: 332, h: 210, valign: 'top', shadow: false, paragraphs: [head, line, line, line, line, line, line, line] } };
      content.text['llmCan'] = [
        { runs: [{ t: 'What can LLMs do nowadays?' }] },
        { runs: [{ t: 'Reasoning (think to solve)' }] }, { runs: [{ t: 'Multimodal (different media)' }] }, { runs: [{ t: 'Coding (software)' }] },
        { runs: [{ t: 'Data analysis' }] }, { runs: [{ t: 'Agents (complete tasks)' }] }, { runs: [{ t: 'Browsing (search the web)' }] }, { runs: [{ t: 'Image generation' }] },
      ];
    }
  }
}

// ---------- run ----------
const contentPath = join(root, 'content/s1.json');
const existing = JSON.parse(readFileSync(contentPath, 'utf8'));
const layoutAll = { $comment: 'Generated by tools/extract-screens.mjs from the published Storyline block. Design only: geometry, shape refs into paths.js, text styles, layers, timeline, triggers. Text and images live in content/s1.json.', screens: {} };
for (let n = 2; n <= 33; n++) {
  const { layout, content, transition } = convertSlide(n);
  applyOverrides(n, layout, content);
  layoutAll.screens[n] = layout;
  const sc = existing.screens[n - 1];
  sc.text = content.text; sc.images = content.images; sc.media = content.media; sc.links = content.links;
  if (n === 2) sc.nameField = { placeholder: content.text['5hQxi1pkFBR']?.placeholder || 'Type your first name', fontSize: 33 };
}
mkdirSync(join(root, 'src/screens'), { recursive: true });
writeFileSync(join(root, 'src/screens/layout.json'), JSON.stringify(layoutAll, null, 1) + '\n');
writeFileSync(contentPath, JSON.stringify(existing, null, 2) + '\n');
const stats = Object.entries(layoutAll.screens).map(([n, s]) => `${n}:${s.objects.length}o/${Object.keys(s.layers).length}L/${s.timeline.length}t/${Object.keys(s.audio).length}a${s.dragdrop ? '/DD' : ''}${s.objects.some(o => o.kind === 'slider') ? '/SL' : ''}`);
console.log(stats.join('  '));
console.log('layout.json', (readFileSync(join(root, 'src/screens/layout.json')).length / 1024).toFixed(0) + ' KB; content/s1.json', (readFileSync(contentPath).length / 1024).toFixed(0) + ' KB');

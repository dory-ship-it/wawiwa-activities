// Prints a readable dump of one published Storyline slide: layers, objects (position, image,
// text with styles, vector fills, video/audio), states, triggers, timeline and animations.
// Usage:  node tools/dump-screen.mjs <n|slideId> [--full]
import { load } from './storyline.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'source/storyline-published/html5/data/js');
const sc = join(root, '..', '..', '..', 'story_content');
const caps = (id) => (existsSync(join(sc, id + '_captions.js')) ? ' CAPTIONS' : '') + (existsSync(join(sc, id + '_transcripts.js')) ? ' TRANSCRIPT' : '');
const data = load(join(root, 'data.js'));
const paths = load(join(root, 'paths.js'));
const slides = data.scenes[0].slides;
const arg = process.argv[2];
const full = process.argv.includes('--full');
const slide = /^\d+$/.test(arg) ? slides[parseInt(arg, 10) - 1] : slides.find(s => s.id === arg);
if (!slide) { console.error('no such slide'); process.exit(1); }
const s = load(join(root, slide.id + '.js'));
const asset = (id) => data.assetLib.find(a => a.id === id);
const px = (pt) => Math.round(pt * 4 / 3 * 100) / 100;
const short = (f) => (f || '').replace(/"/g, '').split(',')[0].replace(/ Charset.*|Chars.*/, '');
const out = [];
const p = (d, t) => out.push('  '.repeat(d) + t);

function lib(pr) {
  if (!pr || pr.l !== 'Lib') return '';
  const cs = paths.Lib['commandset-' + pr.i];
  if (!cs) return '';
  const bits = [];
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.nodeType === 'path' && n.d) {
      const f = n.fill && n.fill !== 'none' ? `fill=${n.fill}` : 'fill=none';
      const st = n.stroke ? ` stroke=${n.stroke}/${n['stroke-width']}${n['stroke-opacity'] != null && n['stroke-opacity'] !== 1 ? '@' + n['stroke-opacity'] : ''}` : '';
      const d = n.d.length > 70 ? n.d.slice(0, 70) + '…' : n.d;
      bits.push(`path ${f}${st}${n['fill-opacity'] != null && n['fill-opacity'] !== 1 ? ' op=' + n['fill-opacity'] : ''} d=${d}`);
    }
    if (n.nodeType === 'linearGradient') bits.push('gradient ' + n.children.filter(c => c.nodeType === 'stop').map(c => c['stop-color']).filter((v, i, a) => a.indexOf(v) === i).join('→') + (n.gradientTransform ? ' rot' + (n.gradientTransform.find(t => t.type === 'rotate')?.args[0] ?? 0) : ''));
    if (n.nodeType === 'filter') bits.push('shadow');
    if (n.nodeType === 'line') bits.push(`line ${n.x1},${n.y1}→${n.x2},${n.y2} stroke=${n.stroke}/${n['stroke-width']}`);
    if (n.nodeType === 'image') bits.push('image');
    if (n.nodeType === 'text') bits.push(`svgtext ${n['font-family']?.split(' ')[0]} ${n['font-size']} ${n.fill}`);
    for (const k of Object.keys(n)) if (typeof n[k] === 'object') walk(n[k]);
  })(cs);
  return bits.join(' | ');
}

function textDump(d, tl, w) {
  for (const t of tl) {
    const vt = t.vartext;
    if (!vt) continue;
    p(d, `text valign=${t.valign} ${t.textshadow ? 'shadow ' : ''}box=${t.xPos},${t.yPos},${t.width}x${t.height}`);
    for (const b of vt.blocks) {
      const st = b.style || {};
      const ls = st.listStyle && st.listStyle.listType !== 'none' ? ` list=${st.listStyle.listType}:${st.listStyle.listTypeFormat}${st.listStyle.bulletChar ? ' ' + String.fromCharCode(st.listStyle.bulletChar) : ''}${st.listStyle.bulletColor ? ' ' + st.listStyle.bulletColor : ''} lvl=${st.listLevel}` : '';
      const sp = `${st.justification || ''} lh=${st.lineSpacingRule || ''}:${st.lineSpacing ?? ''} ind=${st.leadingMargin ?? 0}/${st.firstLineMargin ?? 0} sb=${st.spacingBefore ?? 0} sa=${st.spacingAfter ?? 0}${ls}`;
      p(d + 1, `¶ ${sp}`);
      for (const span of b.spans || []) {
        const ss = span.style || {};
        const txt = JSON.stringify(span.text);
        const link = span.link || span.hyperlink || span.linkId;
        p(d + 2, `${short(ss.fontFamily)} ${ss.fontSize ? px(ss.fontSize) + 'px' : ''} ${ss.foregroundColor || ''}${ss.fontIsBold ? ' B' : ''}${ss.fontIsItalic ? ' I' : ''}${ss.fontIsUnderline ? ' U' : ''}${ss.elevation && ss.elevation !== 'normal' ? ' ' + ss.elevation : ''}${link ? ' LINK=' + JSON.stringify(link) : ''} ${full ? txt : txt.slice(0, 120)}`);
      }
    }
  }
}

function actions(acts, d) {
  for (const a of acts || []) {
    const bits = [a.kind];
    for (const k of ['objRef', 'url', 'window', 'transition', 'animationId', 'variable', 'operator', 'value', 'name', 'id', 'state', 'volume', 'hideOthers', 'enable', 'target', 'direction', 'playgroupid']) {
      if (a[k] !== undefined) bits.push(`${k}=${typeof a[k] === 'object' ? JSON.stringify(a[k]) : a[k]}`);
    }
    if (a.condition) bits.push('IF ' + JSON.stringify(a.condition).slice(0, 200));
    p(d, '→ ' + bits.join(' '));
    if (a.thenActions) { p(d, '  then:'); actions(a.thenActions, d + 2); }
    if (a.elseActions) { p(d, '  else:'); actions(a.elseActions, d + 2); }
  }
}

function events(evs, d) {
  for (const e of evs || []) {
    p(d, `on ${e.eventName || e.kind}${e.key ? ' key=' + JSON.stringify(e.key) : ''}${e.time != null ? ' t=' + e.time : ''}`);
    actions(e.actions, d + 1);
  }
}

const MASTER_IDS = new Set(['5cyH4t6JCxt', '6nfcoSKLifG', '5ntBxrdGw5E', '5WqhO9hryMY']);
const isFooterGroup = (o) => o.kind === 'objgroup' && o.yPos === 513 && o.width === 960 && (o.objects || []).every(c => c.imagelib && [5, 6].includes(c.imagelib[0]?.assetId));
const isYearLine = (o) => o.textLib && JSON.stringify(o.textLib).includes('2024 © Oded Israeli');
const showAll = process.argv.includes('--all');
function object(o, d) {
  if (!showAll && (MASTER_IDS.has(o.id) || isFooterGroup(o) || isYearLine(o))) return;
  const geo = `${o.xPos},${o.yPos} ${o.width}x${o.height}`;
  const extra = [];
  if (o.rotation) extra.push('rot=' + o.rotation);
  if (o.alpha != null && o.alpha !== 100) extra.push('alpha=' + o.alpha);
  if (o.altText) extra.push('alt=' + JSON.stringify(o.altText).slice(0, 60));
  if (o.accType) extra.push('acc=' + o.accType);
  if (o.initiallyHidden || o.visible === false) extra.push('HIDDEN');
  if (o.useHandCursor) extra.push('hand');
  if (o.textdata?.vartext) extra.push('vartext');
  p(d, `[${o.kind}] ${o.id} @${geo} ${extra.join(' ')}`);
  if (o.imagelib) for (const im of o.imagelib) { const a = asset(im.assetId); p(d + 1, `img asset=${im.assetId} ${a ? a.url + ' ' + a.width + 'x' + a.height : im.url} alt=${JSON.stringify(im.altText || '')}`); }
  if (o.data?.vectorData) { const v = lib(o.data.vectorData.pr); if (v && !v.startsWith('image') && !(o.imagelib && /^path fill=none d=M0,0L[^|]*z \| image$/.test(v))) p(d + 1, `vector ${v}`); }
  if (o.data?.videodata) { const a = asset(o.data.videodata.assetId); const po = asset(o.data.videodata.posterAssetId); p(d + 1, `video ${a?.url} ${a?.width}x${a?.height} dur=${a?.duration} poster=${po?.url} alt=${JSON.stringify(o.data.videodata.altText || '')}${caps(o.id)}`); }
  if (o.data?.audiodata) { const a = asset(o.data.audiodata.assetId); p(d + 1, `audio ${a?.url} dur=${a?.duration}`); }
  if (o.data?.webobjectdata || o.webobjectdata) p(d + 1, 'webobject ' + JSON.stringify(o.data?.webobjectdata || o.webobjectdata).slice(0, 200));
  if (o.textLib) textDump(d + 1, o.textLib, o.width);
  if (o.kind === 'textinput') p(d + 1, `textinput placeholder=${JSON.stringify(o.placeholder)} font=${short(o.font)} ${o.fontsize}px ${o.textcolor} ${o.bold ? 'B' : ''} bind=${o.bindto}`);
  if (o.kind === 'slider' || o.slider) p(d + 1, 'slider ' + JSON.stringify({ min: o.min, max: o.max, step: o.step, start: o.start, variable: o.variable, bindto: o.bindto, orientation: o.orientation }));
  for (const k of ['min', 'max', 'step', 'start', 'variable', 'bindto', 'orientation', 'dragdrop', 'dropTargets', 'draggable', 'dropTarget', 'snapback', 'returnToStart', 'allowDrop', 'dragSnap']) if (o[k] !== undefined && typeof o[k] !== 'object') p(d + 1, `${k}=${o[k]}`);
  if (o.states && o.states.length) p(d + 1, 'states: ' + o.states.map(st => `${st.name}${st.data?.vectorData?.pr ? '[' + (lib(st.data.vectorData.pr).split(' | ')[0] || '').replace('path ', '') + ']' : ''}`).join(', ').slice(0, 400));
  if (o.animations && o.animations.length) p(d + 1, 'anims: ' + o.animations.map(an => `${an.id}(${an.duration}ms ${an.tweens?.map(t => Object.keys(t).filter(k => !['kind', 'time', 'duration'].includes(k)).join('+')).join(',')})`).join(' '));
  if (o.events && o.events.length) events(o.events.filter(e => !['onrollover', 'onrollout', 'onpress', 'onreleaseoutside', 'ontransitionin', 'ontransitionoutcomplete'].includes(e.eventName) || full), d + 1);
  if (o.actionGroups && full) for (const [k, g] of Object.entries(o.actionGroups)) { if (/^ActGrp(Set|Clear)|^_/.test(k)) continue; p(d + 1, 'actiongroup ' + k); actions(g.actions, d + 2); }
  if (o.objects) for (const c of o.objects) object(c, d + 1);
  if (o.background) p(d + 1, 'bg ' + JSON.stringify(o.background).slice(0, 160));
}

p(0, `#${slides.indexOf(slide) + 1} ${slide.id} "${slide.title}" trans=${slide.transition} bg=${JSON.stringify(s.background).slice(0, 120)}`);
p(0, 'keys: ' + Object.keys(s).join(','));
if (s.variables) p(0, 'vars: ' + s.variables.map(v => `${v.name}=${JSON.stringify(v.value)}`).join(' '));
if (s.actionGroups) for (const [k, g] of Object.entries(s.actionGroups)) { if (/^NavigationRestriction/.test(k)) continue; p(0, 'actiongroup ' + k); actions(g.actions, 1); }
events((s.events || []).filter(e => !['onbeforeslidein', 'ontransitionin'].includes(e.kind)), 0);
for (const [i, L] of s.slideLayers.entries()) {
  const props = ['isBaseLayer', 'hideOtherLayers', 'hideBaseLayer', 'hideBaseLayerObjects', 'revealOnExit', 'pauseParent', 'modal', 'presentAs', 'closeOnOutsideClick', 'lmsId'].filter(k => L[k] !== undefined && L[k] !== false && L[k] !== '').map(k => `${k}=${L[k]}`).join(' ');
  p(0, `\n=== LAYER ${i} ${L.id || 'base'} ${props} dur=${L.timeline?.duration}`);
  if (L.variables) p(1, 'vars: ' + L.variables.map(v => `${v.name}=${JSON.stringify(v.value)}`).join(' '));
  if (L.actionGroups) for (const [k, g] of Object.entries(L.actionGroups)) { p(1, 'actiongroup ' + k); actions(g.actions, 2); }
  events(L.events, 1);
  if (L.timeline?.events) for (const e of L.timeline.events) { const acts = (e.actions || []).filter(a => !(a.kind === 'show' && a.transition === 'appear' && e.time === 0)); if (acts.length) { p(1, `t=${e.time}`); actions(acts, 2); } }
  if (L.animations) p(1, 'layer anims: ' + L.animations.map(a => `${a.id}(${a.duration}ms)`).join(' '));
  for (const k of Object.keys(L)) if (/audio/i.test(k) && typeof L[k] === 'object') {
    for (const a of (Array.isArray(L[k]) ? L[k] : [L[k]])) { const as = asset(a.assetId ?? a.data?.audiodata?.assetId); p(1, `AUDIO ${a.id} ${as?.url} dur=${as?.duration}${caps(a.id)} ${JSON.stringify(Object.fromEntries(Object.entries(a).filter(([kk, v]) => typeof v !== 'object' && kk !== 'id'))).slice(0, 200)}`); if (a.events) events(a.events, 2); }
  }
  for (const o of L.objects || []) object(o, 1);
}
console.log(out.join('\n'));

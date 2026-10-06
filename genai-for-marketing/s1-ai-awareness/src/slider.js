// Timeline slider (screens 7 and 8): drag the thumb; a year's card shows while the thumb sits in its band.
import { svgFromCommandset } from './svg.js';

export function makeSlider(S, node) {
  const { obj, wrap } = node;
  const sl = obj.slider;
  const { ctx } = S;
  const track = ctx.h('div', { class: 'obj slider-track', style: `left:${sl.track.x}px;top:${sl.track.y}px;width:${sl.track.w}px;height:${sl.track.h}px;` });
  track.appendChild(svgFromCommandset(ctx.paths.Lib['commandset-' + sl.track.svg], { w: sl.track.w, h: sl.track.h }));
  const thumb = ctx.h('div', { class: 'obj slider-thumb', role: 'slider', tabindex: '0', 'data-keys': '1', 'aria-valuemin': sl.min, 'aria-valuemax': sl.max, 'aria-valuenow': sl.initial, 'aria-label': 'Timeline slider', style: `left:${sl.thumb.x}px;top:${sl.thumb.y}px;width:${sl.thumb.w}px;height:${sl.thumb.h}px;` });
  const paint = (hover) => { thumb.innerHTML = ''; thumb.appendChild(svgFromCommandset(ctx.paths.Lib['commandset-' + ((hover && sl.thumb.hover != null) ? sl.thumb.hover : sl.thumb.svg)], { w: sl.thumb.w, h: sl.thumb.h })); };
  paint(false);
  wrap.append(track, thumb);
  wrap.classList.add('slider');

  let value = sl.initial || 0;
  const apply = () => {
    thumb.style.left = (sl.thumb.x + (value - sl.min) / (sl.max - sl.min) * sl.pathEnd) + 'px';
    thumb.setAttribute('aria-valuenow', Math.round(value));
    for (const th of sl.thresholds) { const inBand = value >= th.min && value <= th.max; inBand ? S.showLayer(th.layer, 'never') : S.hideLayer(th.layer); }
  };
  const setValue = (v) => { value = Math.max(sl.min, Math.min(sl.max, Math.round(v / sl.step) * sl.step)); apply(); };
  const valueAt = (clientX) => {
    const r = wrap.getBoundingClientRect();
    const scale = r.width / obj.w;
    const x = (clientX - r.left) / scale - sl.thumb.x - sl.thumb.w / 2;
    return sl.min + x / sl.pathEnd * (sl.max - sl.min);
  };
  let dragging = false;
  const onDown = (e) => { dragging = true; setValue(valueAt(e.clientX)); try { thumb.setPointerCapture(e.pointerId); } catch { /* ignore */ } thumb.focus({ preventScroll: true }); e.preventDefault(); };
  thumb.addEventListener('pointerdown', (e) => { dragging = true; try { thumb.setPointerCapture(e.pointerId); } catch { /* ignore */ } e.preventDefault(); });
  track.addEventListener('pointerdown', onDown);
  thumb.addEventListener('pointermove', (e) => { if (dragging) setValue(valueAt(e.clientX)); });
  thumb.addEventListener('pointerup', (e) => { if (dragging) setValue(valueAt(e.clientX)); dragging = false; });
  thumb.addEventListener('pointercancel', () => { dragging = false; });
  thumb.addEventListener('pointerenter', () => paint(true));
  thumb.addEventListener('pointerleave', () => paint(false));
  thumb.addEventListener('keydown', (e) => {
    const step = (sl.max - sl.min) / 40;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setValue(value + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setValue(value - step);
    else if (e.key === 'Home') setValue(sl.min);
    else if (e.key === 'End') setValue(sl.max);
    else return;
    e.preventDefault(); e.stopPropagation();
  });
  apply();
}

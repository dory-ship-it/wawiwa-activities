// FX4: the Blossom-like player frame (tools/blossom-frame.html), dev only
const q = new URLSearchParams(location.search);
document.body.dataset.mode = q.get('mode') || 'fill';
const screen = q.get('screen');
document.getElementById('lesson').src = '../index.html?live=0' + (screen ? '&screen=' + encodeURIComponent(screen) : '') + (q.get('reset') ? '&reset=1' : '');

// Design copy only: picks the skin. ?look=v1 (Flat 3D, default), ?look=v2 (Premium Realistic) or ?look=v3 (Paper),
// remembered in this browser so the review page's thumbnails follow it; ?look=off shows the approved look.
(function () {
  var looks = { v1: 'src/poster-look.css?v=pl1', v2: 'src/poster-look-v2.css?v=pl2', v3: 'src/look-paper.css?v=pp1', off: '' };
  var q = new URLSearchParams(location.search).get('look'), saved = null;
  try { saved = localStorage.getItem('pl-look'); } catch (e) {}
  var look = looks.hasOwnProperty(q) ? q : (looks.hasOwnProperty(saved) ? saved : 'v1');
  try { if (q) localStorage.setItem('pl-look', look); } catch (e) {}
  var link = document.getElementById('poster-look');
  if (link) { if (looks[look]) link.href = looks[look]; else link.remove(); }
})();

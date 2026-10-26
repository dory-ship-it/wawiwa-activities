// Page entry (adapted from genai-for-marketing/s1-ai-awareness/src/main.js).
// Kept in a file: the page's CSP allows only same-origin scripts, no inline code.
// Boot error strings come from content ui.boot; if the content file itself cannot load,
// from the <template id="boot-fallback"> copy in index.html (kept equal by tools/check.mjs).
import { boot } from './engine.js?v=febfa1ab';

boot(document.getElementById('app')).catch((err) => {
  const strings = err.ui && err.ui.boot ? err.ui.boot : fallbackStrings();
  const box = document.getElementById('boot-error');
  const line1 = document.createElement('p');
  line1.textContent = strings.error;
  const line2 = document.createElement('p');
  line2.textContent = location.protocol === 'file:' ? strings.fileProtocol : (err.message || '');
  box.replaceChildren(line1, line2);
  box.hidden = false;
  console.error(err);
});

function fallbackStrings() {
  const out = {};
  const tpl = document.getElementById('boot-fallback');
  for (const el of tpl.content.querySelectorAll('[data-key]')) out[el.dataset.key] = el.textContent;
  return out;
}

// Page entry (kept in a file: the page's CSP allows only same-origin scripts, no inline code).
import { boot } from './engine.js';

boot(document.getElementById('player')).catch((err) => {
  const e = document.getElementById('boot-error');
  e.style.display = 'grid';
  e.textContent = 'The lesson could not load. ' + (location.protocol === 'file:'
    ? 'Open it through a web server (GitHub Pages or a local server), not as a file.'
    : err.message);
  console.error(err);
});

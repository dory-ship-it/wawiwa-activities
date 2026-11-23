// Self-study hub: three views from the URL hash.
//   #/                  every course
//   #/<course>          how the course makes its self-study, and its lessons by module
//   #/<course>/<lesson> the lesson: learner links, then its overview (the lesson's own review.html) below
// Lessons stay in their own folders; this page only links to them. Only what is needed is shown (Noy, 23 Nov 2026).

const root = document.getElementById('hub');
const crumbs = document.querySelector('.hb-crumbs');

// status marks: green done, orange ongoing, grey planned; an example lesson is not one of the course's lessons
const STATUS = { done: 'Done', ongoing: 'Ongoing', planned: 'Planned', example: 'Example' };

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
}

const code = (l) => `M${l.module} L${l.lesson}`;
const lessonUrl = (l, file) => new URL(l.path + file, location.href).href;
const badge = (status) => h('span', { class: 'hb-badge', 'data-status': status },
  h('span', { class: 'hb-dot', 'aria-hidden': 'true' }), STATUS[status] || status);

let hub;

function setCrumbs(list) {
  crumbs.replaceChildren(...list.flatMap(([label, href], i) => [
    i ? h('span', { class: 'hb-sep', 'aria-hidden': 'true' }, '/') : null,
    href ? h('a', { href }, label) : h('span', { 'aria-current': 'page' }, label),
  ]).filter(Boolean));
}

function viewCourses() {
  document.body.dataset.view = 'courses';
  document.title = 'Self-study hub';
  setCrumbs([['All courses']]);
  const cards = hub.courses.map((c) => {
    const mapped = c.lessons.filter((l) => l.status !== 'example');
    const done = mapped.filter((l) => l.status === 'done').length;
    const examples = c.lessons.length - mapped.length;
    // the course's photo: the first screen of its first built lesson (decorative, the title names the course)
    const cover = c.cover ? h('img', { class: 'hb-cover', src: c.cover, alt: '', loading: 'lazy' }) : null;
    if (cover && c.coverPosition) cover.style.objectPosition = c.coverPosition;
    const meta = [`${mapped.length} self-study lesson${mapped.length === 1 ? '' : 's'}`, done ? `${done} done` : null, examples ? `${examples} example` : null].filter(Boolean).join(' · ');
    return h('li', {}, h('a', { class: 'hb-card hb-course', href: `#/${c.id}` },
      cover,
      h('span', { class: 'hb-course-body' },
        h('span', { class: 'hb-kicker' }, c.short),
        h('span', { class: 'hb-card-title' }, c.title),
        h('span', { class: 'hb-card-meta' }, meta))));
  });
  root.replaceChildren(
    h('h1', {}, 'Choose a course'),
    h('ul', { class: 'hb-grid' }, cards));
}

function viewCourse(c) {
  document.body.dataset.view = 'course';
  document.title = `${c.short} · Self-study hub`;
  setCrumbs([['All courses', '#/'], [c.short]]);
  const lessonCard = (l) => {
    const inner = [
      h('span', { class: 'hb-card-row' }, h('span', { class: 'hb-kicker' }, `Lesson ${l.lesson}`), badge(l.status)),
      h('span', { class: 'hb-card-title' }, l.title),
      l.note ? h('span', { class: 'hb-card-note' }, l.note) : null,
    ];
    // every lesson opens: a built one shows its overview, a planned one its materials
    return h('li', {}, h('a', { class: 'hb-card hb-lesson', href: `#/${c.id}/${l.id}`, 'data-planned': l.path ? null : 'true' }, inner));
  };
  // one group per module, in order, under a soft heading
  const modules = [...new Set(c.lessons.map((l) => l.module))].sort((a, b) => a - b);
  const groups = modules.map((m) => h('section', { class: 'hb-module', 'aria-labelledby': `hb-m-${m}` },
    h('h3', { class: 'hb-module-head', id: `hb-m-${m}` }, `Module ${m}`, c.modules?.[m] ? h('span', {}, c.modules[m]) : null),
    h('ul', { class: 'hb-grid' }, c.lessons.filter((l) => l.module === m).sort((a, b) => a.lesson - b.lesson).map(lessonCard))));
  // how this course makes its self-study: one line each, and how it is made
  const profile = h('div', { class: 'hb-profile', role: 'list', 'aria-label': 'How this course makes its self-study' },
    c.profile.map((p) => h('section', { class: 'hb-prof', role: 'listitem' },
      h('h3', { class: 'hb-prof-label' }, p.label),
      h('p', { class: 'hb-prof-what' }, p.what),
      p.how?.length ? h('ul', { class: 'hb-prof-how' }, p.how.map((x) => h('li', {}, x))) : null)));
  // (Noy, 23 Nov 2026) the lessons are the point of this page: the profile stays folded until opened
  root.replaceChildren(
    h('h1', {}, c.title),
    h('details', { class: 'hb-fold' },
      h('summary', { class: 'hb-fold-head' }, h('span', { class: 'hb-chev', 'aria-hidden': 'true' }), 'How this course is made',
        h('span', { class: 'hb-fold-hint' }, c.profile.map((p) => p.label).join(' · '))),
      profile),
    h('h2', { class: 'hb-h2' }, 'Self-study lessons'),
    ...groups);
}

// a material: [label, kind, id, "students"?]; with a Drive id it is a link, without one just its name
const DRIVE = { slides: 'https://docs.google.com/presentation/d/%/edit', doc: 'https://docs.google.com/document/d/%/edit',
  file: 'https://drive.google.com/file/d/%/view', folder: 'https://drive.google.com/drive/folders/%' };
function materialsBlock(c, l) {
  const list = Array.isArray(l.materials) ? l.materials : l.materials ? c.materialSet || [] : [];
  if (!list.length) return null;
  const item = ([label, kind, id, who]) => h('li', { class: 'hb-mat', 'data-students': who === 'students' ? 'true' : null },
    id && DRIVE[kind] ? h('a', { href: DRIVE[kind].replace('%', id), target: '_blank', rel: 'noopener' }, label) : h('span', {}, label),
    who === 'students' ? h('span', { class: 'hb-mat-tag' }, 'Students') : null);
  return h('section', { class: 'hb-materials', 'aria-labelledby': 'hb-mat-h' },
    h('h2', { class: 'hb-mat-head', id: 'hb-mat-h' }, 'Materials'),
    h('ul', { class: 'hb-mat-list' }, list.map(item)),
    !Array.isArray(l.materials) && c.materialsNote ? h('p', { class: 'hb-card-note' }, c.materialsNote) : null,
    l.check ? h('p', { class: 'hb-check' }, l.check) : null);
}

function viewLesson(c, l) {
  document.title = `${c.short} ${code(l)} · Self-study hub`;
  setCrumbs([['All courses', '#/'], [c.short, `#/${c.id}`], [code(l)]]);
  const id = h('div', { class: 'hb-lesson-id' },
    h('span', { class: 'hb-kicker' }, `${c.short} · Module ${l.module} · Lesson ${l.lesson}`),
    h('h1', {}, l.title),
    h('span', { class: 'hb-lesson-row' }, badge(l.status), l.note ? h('span', { class: 'hb-card-note' }, l.note) : null));
  if (!l.path) { // planned: what it is built from
    document.body.dataset.view = 'planned';
    root.replaceChildren(h('div', { class: 'hb-lesson-head' }, id), materialsBlock(c, l) || h('p', { class: 'hb-card-note' }, 'No materials on Drive yet.'));
    return;
  }
  // (Noy, 23 Nov 2026) no overview framed inside the hub (its own scroll and a second menu were hard to use):
  // the Overview button opens the lesson's familiar overview as a full page; Back returns here
  // (Noy, 23 Nov 2026) the two ways in are the first thing to see: large, centred, under the title
  document.body.dataset.view = 'lesson';
  const learner = lessonUrl(l, 'index.html');
  const entry = (cls, href, title, sub, blank) => h('a', { class: 'hb-entry ' + cls, href, ...(blank ? { target: '_blank', rel: 'noopener' } : {}) },
    h('span', { class: 'hb-entry-title' }, title), h('span', { class: 'hb-entry-sub' }, sub));
  root.replaceChildren(
    h('div', { class: 'hb-hero' }, id,
      h('div', { class: 'hb-entries' },
        entry('hb-entry-main', lessonUrl(l, 'review.html'), 'Overview', 'Every screen of the lesson at a glance'),
        entry('', learner + '?reset=1', 'Open as a learner', 'As a student sees it, from the start', true)),
      h('p', { class: 'hb-learner-link' }, 'Learner link: ', h('a', { href: learner, target: '_blank', rel: 'noopener' }, learner))),
    materialsBlock(c, l));
}

function viewMissing() {
  document.body.dataset.view = 'courses';
  setCrumbs([['All courses', '#/'], ['Not found']]);
  root.replaceChildren(h('h1', {}, 'This page is not in the hub'), h('p', {}, h('a', { href: '#/' }, 'Back to all courses')));
}

function route() {
  const [cid, lid] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const c = cid && hub.courses.find((x) => x.id === cid);
  const l = c && lid && c.lessons.find((x) => x.id === lid);
  if (!cid) viewCourses();
  else if (!c || (lid && !l)) viewMissing();
  else if (l) viewLesson(c, l);
  else viewCourse(c);
  root.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

try {
  const res = await fetch('hub.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  hub = await res.json();
  addEventListener('hashchange', route);
  route();
} catch (e) {
  root.replaceChildren(h('h1', {}, 'The hub could not load'),
    h('p', {}, 'Open it through a web server (GitHub Pages or a local server), not as a file.'));
}

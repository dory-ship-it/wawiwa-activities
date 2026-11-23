// kit:sync: copy the kit into a lesson, at the kit's version. Run it from the lesson's folder:
//   npm run kit:sync                       (the version in kit.json must be the kit's: package.json "version")
//   npm run kit:sync -- --to=0.2.0         (moves the lesson to the kit's new version and records it in kit.json)
// What it writes in the lesson (the "kit files", all listed in kit.lock.json with a hash):
//   src/              the engine, shell, templates, base CSS, review mode (from _selfstudy-kit/src)
//   src/profiles/     the lesson's course profile only (kit.json "profile")
//   tools/            the kit's tools (not tools/eai/: the EAI pilot's own tests, kept in the kit until EAI moves;
//                     not this file: it always runs from the kit)
//   assets/fonts/, assets/logo/
//   index.html, review.html   from _selfstudy-kit/shell, filled from kit.json and the content
// Then it stamps the lesson (tools/stamp.mjs). A kit file edited inside a lesson stops the sync (and fails
// npm run check): a fix goes into _selfstudy-kit, then every lesson syncs on purpose.
// Why a copy and not a live link (KIT-PLAN.md): a live lesson never changes by itself when the kit changes,
// and the SCORM zip stays self-contained.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname, relative, normalize } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const KIT = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));
const LESSON = normalize(process.cwd());
const args = process.argv.slice(2);
const to = (args.find((a) => a.startsWith('--to=')) || '').slice(5);
const die = (m) => { console.error('kit:sync: ' + m); process.exit(1); };
if (LESSON === KIT) die('run it from a lesson folder, not from the kit');
if (!existsSync(join(LESSON, 'kit.json'))) die(`no kit.json in ${LESSON}`);

export const norm = (t) => t.replace(/\r\n/g, '\n').replace(/\?v=[0-9a-f]{8}/g, '');
export const hashOf = (p) => createHash('sha1').update(/\.(js|mjs|css|html|json|md|txt)$/.test(p) ? norm(readFileSync(p, 'utf8')) : readFileSync(p)).digest('hex').slice(0, 12);
const walk = (d) => (existsSync(d) ? readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; }) : []);
const rel = (p) => relative(LESSON, p).replace(/\\/g, '/');

const kitJson = JSON.parse(readFileSync(join(LESSON, 'kit.json'), 'utf8'));
const version = JSON.parse(readFileSync(join(KIT, 'package.json'), 'utf8')).version;
if (to && to !== version) die(`--to=${to}, but the kit is at ${version}`);
if (!to && kitJson.kit !== version) die(`kit.json asks for kit ${kitJson.kit}, the kit is at ${version}: run with --to=${version} to move this lesson on purpose (then run every test)`);
if (!existsSync(join(KIT, 'profiles', kitJson.profile + '.css'))) die(`no profile ${kitJson.profile} in the kit (profiles/)`);

// 1. a kit file edited in the lesson stops the sync
const lockPath = join(LESSON, 'kit.lock.json');
const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : { files: {} };
const edited = Object.entries(lock.files).filter(([p, h]) => existsSync(join(LESSON, p)) && hashOf(join(LESSON, p)) !== h).map(([p]) => p);
if (edited.length && !args.includes('--force')) die(`kit files edited in this lesson (move the change into _selfstudy-kit first, or --force to drop it):\n  ${edited.join('\n  ')}`);

// 2. the old kit files go (a file the kit no longer has must not stay behind)
for (const p of Object.keys(lock.files)) rmSync(join(LESSON, p), { force: true });

// 3. copy
const files = {};
const put = (from, toRel) => { const dest = join(LESSON, toRel); mkdirSync(dirname(dest), { recursive: true }); copyFileSync(from, dest); files[toRel] = null; };
for (const f of walk(join(KIT, 'src'))) put(f, 'src/' + relative(join(KIT, 'src'), f).replace(/\\/g, '/'));
put(join(KIT, 'profiles', kitJson.profile + '.css'), `src/profiles/${kitJson.profile}.css`);
for (const f of walk(join(KIT, 'tools')).filter((p) => !/^(eai|sync\.mjs)/.test(relative(join(KIT, 'tools'), p)))) put(f, 'tools/' + relative(join(KIT, 'tools'), f).replace(/\\/g, '/'));
for (const d of ['fonts', 'logo']) for (const f of walk(join(KIT, 'assets', d))) put(f, `assets/${d}/` + relative(join(KIT, 'assets', d), f).replace(/\\/g, '/'));

// 4. the two pages, from the shell
const content = JSON.parse(readFileSync(join(LESSON, kitJson.content), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const frameSrc = kitJson.coach?.url ? new URL(kitJson.coach.url).origin : "'none'";
const fill = (tpl) => tpl
  .replace(/\{\{lang\}\}/g, esc(content.lesson.lang || 'en')).replace(/\{\{dir\}\}/g, esc(content.lesson.dir || 'ltr'))
  .replace(/\{\{title\}\}/g, esc(content.lesson.title)).replace(/\{\{code\}\}/g, esc(content.lesson.code || kitJson.code))
  .replace(/\{\{frameSrc\}\}/g, frameSrc).replace(/\{\{profile\}\}/g, kitJson.profile)
  .replace(/\{\{lessonCss\}\}/g, existsSync(join(LESSON, 'lesson.css')) ? '<link rel="stylesheet" href="lesson.css">\n' : '')
  .replace(/\{\{bootFallback\}\}/g, Object.entries(content.ui.boot).map(([k, v]) => `<span data-key="${k}">${esc(v)}</span>`).join(''));
for (const page of ['index.html', 'review.html']) { writeFileSync(join(LESSON, page), fill(readFileSync(join(KIT, 'shell', page), 'utf8'))); files[page] = null; }

// 5. stamp, then the lock (hashes without the stamps)
const st = spawnSync(process.execPath, [join(LESSON, 'tools', 'stamp.mjs')], { cwd: LESSON, encoding: 'utf8' });
if (st.status) die('stamp failed: ' + st.stderr);
for (const p of Object.keys(files)) files[p] = hashOf(join(LESSON, p));
if (to) { kitJson.kit = version; writeFileSync(join(LESSON, 'kit.json'), JSON.stringify(kitJson, null, 2) + '\n'); }
writeFileSync(lockPath, JSON.stringify({ $comment: 'Written by npm run kit:sync. Every file below is a copy of _selfstudy-kit: never edit it here (npm run check fails).', kit: version, profile: kitJson.profile, files: Object.fromEntries(Object.entries(files).sort()) }, null, 1) + '\n');
console.log(`kit:sync: ${Object.keys(files).length} kit files at version ${version} (profile ${kitJson.profile}) into ${rel(LESSON) || LESSON}; ${st.stdout.trim()}`);

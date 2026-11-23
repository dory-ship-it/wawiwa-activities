// The lesson's settings for the kit's tools (node). Every tool runs from the lesson's own tools/ folder (a
// copy made by tools/sync.mjs), so the lesson's root is one folder up. kit.json holds everything a tool needs
// to know about the lesson; nothing in tools/ names a lesson.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));
export const KIT_JSON = join(ROOT, 'kit.json');
export const KIT = existsSync(KIT_JSON) ? JSON.parse(readFileSync(KIT_JSON, 'utf8')) : null;
if (!KIT) throw new Error(`no kit.json in ${ROOT}: run the kit's tools from a lesson folder (npm run kit:sync first)`);

export const CONTENT_PATH = join(ROOT, KIT.content);
export const readContent = () => JSON.parse(readFileSync(CONTENT_PATH, 'utf8'));

// the screens whose page waits for a film or audio to load (no networkidle: a media element keeps the
// network busy): every screen with a media block (film, podcast, call)
export const mediaScreens = (content) => new Set(content.screens.filter((s) => s.media || s.call?.media || s.template === 'video').map((s) => s.id));

// the lesson's own test files (tests/), when it has them
export const lessonFile = (name) => join(ROOT, 'tests', name);
export const importLesson = async (name) => (existsSync(lessonFile(name)) ? import(pathToFileURL(lessonFile(name)).href) : null);

// the src/ modules read the lesson's kit.json through src/config.js; in node it is set here
export async function configureSrc() {
  const { setConfig } = await import(pathToFileURL(join(ROOT, 'src', 'config.js')).href);
  setConfig(KIT);
}

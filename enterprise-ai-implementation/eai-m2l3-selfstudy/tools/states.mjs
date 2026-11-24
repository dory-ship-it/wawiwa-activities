// Kit tool: the lesson's screen states (tests/states.mjs in the lesson), for tools/test-fit.mjs,
// tools/check-overflow.mjs and tools/shots.mjs, with the kit's helpers (tools/state-helpers.mjs).
import { importLesson } from './kit.mjs';
export * from './state-helpers.mjs';

const lesson = await importLesson('states.mjs');
if (!lesson?.STATES) throw new Error('the lesson has no tests/states.mjs with STATES');
export const STATES = lesson.STATES;

// Kit tool: the keyboard-only walk of the whole lesson (npm run walk; npm run test:scorm = --scorm, the same path
// against the mock SCORM 1.2 API). The path is the lesson's own (tests/walk.mjs), written with the kit's helpers
// (tools/walk-lib.mjs): each lesson walks its own screens, and the kit gives the checks every walk makes.
import { importLesson } from './kit.mjs';

if (!(await importLesson('walk.mjs'))) { console.error('the lesson has no tests/walk.mjs'); process.exit(1); }

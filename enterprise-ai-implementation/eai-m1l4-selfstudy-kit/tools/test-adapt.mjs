// Kit tool: the personal path (PP1, src/adapt.js) scenario of a lesson that uses it (npm run test:adapt). The
// journeys, checkpoints and adaptive screens are the lesson's, so the scenario is the lesson's own (tests/adapt.mjs).
import { importLesson, readContent } from './kit.mjs';

if (!readContent().lesson.adapt) { console.log('test:adapt: this lesson has no personal path (lesson.adapt)'); process.exit(0); }
if (!(await importLesson('adapt.mjs'))) { console.error('the lesson has a personal path but no tests/adapt.mjs'); process.exit(1); }

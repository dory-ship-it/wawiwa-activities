// V1 film toolchain preflight (P2). Checks what render.mjs and make.py need before any work starts:
// Node 18+, the machine's Chrome (same lookup as tools/test-fit.mjs), Python 3.10+, ffmpeg, and the
// Python packages kokoro_onnx, soundfile, numpy. Installs nothing. On a miss it prints the exact
// Windows install command and exits 1, so the phase stops there.
// Usage: node video/v1/preflight.mjs
import { spawnSync } from 'node:child_process';
import { chromePath } from '../../tools/lib.mjs';

const fails = [];
const ok = (m) => console.log('  ok   ' + m);
const fail = (m, fix) => { fails.push(fix); console.log('  FAIL ' + m); };
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', shell: false, windowsHide: true });
  return { ok: !r.error && r.status === 0, out: ((r.stdout || '') + (r.stderr || '')).trim() };
};

console.log('\nV1 preflight');

// 1. Node
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor >= 18) ok('Node ' + process.versions.node);
else fail('Node ' + process.versions.node + ' (need 18+)', 'winget install OpenJS.NodeJS.LTS');

// 2. Chrome
try { ok('Chrome ' + chromePath()); }
catch { fail('Chrome not found (set CHROME_PATH)', 'winget install Google.Chrome'); }

// 3. Python 3.10+ (py launcher first, then python on PATH)
const PY = [['py', ['-3']], ['python', []], ['python3', []]]
  .find(([cmd, pre]) => run(cmd, [...pre, '--version']).ok);
let pyOk = false;
if (!PY) fail('Python not found', 'winget install Python.Python.3.12');
else {
  const v = run(PY[0], [...PY[1], '-c', 'import sys; print("%d.%d.%d" % sys.version_info[:3])']).out;
  const [maj, min] = v.split('.').map(Number);
  pyOk = maj === 3 && min >= 10;
  if (pyOk) ok(`Python ${v} (${[PY[0], ...PY[1]].join(' ')})`);
  else fail(`Python ${v} (need 3.10+)`, 'winget install Python.Python.3.12');
}

// 4. ffmpeg
const ff = run('ffmpeg', ['-hide_banner', '-version']);
if (ff.ok) ok(ff.out.split('\n')[0]);
else fail('ffmpeg not on PATH', 'winget install Gyan.FFmpeg');

// 5. Python packages
if (pyOk) {
  const mods = run(PY[0], [...PY[1], '-c', 'import kokoro_onnx, soundfile, numpy; print(numpy.__version__)']);
  if (mods.ok) ok('Python packages kokoro_onnx, soundfile, numpy');
  else fail('Python packages missing: ' + (mods.out.split('\n').pop() || 'import failed'),
    `${PY[0] === 'python' ? 'python' : 'py'} -m pip install kokoro-onnx soundfile numpy`);
}

if (fails.length) {
  console.log('\nPreflight FAILED. Install with (Windows), then run this again:');
  for (const f of [...new Set(fails)]) console.log('  ' + f);
  process.exit(1);
}
console.log('\nPreflight passed.');

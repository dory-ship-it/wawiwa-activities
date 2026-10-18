// SCORM 1.2 package (npm run package): dist/eai-m1l4-selfstudy-scorm12.zip, git-ignored, never committed.
// Runtime files only, found by following what the page really loads:
//   index.html, its stylesheets and the src/ import graph from src/main.js (unused modules stay out),
//   url(...) in those stylesheets, content/l4-slice.json and every assets/ path in the content and in src/.
// imsmanifest.xml at the zip root: one organization, one item, one SCO (adlcp:scormtype "sco",
// href index.html) listing every file. No dev tools, tests, planning, review or video sources.
// The zip is written with node:zlib (deflate raw + CRC-32), no zip library.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { ROOT } from './serve.mjs';

const OUT = join(ROOT, 'dist', 'eai-m1l4-selfstudy-scorm12.zip');
const content = JSON.parse(readFileSync(join(ROOT, 'content', 'l4-slice.json'), 'utf8'));
const files = new Set();
const missing = [];
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const add = (p) => {
  p = posix.normalize(p.replace(/\\/g, '/'));
  if (files.has(p)) return false;
  if (!existsSync(join(ROOT, p)) || !statSync(join(ROOT, p)).isFile()) { missing.push(p); return false; }
  files.add(p);
  return true;
};

// the page and its stylesheets (with their url() files)
add('index.html');
const html = read('index.html');
for (const [, href] of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) {
  if (!add(href)) continue;
  for (const [, u] of read(href).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) if (!u.startsWith('data:')) add(posix.join(posix.dirname(href), u));
}
// the module graph from the entry script
const queue = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
while (queue.length) {
  const p = queue.shift();
  if (!add(p)) continue;
  const src = read(p);
  // static (import / export ... from), side-effect (import './x.js') and dynamic (import('./x.js'))
  const specs = /(?:import|export)\s[^'";]*?from\s*['"](\.{1,2}\/[^'"]+)['"]|import\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g;
  for (const [, a, b] of src.matchAll(specs)) queue.push(posix.join(posix.dirname(p), a || b));
  for (const [, a] of src.matchAll(/['"](assets\/[^'"]+)['"]/g)) add(a);
}
// the content and every asset path in it (images, videos and captions, posters)
add('content/l4-slice.json');
const walk = (v) => {
  if (typeof v === 'string') { if (/^assets\/\S+\.\w+$/.test(v) && !v.endsWith('.md')) add(v); } // prompt notes stay out
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
};
walk(content);

if (missing.length) { console.error('package: missing files\n  ' + missing.join('\n  ')); process.exit(1); }
const list = [...files].sort();

// imsmanifest.xml (SCORM 1.2, ADL CP 1.2)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const title = esc(content.lesson.title);
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="wawiwa-eai-m1l4-selfstudy" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="wawiwa-eai-m1l4-org">
    <organization identifier="wawiwa-eai-m1l4-org">
      <title>${title}</title>
      <item identifier="wawiwa-eai-m1l4-item" identifierref="wawiwa-eai-m1l4-sco" isvisible="true">
        <title>${title}</title>
        <adlcp:masteryscore>${content.lesson.completion.passMark}</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="wawiwa-eai-m1l4-sco" type="webcontent" adlcp:scormtype="sco" href="index.html">
${list.map((f) => `      <file href="${esc(f)}"/>`).join('\n')}
    </resource>
  </resources>
</manifest>
`;

// zip writer
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const now = new Date();
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
const entries = [['imsmanifest.xml', Buffer.from(manifest, 'utf8')], ...list.map((f) => [f, readFileSync(join(ROOT, f))])];
const parts = [], central = [];
let offset = 0;
for (const [name, data] of entries) {
  const nameBuf = Buffer.from(name, 'utf8');
  const deflated = deflateRawSync(data, { level: 9 });
  const store = deflated.length >= data.length;
  const body = store ? data : deflated;
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(store ? 0 : 8, 8); local.writeUInt16LE(dosTime, 10); local.writeUInt16LE(dosDate, 12);
  local.writeUInt32LE(crc, 14); local.writeUInt32LE(body.length, 18); local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
  const cen = Buffer.alloc(46);
  cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8);
  cen.writeUInt16LE(store ? 0 : 8, 10); cen.writeUInt16LE(dosTime, 12); cen.writeUInt16LE(dosDate, 14);
  cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(body.length, 20); cen.writeUInt32LE(data.length, 24);
  cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt32LE(offset, 42);
  parts.push(local, nameBuf, body);
  central.push(cen, nameBuf);
  offset += local.length + nameBuf.length + body.length;
}
const cenBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(cenBuf.length, 12); end.writeUInt32LE(offset, 16);
mkdirSync(dirname(OUT), { recursive: true });
const zip = Buffer.concat([...parts, cenBuf, end]);
writeFileSync(OUT, zip);

const temp = list.filter((f) => f.includes('/temp/'));
console.log(`package: ${entries.length} files (imsmanifest.xml + ${list.length})`);
console.log(`  ${list.filter((f) => f.startsWith('src/')).length} src modules and styles, ${list.filter((f) => f.startsWith('assets/')).length} assets`);
if (temp.length) console.log(`  WARNING ${temp.length} temp assets packaged (placeholders, replace before release):\n    ${temp.join('\n    ')}`);
if (!existsSync(join(ROOT, 'tools', 'scorm12-schemas'))) console.log('  note: no SCORM 1.2 .xsd files in tools/scorm12-schemas, the manifest names them but they are not packaged');
console.log(`  ${posix.relative(ROOT.replace(/\\/g, '/'), OUT.replace(/\\/g, '/'))} ${(zip.length / 1024 / 1024).toFixed(2)} MB (${zip.length} bytes)`);

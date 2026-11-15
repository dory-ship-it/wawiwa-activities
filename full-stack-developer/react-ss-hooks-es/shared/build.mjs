// Builds a practice page from its strings: node shared/build.mjs p1-usestate [lang]
// Spanish is the primary language of this lesson, so `es` writes <page>/index.html and any other
// language writes <page>/index.<lang>.html. The page is static HTML: every screen, option and
// feedback box is written here from strings.<lang>.js, and shared/practice.js only shows and hides them
// (it also repeats the shown feedback in the page's one live region, for screen readers).
// This file holds no learner text. Never edit the generated HTML by hand.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const [page, lang = "es"] = process.argv.slice(2);
if (!page) { console.error("usage: node shared/build.mjs <page-folder> [lang]"); process.exit(1); }

const load = (file, key) => { const sb = { window: {} }; vm.runInNewContext(readFileSync(file, "utf8"), sb); return sb.window[key]; };
const S = load(join(here, `strings.${lang}.js`), "RH_SHARED");
const P = load(join(here, "..", page, `strings.${lang}.js`), "RH_PAGE");
const U = S.ui;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
// `code` becomes inline code and **text** becomes bold; everything else is escaped text.
const rich = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const attr = (s) => esc(s).replace(/\n/g, "&#10;");

// Word limits per screen (STORYBOARD 4.1). A breach is printed, not fixed: the fix belongs in the strings.
const words = (s) => String(s).replace(/[`*]/g, "").trim().split(/\s+/).filter(Boolean).length;
const warnings = [];
const limit = (what, text, max) => { const n = words(text); if (n > max) warnings.push(`${what}: ${n} words (limit ${max})`); };

// Code colours, as on the Node pages: strings, keywords, calls. Works on one raw line.
const KEYWORDS = "import|from|export|default|function|const|let|return|if|else|new|throw|try|catch|finally|null|true|false|async|await";
const TOKEN = new RegExp(`('[^']*'|"[^"]*")|\\b(${KEYWORDS})\\b|\\b([A-Za-z_$][\\w$]*)(?=\\()`, "g");
const paint = (line) => {
  let out = "", last = 0, m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    out += esc(line.slice(last, m.index));
    out += `<span class="${m[1] ? "s" : m[2] ? "k" : "f"}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
};

const codeBox = (code, id, withCopy) => {
  const text = code.lines.join("\n");
  const hl = code.hl || [];
  return `<div class="codebox"><div class="ttl"><span class="fn" id="${id}">${esc(code.file)}</span>` +
    (withCopy ? `<button class="copy" type="button" data-copy="${attr(text)}" data-idle="${esc(U.copy)}" data-done="${esc(U.copied)}" data-live="${esc(U.copiedLive)}" data-select="${esc(U.copySelect)}">${esc(U.copy)}</button>` : "") +
    `</div><ol aria-label="${esc(code.file)}, ${esc(U.codeLines)}">` +
    code.lines.map((l, i) => l === ""
      ? '<li class="bl" aria-hidden="true"></li>'
      : `<li${hl.includes(i + 1) ? ' class="hl"' : ""}><span class="t">${paint(l)}</span></li>`).join("") +
    "</ol></div>";
};

const fb = (kind, verdict, text, extra = "") => `<div class="fb ${kind}" hidden${extra}><b class="v">${esc(verdict)}</b> ${rich(text)}</div>`;
const nextBtn = (i, gated) => {
  const next = P.screens[i + 1];
  if (!next) return "";
  const label = next.type === "solution" ? U.seeSolution : U.next;
  return `<div class="act"><button class="btn" type="button" data-next${gated ? " disabled" : ""}>${esc(label)}</button></div>`;
};
const eyebrow = (s) => `<p class="ey">${esc(U.stepWord)} ${s.step} · ${esc(U.steps[s.step - 1])}</p>`;
const title = (s, text) => `<h1 class="ins" id="h-${s.id}" tabindex="-1">${rich(text)}</h1>`;

const body = {
  // Pick one option; instant verdict; retry allowed; Continue only after the right one.
  choice(s, i) {
    limit(`${s.id} question`, s.question, 35);
    s.options.forEach((o, k) => limit(`${s.id} option ${k + 1} feedback`, o.why, 30));
    const opts = s.options.map((o, k) => `<button class="opt" type="button" data-k="${k}"${o.correct ? " data-ok" : ""}>${rich(o.text)}</button>`).join("");
    const fbs = s.options.map((o, k) => fb(o.correct ? "ok" : "no", o.correct ? U.correct : U.incorrect, o.why, ` data-k="${k}"`)).join("") +
      (s.after ? `<p class="reveal" hidden data-after>${rich(s.after)}</p>` : "");
    return eyebrow(s) + title(s, s.question) +
      `<div class="g2">${codeBox(s.code, `c-${s.id}`, false)}<div>` +
      `<div class="opts" role="group" aria-labelledby="h-${s.id}">${opts}</div>` +
      `<div class="fbs">${fbs}</div>${nextBtn(i, true)}</div></div>`;
  },
  // Read the task and the steps, build it in Cursor, press the button.
  steps(s, i) {
    if (s.steps.length > 4) warnings.push(`${s.id}: ${s.steps.length} steps (limit 4)`);
    s.steps.forEach((t, k) => limit(`${s.id} step ${k + 1}`, t, 20));
    const list = `<ol class="how">${s.steps.map((t) => `<li><span>${rich(t)}</span></li>`).join("")}</ol>`;
    const act = `<div class="act"><button class="btn" type="button" data-next>${esc(s.button)}</button></div>`;
    const task = eyebrow(s) + `<div class="task"><p class="lab">${esc(U.task)}</p>${title(s, s.task)}</div>`;
    return s.copy
      ? task + `<div class="g2"><div>${list}${act}</div>${codeBox(s.copy, `c-${s.id}`, true)}</div>`
      : task + list + act;
  },
  // Type what your screen shows; it is compared with the measured value.
  value(s, i) {
    limit(`${s.id} question`, s.question, 35);
    limit(`${s.id} feedback`, s.ok, 30);
    s.hints.forEach((h, k) => limit(`${s.id} hint ${k + 1}`, h.text, 30));
    const fbs = fb("ok", U.correct, s.ok, " data-fb=\"ok\"") +
      s.hints.map((h, k) => fb("warn", U.mismatch, h.text, ` data-fb="hint" data-when="${attr(h.when.join("\n"))}"`)).join("") +
      `<div class="fb info" hidden data-fb="other">${rich(s.other)}</div>`;
    return eyebrow(s) + title(s, s.question) +
      `<form class="val" novalidate data-expected="${attr(s.expected.join("\n"))}">` +
      `<label class="lab" for="v-${s.id}">${esc(U.answer)}</label>` +
      `<div class="valrow"><input id="v-${s.id}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">` +
      `<button class="copy" type="submit">${esc(U.check)}</button></div></form>` +
      `<div class="fbs narrow">${fbs}</div>${nextBtn(i, true)}`;
  },
  // Reached only through the "see solution" button of the screen before it.
  solution(s, i) {
    limit(`${s.id} note`, s.note, 30);
    return eyebrow(s) + title(s, s.title || U.solutionTitle) +
      `<div class="g2">${codeBox(s.code, `c-${s.id}`, true)}<div>` +
      `<div class="fb info">${rich(s.note)}</div>${nextBtn(i, false)}</div></div>`;
  },
  takeaway(s) {
    return eyebrow(s) + title(s, s.title || U.takeawayTitle) +
      `<ul class="take">${s.points.map((p) => `<li>${rich(p)}</li>`).join("")}</ul>` +
      `<p class="back">${rich(s.back)}</p>` +
      `<p class="again"><button class="restart" type="button" data-restart>${esc(U.restart)}</button></p>`;
  }
};

const screen = (s, i) => {
  if (!body[s.type]) { console.error(`unknown screen type "${s.type}" in ${page}`); process.exit(1); }
  return `<section class="screen" id="s-${s.id}" data-type="${s.type}" data-step="${s.step}" aria-labelledby="h-${s.id}">${body[s.type](s, i)}</section>`;
};

const stepsNav = `<nav class="steps" aria-label="${esc(U.stepsLabel)}"><ol>` +
  U.steps.map((name, k) => (k ? '<li class="ar" aria-hidden="true">&rarr;</li>' : "") +
    `<li data-step="${k + 1}"><span class="sp"><b>${k + 1}</b>${esc(name)}</span></li>`).join("") + "</ol></nav>";

const html = `<!doctype html>
<html lang="${S.lang}" dir="${S.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(P.docTitle)}</title>
<!-- Generated by shared/build.mjs from strings.${lang}.js. Edit the strings, then rebuild. -->
<link rel="stylesheet" href="../shared/practice.css">
</head>
<body>
<div class="canvas">
<div class="app">
<header class="hd">
<img class="logo" src="../shared/wawiwa-logo.png" alt="${esc(U.logoAlt)}" width="62" height="26">
<p class="nm">${esc(P.name)}<span class="lead">${esc(P.lead)}</span></p>
${stepsNav}
</header>
<main class="main" id="main">
${P.screens.map(screen).join("\n")}
</main>
<footer class="ft"><span class="pg" id="pg" aria-hidden="true"></span><div class="bar" aria-hidden="true"><i id="bar"></i></div></footer>
</div>
</div>
<p class="sr" id="live" aria-live="polite"></p>
<script src="../shared/practice.js"></script>
</body>
</html>
`;

const out = join(here, "..", page, lang === "es" ? "index.html" : `index.${lang}.html`);
writeFileSync(out, html);
console.log("wrote " + out);
warnings.forEach((w) => console.warn("WORD LIMIT  " + w));

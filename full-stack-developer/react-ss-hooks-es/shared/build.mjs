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
const limit = (what, text, max) => { if (!text) return; const n = words(text); if (n > max) warnings.push(`WORD LIMIT  ${what}: ${n} words (limit ${max})`); };

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

// A code card is one file, or a list of files shown as tabs in the card's title bar.
const files = (code) => (Array.isArray(code) ? code : [code]);
// The card's size on the 1000 x 560 canvas, from practice.css: a line is 18.125 px, a blank one 7 px.
const cardHeight = (code) => Math.max(...files(code).map((c) => c.lines.reduce((h, l) => h + (l === "" ? 7 : 18.125), 0) + 45));
const longest = (code) => Math.max(...files(code).flatMap((c) => c.lines.map((l) => l.length)));
// Up to 59 characters fit the normal code column and up to 70 the wide one.
const wide = (s, code) => {
  const n = longest(code);
  if (n > 70) warnings.push(`CODE WIDTH  ${s.id}: a line of ${n} characters (the wide card holds 70)`);
  return n > 59 ? " wide" : "";
};
const tall = (s, code, room) => { const h = Math.ceil(cardHeight(code)); if (h > room) warnings.push(`CODE HEIGHT  ${s.id}: the card needs ${h} px (room ${room})`); };

const lines = (code, extra = "") => {
  const hl = code.hl || [];
  return `<ol aria-label="${esc(code.file)}, ${esc(U.codeLines)}"${extra}>` +
    code.lines.map((l, i) => l === ""
      ? '<li class="bl" aria-hidden="true"></li>'
      : `<li${hl.includes(i + 1) ? ' class="hl"' : ""}><span class="t">${paint(l)}</span></li>`).join("") +
    "</ol>";
};
const copyBtn = (code, extra = "") => `<button class="copy" type="button" data-copy="${attr(code.lines.join("\n"))}" data-idle="${esc(U.copy)}" data-done="${esc(U.copied)}" data-live="${esc(U.copiedLive)}" data-select="${esc(U.copySelect)}"${extra}>${esc(U.copy)}</button>`;
const codeBox = (code, id, withCopy) => {
  const list = files(code);
  if (list.length === 1) {
    return `<div class="codebox"><div class="ttl"><span class="fn" id="${id}">${esc(list[0].file)}</span>` +
      (withCopy ? copyBtn(list[0]) : "") + `</div>${lines(list[0])}</div>`;
  }
  const pane = (k) => ` data-pane="${k}"${k ? " hidden" : ""}`;
  return `<div class="codebox" data-tabs><div class="ttl"><div class="tabs" role="group" aria-label="${esc(U.files)}">` +
    list.map((c, k) => `<button class="tab" type="button" data-tab="${k}" aria-pressed="${k ? "false" : "true"}">${esc(c.file)}</button>`).join("") + "</div>" +
    (withCopy ? list.map((c, k) => copyBtn(c, pane(k))).join("") : "") +
    "</div>" + list.map((c, k) => lines(c, pane(k))).join("") + "</div>";
};

const fb = (kind, verdict, text, extra = "") => `<div class="fb ${kind}" hidden${extra}><b class="v">${esc(verdict)}</b>${text ? " " + rich(text) : ""}</div>`;
const nextRaw = (i, gated) => {
  const next = P.screens[i + 1];
  if (!next) return "";
  const label = next.type === "solution" ? U.seeSolution : U.next;
  return `<button class="btn" type="button" data-next${gated ? " disabled" : ""}>${esc(label)}</button>`;
};
const nextBtn = (i, gated) => { const b = nextRaw(i, gated); return b ? `<div class="act">${b}</div>` : ""; };
// The check-in has no steps: its questions are numbered instead.
const questions = P.screens.filter((s) => s.type === "choice");
const eyebrow = (s) => {
  if (P.checkin) return s.type === "choice" ? `<p class="ey">${esc(U.questionWord)} ${questions.indexOf(s) + 1} ${esc(U.of)} ${questions.length}</p>` : "";
  return `<p class="ey">${esc(U.stepWord)} ${s.step} · ${esc(U.steps[s.step - 1])}${s.sub ? `: <span class="sub">${rich(s.sub)}</span>` : ""}</p>`;
};
const title = (s, text) => `<h1 class="ins" id="h-${s.id}" tabindex="-1">${rich(text)}</h1>`;

const body = {
  // Pick one option; instant verdict; retry allowed; Continue only after the right one.
  choice(s, i) {
    limit(`${s.id} question`, s.question, 35);
    s.options.forEach((o, k) => limit(`${s.id} option ${k + 1} feedback`, o.why, 30));
    const opts = s.options.map((o, k) => `<button class="opt" type="button" data-k="${k}"${o.correct ? " data-ok" : ""}><span>${rich(o.text)}</span></button>`).join("");
    const fbs = s.options.map((o, k) => fb(o.correct ? "ok" : "no", o.correct ? U.correct : U.incorrect, o.why, ` data-k="${k}"`)).join("") +
      (s.after ? `<p class="reveal" hidden data-after>${rich(s.after)}</p>` : "");
    const answer = `<div class="opts" role="group" aria-labelledby="h-${s.id}"${P.shuffle ? " data-shuffle" : ""}>${opts}</div>` +
      `<div class="fbs">${fbs}</div>${nextBtn(i, true)}`;
    if (!s.code) return eyebrow(s) + title(s, s.question) + `<div class="solo">${answer}</div>`;
    tall(s, s.code, 338);
    return eyebrow(s) + title(s, s.question) +
      `<div class="g2${wide(s, s.code)}">${codeBox(s.code, `c-${s.id}`, false)}<div>${answer}</div></div>`;
  },
  // Mark every option that applies, then Check. Retry allowed; Continue only after the exact set.
  multi(s, i) {
    limit(`${s.id} question`, s.question, 35);
    limit(`${s.id} feedback`, s.why, 30);
    const opts = s.options.map((o, k) => `<button class="opt box" type="button" aria-pressed="false" data-k="${k}"${o.correct ? " data-ok" : ""}><span>${rich(o.text)}</span></button>`).join("");
    const answer = `<div class="opts" role="group" aria-labelledby="h-${s.id}">${opts}</div>` +
      `<div class="fbs">${fb("ok", U.correct, s.why, ' data-fb="ok"')}${fb("no", U.incorrect, U.retryMulti, ' data-fb="no"')}</div>` +
      `<div class="act"><button class="copy" type="button" data-check>${esc(U.check)}</button>${nextRaw(i, true)}</div>`;
    if (!s.code) return eyebrow(s) + title(s, s.question) + `<div class="solo">${answer}</div>`;
    tall(s, s.code, 338);
    return eyebrow(s) + title(s, s.question) +
      `<div class="g2${wide(s, s.code)}">${codeBox(s.code, `c-${s.id}`, false)}<div>${answer}</div></div>`;
  },
  // Click the lines into a mock console in the order expected (the Node pages' pattern).
  order(s, i) {
    limit(`${s.id} question`, s.question, 35);
    limit(`${s.id} feedback`, s.why, 30);
    const kinds = [...new Set(s.lines)];
    const pool = s.lines.map((l, k) => `<button class="pk c${kinds.indexOf(l)}" type="button" data-v="${kinds.indexOf(l)}" data-i="${k}"><i></i><span>${esc(l)}</span><em class="x">${esc(U.remove)}</em></button>`).join("");
    return eyebrow(s) + title(s, s.question) +
      `<div class="g2 even" data-answer="${s.answer.map((l) => kinds.indexOf(l)).join(" ")}">` +
      `<div class="term"><div class="tb"><i></i><i></i><i></i><span>${esc(U.console)}</span></div>` +
      `<ol class="bd" aria-label="${esc(U.console)}">${s.answer.map(() => '<li class="slot"></li>').join("")}</ol></div>` +
      `<div><div class="pool" role="group" aria-labelledby="h-${s.id}">${pool}</div>` +
      `<div class="fbs">${fb("ok", U.correct, s.why, ' data-fb="ok"')}${fb("no", U.incorrect, U.retryOrder, ' data-fb="no"')}</div>${nextBtn(i, true)}</div></div>`;
  },
  // Read the task and the steps, build it in Cursor (or copy the code), press the button.
  steps(s, i) {
    if (s.steps.length > 4) warnings.push(`WORD LIMIT  ${s.id}: ${s.steps.length} steps (limit 4)`);
    s.steps.forEach((t, k) => limit(`${s.id} step ${k + 1}`, t, 20));
    const list = `<ol class="how">${s.steps.map((t) => `<li><span>${rich(t)}</span></li>`).join("")}</ol>`;
    const act = `<div class="act"><button class="btn" type="button" data-next>${esc(s.button || U.next)}</button></div>`;
    const head = eyebrow(s) + (s.task ? `<div class="task"><p class="lab">${esc(U.task)}</p>${title(s, s.task)}</div>` : title(s, s.title));
    limit(`${s.id} title`, s.title, 35);
    if (!s.copy) return head + list + act;
    tall(s, s.copy, s.task ? 300 : 364);
    return head + `<div class="g2${wide(s, s.copy)}">${codeBox(s.copy, `c-${s.id}`, true)}<div>${list}${act}</div></div>`;
  },
  // Paste the console; the page keeps only the lines it knows and shows them next to the measured ones.
  paste(s, i) {
    limit(`${s.id} question`, s.question, 35);
    [s.ok, s.none, s.other, s.note].forEach((t) => limit(`${s.id} feedback`, t, 30));
    (s.missing || []).forEach((h) => limit(`${s.id} hint`, h.text, 30));
    const chip = (k) => `<span class="ch c${k}">${esc(s.known[k].short)}</span>`;
    const rows = s.expected.map((g) => `<div class="row"><span class="rl">${esc(g.label)}</span><span class="chips">${g.lines.map(chip).join("")}</span></div>`).join("");
    const fbs = fb("ok", U.match, s.ok, ' data-fb="ok"') +
      (s.missing || []).map((h) => fb("warn", U.mismatch, h.text, ` data-fb="missing" data-line="${h.line}"`)).join("") +
      fb("warn", U.mismatch, s.other, ' data-fb="other"') +
      fb("warn", U.notFound, s.none, ' data-fb="none"');
    return eyebrow(s) + title(s, s.question) +
      `<div class="g2 even" data-known="${attr(s.known.map((k) => k.text).join("\n"))}" data-expected="${s.expected.flatMap((g) => g.lines).join(" ")}">` +
      `<div><label class="lab" for="p-${s.id}">${esc(U.pasteLabel)}</label>` +
      `<textarea class="pastebox" id="p-${s.id}" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>` +
      `<div class="act"><button class="copy" type="button" data-compare>${esc(U.compare)}</button>${nextRaw(i, true)}</div>` +
      (s.note ? `<div class="fb info note" hidden data-note>${rich(s.note)}</div>` : "") + "</div>" +
      `<div><div class="cmp" hidden><p class="lab">${esc(U.expected)}</p><div class="rows">${rows}</div>` +
      `<p class="lab">${esc(U.yours)}</p><div class="chips mine"></div></div>` +
      `<div class="fbs">${fbs}</div></div></div>` +
      s.known.map((_, k) => `<template data-chip="${k}">${chip(k)}</template>`).join("");
  },
  // Type what your screen shows; it is compared with the measured value.
  value(s, i) {
    limit(`${s.id} question`, s.question, 35);
    limit(`${s.id} feedback`, s.ok, 30);
    s.hints.forEach((h, k) => limit(`${s.id} hint ${k + 1}`, h.text, 30));
    const fbs = fb("ok", U.correct, s.ok, " data-fb=\"ok\"") +
      s.hints.map((h, k) => fb("warn", U.mismatch, h.text, h.any ? ' data-fb="hint" data-any' : ` data-fb="hint" data-when="${attr(h.when.join("\n"))}"`)).join("") +
      (s.other ? `<div class="fb info" hidden data-fb="other">${rich(s.other)}</div>` : "");
    return eyebrow(s) + title(s, s.question) +
      `<form class="val" novalidate data-expected="${attr((s.expected || []).join("\n"))}"${s.pattern ? ` data-pattern="${esc(s.pattern)}"` : ""}>` +
      `<label class="lab" for="v-${s.id}">${esc(U.answer)}</label>` +
      `<div class="valrow"><input id="v-${s.id}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">` +
      `<button class="copy" type="submit">${esc(U.check)}</button></div></form>` +
      `<div class="fbs narrow">${fbs}</div>${nextBtn(i, true)}`;
  },
  // Reached only through the "see solution" button of the screen before it.
  solution(s, i) {
    limit(`${s.id} note`, s.note, 30);
    const note = s.note ? `<div class="fb info">${rich(s.note)}</div>` : "";
    const head = eyebrow(s) + title(s, s.title || U.solutionTitle);
    // A card too tall to sit under the heading takes the full height, with the heading beside it.
    if (cardHeight(s.code) > 356) {
      tall(s, s.code, 424);
      return `<div class="g2 side${wide(s, s.code)}">${codeBox(s.code, `c-${s.id}`, true)}<div>${head}${note}${nextBtn(i, false)}</div></div>`;
    }
    return head + `<div class="g2${wide(s, s.code)}">${codeBox(s.code, `c-${s.id}`, true)}<div>${note}${nextBtn(i, false)}</div></div>`;
  },
  takeaway(s) {
    return eyebrow(s) + title(s, s.title || U.takeawayTitle) +
      (s.points && s.points.length ? `<ul class="take">${s.points.map((p) => `<li>${rich(p)}</li>`).join("")}</ul>` : "") +
      (s.back ? `<p class="back">${rich(s.back)}</p>` : "") +
      `<p class="again"><button class="restart" type="button" data-restart>${esc(U.restart)}</button></p>`;
  }
};

const screen = (s, i) => {
  if (!body[s.type]) { console.error(`unknown screen type "${s.type}" in ${page}`); process.exit(1); }
  // A question above a tall code card may use the full width, so it stays on one line.
  const tight = (s.type === "choice" || s.type === "multi") && s.code && cardHeight(s.code) > 320 ? " tight" : "";
  return `<section class="screen${tight}" id="s-${s.id}" data-type="${s.type}"${P.checkin ? "" : ` data-step="${s.step}"`} aria-labelledby="h-${s.id}">${body[s.type](s, i)}</section>`;
};

const stepsNav = P.checkin ? "" : `<nav class="steps" aria-label="${esc(U.stepsLabel)}"><ol>` +
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
warnings.forEach((w) => console.warn(w));

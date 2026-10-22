// Inline stroke icons. Paths from Lucide (https://lucide.dev), ISC licence:
//   Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
//   All other copyright (c) for Lucide are held by Lucide Contributors 2022. Permission to use, copy,
//   modify, and/or distribute this software for any purpose with or without fee is hereby granted.
// Names on the left are the names the content JSON uses; the Lucide icon is named in the comment.
// 24x24 viewBox, 2px stroke, currentColor. Decorative by default (aria-hidden).

const P = {
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>', // list
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>', // route
  forms: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>', // clipboard-list
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>', // folder
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>', // shield
  lightning: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>', // zap
  scissors: '<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>', // scissors
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>', // gauge
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>', // eye
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>', // history
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>', // circle-help
  'user-question': '<path d="M14 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M16.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M19 17h.01"/>', // user + circle-help mark (composed from two Lucide icons)
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>', // ruler
  workbook: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>', // book-open
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', // clock
  person: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', // user
  check: '<path d="M20 6 9 17l-5-5"/>', // check
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', // x
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>', // info
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>', // pause
  play: '<path d="M6 3 20 12 6 21Z"/>', // play
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>', // menu
  'rail-menu': '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>', // menu, short last line (approved look rail button)
  captions: '<rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/>', // captions
  transcript: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>', // file-text
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>', // flag
  stairs: '<path d="M3 20h5v-5h5v-5h5V5h3"/>', // steps (drawn for this set in the Lucide stroke style)
  lanes: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M8 3v18"/>', // swimlanes (drawn in the Lucide stroke style)
  diamond: '<path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/>', // diamond (gateway)
  circle: '<circle cx="12" cy="12" r="9"/>', // circle (event)
  diagram: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>', // workflow
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>', // wrench
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4"/><path d="M17 5h4"/>', // sparkles (simplified)
  document: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>', // file-text
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>', // tag
  'x-square': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>', // square-x
  speech: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', // message-square
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', // circle-check
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>', // hand (stop)
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>', // cloud
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>', // compass
  hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>', // hourglass
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>', // calendar
  'gear-broken': '<circle cx="12" cy="12" r="4"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/><path d="m13.5 8.5-2 3 2 1-1.5 3"/>', // cog with a crack (drawn in the Lucide stroke style)
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>', // key
  finish: '<path d="M5 22V3"/><path d="M5 3h14v10H5"/><path d="M9.7 3v5M14.3 3v5M5 8h14M9.7 8v5M14.3 8v5"/>', // finish line flag (drawn in the Lucide stroke style)
  // chrome icons (not used by the content JSON)
  volume: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>', // volume-2
  'volume-x': '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>', // volume-x
  'chevron-left': '<path d="m15 18-6-6 6-6"/>', // chevron-left
  'chevron-right': '<path d="m9 18 6-6-6-6"/>', // chevron-right
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', // arrow-right (use instead of the arrow glyph: the font subset has none)
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', // lock
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/>', // external-link
  lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/>', // lightbulb (Round 4 board)
  'key-idea': '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 21 2"/><path d="m17 6 3 3"/><path d="m14 9 2 2"/>', // key (Round 4 board, K1 label)
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>', // bar chart (Round 4 board)
  'file-check': '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="m9 15 2 2 4-4"/>', // file-check (Round 4 board)
  arrows: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>', // arrow-right-left (Round 4 board)
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>', // database (Round 4 board)
  'shield-check': '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>', // shield-check (Round 4 board)
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', // target (Round 4 board)
  fork: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7"/><path d="M12 12v5"/>', // git-fork (Round 4 board)
  pointer: '<path d="M22 14a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15V4a2 2 0 0 1 4 0v5a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v1a2 2 0 0 1 3 1.73z"/>', // hand pointer (the ghost hand, Round 4 board)
  maximize:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>', // maximize
  minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>', // minimize
  'rotate-ccw':'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>', // rotate-ccw
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>', // map
};

// The "Hybrid cinematic" glyphs (NL1), copied from planning/design-reference/hybrid-cinematic/
// screens-intro-ch2.html: custom line icons on a 24 grid, 1.9 stroke, round caps (not Lucide). One
// task icon per step verb, the two player glyphs, and the shell's own marks (bold check and cross,
// lock, arrows, close, quote mark, the hand). [viewBox, stroke width, body]; fill / stroke colours
// come from CSS (currentColor), never from here.
const G = {
  // task verbs (the top step bar, the step field in content JSON)
  start: [24, 1.9, '<path d="M6 21V4M6 4h11l-2.2 4L17 12H6"/>'],
  overview: [24, 1.9, '<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14"/>'],
  goals: [24, 1.9, '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'],
  decide: [24, 1.9, '<path d="M9.3 9a2.7 2.7 0 1 1 3.8 2.5c-.7.3-1.1 1-1.1 1.8v.6"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/>'],
  write: [24, 1.9, '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>'],
  sketch: [24, 1.9, '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>'],
  guess: [24, 1.9, '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>'],
  watch: [24, 1.9, '<path d="M9 7.2v9.6l7.8-4.8z" fill="currentColor"/>'],
  learn: [24, 1.9, '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z"/>'],
  sort: [24, 1.9, '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/><path d="M10.5 7h3.5a3 3 0 0 1 3 3v1.5M15 9.5l2 2 2-2"/>'],
  label: [24, 1.9, '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8.5 8.5-9 9z"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/>'],
  explore: [24, 1.9, '<circle cx="10.5" cy="10.5" r="6"/><path d="M20 20l-5-5"/>'],
  // NL4 (Chapter 6 "Check"): the check-circle icon above, drawn on the glyph grid and stroke
  check: [24, 1.9, '<circle cx="12" cy="12" r="8.5"/><path d="M8.6 12.2l2.3 2.3 4.5-4.6"/>'],
  // the two player glyphs (same grid, stroke and caps); muted = the speaker with a cross
  'g-pause': [24, 1.9, '<path d="M9 6.5v11M15 6.5v11"/>'],
  'g-volume': [24, 1.9, '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'],
  'g-muted': [24, 1.9, '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'],
  // shell marks
  'g-check': [24, 3, '<path d="M5 12.5l4.5 4.5L19 7.5"/>'],
  'g-check-b': [24, 3.2, '<path d="M5 12.5l4.5 4.5L19 7.5"/>'],
  'g-cross': [24, 3.2, '<path d="M7 7l10 10M17 7L7 17"/>'],
  'g-lock': [24, 2.2, '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'],
  'g-arrow': [24, 2.2, '<path d="M5 12h13M13 6l6 6-6 6"/>'],
  'g-arrow-o1': [24, 2.4, '<path d="M5 12h13M13 6l6 6-6 6"/>'],
  'g-arrow-long': [24, 2.2, '<path d="M4 12h15M14 6l6 6-6 6"/>'],
  'g-close': [24, 2, '<path d="M6 6l12 12M18 6L6 18"/>'],
  'g-hand': [24, 1.8, '<path d="M9 11V4.6a1.6 1.6 0 0 1 3.2 0V10m0-1.2a1.6 1.6 0 0 1 3.2 0V10m0-.6a1.6 1.6 0 0 1 3.2 0v1.2m0 0a1.4 1.4 0 0 1 2.8 0V15a6.3 6.3 0 0 1-6.3 6.3h-1.8a6.3 6.3 0 0 1-4.9-2.3L4.4 15.4a1.5 1.5 0 0 1 2.3-2L9 15.5V11"/>'],
  // feedback strip leads: a filled disc with a white mark (the bulb is "guess")
  'g-ok-disc': [24, 2.6, '<circle cx="12" cy="12" r="11" class="w-gd"/><path d="M6.5 12.5l3.5 3.5 7.5-7.5" class="w-gm"/>'],
  'g-no-disc': [24, 2.6, '<circle cx="12" cy="12" r="11" class="w-gd"/><path d="M8 8l8 8M16 8l-8 8" class="w-gm"/>'],
  // the drag grip of a sort card (six dots, 10 x 16)
  'g-grip': [[10, 16], 0, '<g fill="currentColor" stroke="none"><circle cx="2" cy="2" r="1.4"/><circle cx="8" cy="2" r="1.4"/><circle cx="2" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="2" cy="14" r="1.4"/><circle cx="8" cy="14" r="1.4"/></g>'],
  // the quote mark (filled, 40 x 30)
  'g-quote': [[40, 30], 0, '<path d="M0 30V17C0 7 6 1 16 0v6c-5 1-8 5-8 10h8v14zm22 0V17c0-10 6-16 16-17v6c-5 1-8 5-8 10h8v14z" class="w-gq"/>'],
};

export const ICON_NAMES = [...Object.keys(P), ...Object.keys(G)];

// glyph('decide', { size: 21.76 }) -> <svg> from the Hybrid cinematic set. size = width in stage px
// (height follows the viewBox). Decorative unless a label is given.
export function glyph(name, { size = 24, label = null, className = '' } = {}) {
  const [vb, sw, body] = G[name] || G.decide;
  if (!G[name]) console.warn('icons.js: unknown glyph', name);
  const [w, hgt] = Array.isArray(vb) ? vb : [vb, vb];
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(Math.round((size * hgt / w) * 100) / 100));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  if (sw) svg.setAttribute('stroke-width', String(sw));
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', ('w-glyph ' + className).trim());
  if (label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); }
  else svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = body;
  return svg;
}
export const isGlyph = (name) => name in G;

// icon('check', { size: 24, label: 'Correct' }) -> <svg>. With a label the icon is meaningful
// (role img + aria-label); without, it is decorative (aria-hidden).
export function icon(name, { size = 24, label = null, className = '' } = {}) {
  if (isGlyph(name)) return glyph(name, { size, label, className: ('w-icon ' + className).trim() });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', ('w-icon ' + className).trim());
  if (label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); }
  else svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = P[name] || '';
  if (!P[name]) console.warn('icons.js: unknown icon', name);
  return svg;
}

// PP1 (personal path): the goal tag and the support / stretch variants of the eight adaptive screens
// (S09, S10, S11, S12 in the HR demo chapter; S14, S15, S16, S17 in Critical eye), written into
// content/l4-slice.json. Core = the screen as it is (untouched). A variant overrides only the fields that
// change (src/adapt.js merges it over the screen). Text only from EAI-M01-L04.pptx (sources = its slides);
// pilotCopy marks a variant with an estimated number or a constructed detail that is not in the deck.
// Usage: node tools/pp1-content.mjs   (idempotent: an existing goal / variants block is replaced)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './serve.mjs';

const FILE = join(ROOT, 'content', 'l4-slice.json');
const raw = readFileSync(FILE, 'utf8');
const EOL = raw.includes('\r\n') ? '\r\n' : '\n';
let t = raw.replace(/\r\n/g, '\n');

const fb = (correct, wrong) => ({ correct, wrong });

const V = {
  /* ---- S09 sort deck, Field 5 (g2) ---- */
  S09: {
    goal: 'g2',
    support: {
      hint: 'Field 5 lists each source, its owner, and its sensitivity tag. Press 1 to 4, then Enter.',
      cards: [
        { n: 1, text: 'Vacation policy', column: 'a', feedback: fb('Placed. A knowledge source: the document an HR answer depends on.', 'Field 5 has three parts: source, owner, tag. A policy is a document. Which part is that?') },
        { n: 2, text: 'Pension policy', column: 'a', feedback: fb('Placed. Another source the HR staff read before they answer.', 'Staff read this document before they answer. Of source, owner and tag, which one is a document?') },
        { n: 3, text: 'HR manager', column: 'b', feedback: fb('Placed. The owner keeps the policies current. When one goes stale, the map names who updates it.', 'An owner is who keeps a source current and correct. This is a role. Which part fits a role?') },
        { n: 4, text: 'INTERNAL', column: 'c', feedback: fb('Placed. The sensitivity tag decides what may go to an AI tool. The policies stay inside the company.', 'This word is one of the four sensitivity levels in the band above. Which part holds a level?') },
        { n: 5, text: 'WhatsApp question arrives', column: 'd', feedback: fb('Kept out. That starts the process. It is the trigger, Field 2.', 'Field 5 is about knowledge: sources, owners, tags. This card is about how the process starts.') },
        { n: 6, text: 'Staff check the topic', column: 'd', feedback: fb('Kept out. That is a step with its role owner, Field 3.', 'Field 5 is about knowledge: sources, owners, tags. This card is a step someone does.') },
      ],
      tracking: [{ id: 'L4_S09_1', type: 'matching', correctResponse: '1.a,2.a,3.b,4.c,5.d,6.d', scored: false, bloom: 'Understand', result: 'graded' }],
      sources: ['s14', 's17', 's18', 's20', 's22'],
    },
    stretch: {
      pilotCopy: 'the owner (finance controller) and the CONFIDENTIAL tag for supplier bank details are constructed, not in the deck',
      hint: 'Ask: what does this card tell the map, and does it happen today? Keys 1 to 4, then Enter.',
      cards: [
        { n: 1, text: 'Receipt record', column: 'a', feedback: fb('Placed. In the car-company case, payment later ran straight from this record.', 'Ask what the matching step reads, and what a wrong copy would break.') },
        { n: 2, text: 'Supplier invoice', column: 'a', feedback: fb('Placed. One of the three documents the clerks reconcile today.', 'Placed here, the map loses track of what the matching depends on.') },
        { n: 3, text: 'Finance controller', column: 'b', feedback: fb('Placed. When the payment rules change, the map names who must update them.', 'Ask what this role would keep current if the rules changed.') },
        { n: 4, text: 'CONFIDENTIAL', column: 'c', feedback: fb('Placed. Supplier bank details are financial data. They stay out of public AI tools.', 'Ask what this word decides about the data, not about the people.') },
        { n: 5, text: 'Clerks match documents', column: 'd', feedback: fb('Kept out. Matching is a step and a manual check: Fields 3 and 6.', 'It names documents, but it says what people do with them.') },
        { n: 6, text: 'AI reads every invoice', column: 'd', feedback: fb('Kept out. No AI runs here today. Adding it while mapping turns the AS-IS map into a plan.', 'Ask whether this happens on a normal day in accounts payable, as it runs now.') },
      ],
      tracking: [{ id: 'L4_S09_1', type: 'matching', correctResponse: '1.a,2.a,3.b,4.c,5.d,6.d', scored: false, bloom: 'Understand', result: 'graded' }],
      sources: ['s14', 's16', 's22', 's29', 's30', 's44'],
    },
  },

  /* ---- S10 fill, Field 7 (g3) ---- */
  S10: {
    goal: 'g3',
    support: {
      hint: "Field 7 is where it is allowed, even desirable, to write 'unclear'.",
      options: [
        { id: 'a', label: 'No gaps: staff answer every question', correct: false, feedback: 'That hides the gap the map is meant to show. Field 7 records what nobody knows yet.' },
        { id: 'b', label: 'Unclear how many answers were wrong', correct: true, feedback: "'Unclear' is a legitimate answer. Field 7 now shows what to investigate before Lesson 5." },
        { id: 'c', label: 'A chatbot will check answers soon', correct: false, feedback: 'That is a future tool. The map describes the current state; AI is a future step.' },
        { id: 'd', label: 'Most answers are probably right', correct: false, feedback: 'A guess with nothing behind it. Field 7 records what is unclear, not what you hope.' },
      ],
      tracking: [{ id: 'L4_S10_1', type: 'choice', correctResponse: 'b', scored: false, bloom: 'Apply', result: 'graded' }],
      sources: ['s16', 's19', 's38'],
    },
    stretch: {
      pilotCopy: 'the case line (mismatches fixed by hand, not logged) is constructed from the car-company case',
      coach: { kind: 'practice', tip: 'Ask what the team could prove today with the records it keeps.', tipDrafted: true },
      hint: 'Ask: what could this team prove today from its own records?',
      situation: { icon: 'speech', text: 'Accounts payable: clerks fix mismatched invoices. Nobody logs how often.' },
      fieldRows: [
        { id: 'f6', label: 'Field 6, Existing controls:', value: 'manual match of three documents', prefilled: true, from: 's30' },
        { id: 'f7', label: 'Field 7, Gaps:', value: null, active: true },
      ],
      options: [
        { id: 'a', label: 'Mismatches are rare, the clerks say', correct: false, feedback: 'A belief nobody has counted. The map now holds a guess as if it were known.' },
        { id: 'b', label: 'Mismatch rate: as at peer companies', correct: false, feedback: "Someone else's number. Your own gap stays hidden, and Lesson 5 builds on a borrowed fact." },
        { id: 'c', label: 'Matching software will log mismatches', correct: false, feedback: "A future tool on an AS-IS map. Today's gap disappears behind a plan." },
        { id: 'd', label: 'Mismatch rate: unclear, not logged today', correct: true, feedback: 'Field 7 now says what to measure before anything is built on it.' },
      ],
      tracking: [{ id: 'L4_S10_1', type: 'choice', correctResponse: 'd', scored: false, bloom: 'Apply', result: 'graded' }],
      sources: ['s16', 's29', 's30', 's37', 's38'],
    },
  },

  /* ---- S11 metric, Field 8 (g4): Noy's approved text, word for word ---- */
  S11: {
    goal: 'g4',
    support: {
      hint: 'A checkable metric has three parts: today\'s number, a target, a date.',
      options: [
        { id: 'a', label: 'HR team feels less busy', correct: false, checks: { baseline: false, target: false, date: false }, feedback: 'A feeling cannot be compared before and after. You need a number, not a feeling.' },
        { id: 'b', label: 'HR answers improve significantly', correct: false, checks: { baseline: false, target: false, date: false }, feedback: "'Significant' has no number. Nobody can check it later." },
        { id: 'c', label: 'HR time on repeats: 20% within 3 months', correct: false, checks: { baseline: false, target: true, date: true }, feedback: "Twenty percent, down from what? A baseline is today's number, even estimated." },
        { id: 'd', label: 'HR time on repeats: ~35% now, 20% in 3 months', correct: true, checks: { baseline: true, target: true, date: true }, feedback: "Today's number, a target, a date. Checkable later." },
      ],
      tracking: [{ id: 'L4_S11_1', type: 'choice', correctResponse: 'd', scored: false, bloom: 'Evaluate', result: 'graded' }],
      sources: ['s19', 's20', 's37'],
    },
    stretch: {
      pilotCopy: 'the minutes per invoice (~20 now, 5 within 6 months) and the competitor figure are estimated, not in the deck',
      context: 'Accounts payable: staff match three documents by hand for every invoice.',
      hint: 'Ask: is this your own number, and could someone check it later?',
      options: [
        { id: 'a', label: 'AI matching tool live in all teams within 6 months', correct: false, checks: { baseline: false, target: true, date: true }, feedback: 'That measures a future tool, not the process. The map stays AS-IS.' },
        { id: 'b', label: "Matching 30% faster than a competitor's team", correct: false, checks: { baseline: false, target: true, date: false }, feedback: 'Their number, not yours. Without your own baseline, no change can be shown.' },
        { id: 'c', label: 'Matching errors: down from today, near zero', correct: false, checks: { baseline: false, target: false, date: false }, feedback: "'Today' with no number and no date. Close, but nobody can check it." },
        { id: 'd', label: 'Time per invoice on matching: ~20 min now, 5 min within 6 months', correct: true, checks: { baseline: true, target: true, date: true }, feedback: 'Your own baseline, a target and a date. Estimated is fine.' },
      ],
      tracking: [{ id: 'L4_S11_1', type: 'choice', correctResponse: 'd', scored: false, bloom: 'Evaluate', result: 'graded' }],
      // the three-part band is the rule the stretch hint holds back; without it the approved case line and
      // the longer answers fit the panel (the template's no-band layout: the Field 8 label over the heading)
      band: null,
      sources: ['s16', 's29', 's30', 's37'],
    },
  },

  /* ---- S12 flags on the full HR map (g1). Both levels keep the HR map: it is the canon the chapter
     built (S21R links here too), so stretch is harder through the hint and the feedback only ---- */
  S12: {
    goal: 'g1',
    support: {
      hint: 'A handoff is the moment responsibility passes from one role to another. Flag where it passes, and its risk.',
      map: [
        { n: 1, feedback: 'Field 1 names the process. A handoff is where responsibility passes between roles; the name shows no role.' },
        { n: 2, feedback: 'Field 2 is the trigger, how the process starts. The handoff comes later, between two roles.' },
        { n: 3, feedback: 'Field 3 lists the steps and their owners. The handoff field shows the moment between them.' },
        { n: 4, feedback: 'Field 4: responsibility passes from HR staff to the HR manager.' },
        { n: 5, feedback: 'Field 5 lists sources, owners and tags. A handoff is responsibility passing between roles.' },
        { n: 6, feedback: 'Field 6 is how answers get checked. It says nothing about responsibility passing.' },
        { n: 7, feedback: 'Field 7 records the risk at that handoff: no single channel.' },
        { n: 8, feedback: 'Field 8 is the success metric. It does not show where responsibility passes.' },
      ],
      feedbackCorrect: 'Field 4 shows responsibility passing from HR staff to the HR manager. Field 7 records the risk there: no single channel.',
      sources: ['s17', 's19', 's20', 's27'],
    },
    stretch: {
      hint: 'Ask: if a question got lost, which two fields would show you where?',
      context: "The full HR map from this chapter's demo: all eight fields.",
      map: [
        { n: 1, feedback: 'A name frames the process. A lost question would not show up here.' },
        { n: 2, feedback: 'Questions start here and arrive fine. Look further along the process.' },
        { n: 3, feedback: 'Each step here has an owner who finishes it. Flagged here, the lost question stays unexplained.' },
        { n: 4, feedback: 'Field 4 shows the question moving from HR staff to the HR manager.' },
        { n: 5, feedback: 'A stale policy gives a wrong answer, not a lost question.' },
        { n: 6, feedback: 'No control means nobody checks the answers. A lost question is a different risk.' },
        { n: 7, feedback: 'Field 7 adds the risk: no single channel for that handoff.' },
        { n: 8, feedback: 'The metric tracks time spent. It would not show where a question went missing.' },
      ],
      sources: ['s20', 's27', 's34'],
    },
  },

  /* ---- S14 handoff on a case card (g1) ---- */
  S14: {
    goal: 'g1',
    support: {
      hint: 'On a good map, every handoff is marked: from whom to whom, what passes, and what if the receiver is unavailable.',
      options: [
        { id: 'a', label: 'Sender, receiver, what passes', correct: false, feedback: 'Missing: what if the receiver is unavailable. Here the manager is away, and the question waits.' },
        { id: 'b', label: 'Sender, receiver, if unavailable', correct: false, feedback: 'Missing: what passes. The manager gets the question without the history behind it.' },
        { id: 'c', label: 'Sender, receiver, what passes, if unavailable', correct: true, feedback: 'All four parts of a handoff. Nothing covers the away case, so Field 7 records it.' },
        { id: 'd', label: 'What passes, and if unavailable', correct: false, feedback: 'Missing: who sends and who receives. The map cannot show where responsibility changes hands.' },
      ],
      tracking: [{ id: 'L4_S14_1', type: 'choice', correctResponse: 'c', scored: false, bloom: 'Analyze', result: 'graded' }],
      sources: ['s17', 's20', 's27'],
    },
    stretch: {
      pilotCopy: 'the handoff (service agent to the disputes team, contact away) and the playbook are constructed from the fintech case',
      coach: { kind: 'practice', tip: 'Picture the contact away for a week. What would the next person need to know?', tipDrafted: true },
      hint: 'Ask: if this dispute stalls, could the map show you why?',
      stage: { top: { text: 'A customer disputes a charge. The agent sends it to disputes, whose contact is away.' } },
      visual: { from: 'Service agent', to: 'Disputes team', alt: 'Handoff: the dispute passes from the service agent to the disputes team, which is greyed out: the contact is away.' },
      options: [
        { id: 'a', label: 'Agent to disputes, with the chat', correct: false, feedback: 'Sender, receiver and what passes are there. With the contact away, nobody can see where the dispute now waits.' },
        { id: 'b', label: 'Agent to disputes, and if unavailable', correct: false, feedback: "The away case is there, but not what passes. The disputes team starts without the customer's story." },
        { id: 'c', label: 'Agent to disputes, per the playbook', correct: false, feedback: 'The playbook shows how it should run. If today differs, the map hides the real gap.' },
        { id: 'd', label: 'Agent to disputes: chat, if unavailable', correct: true, feedback: 'Sender, receiver, what passes, and the away case. Nobody covers today, so Field 7 records that.' },
      ],
      tracking: [{ id: 'L4_S14_1', type: 'choice', correctResponse: 'd', scored: false, bloom: 'Analyze', result: 'graded' }],
      sources: ['s25', 's26', 's27', 's34'],
    },
  },

  /* ---- S15 bottleneck on a case card (g5) ---- */
  S15: {
    goal: 'g5',
    support: {
      hint: 'A bottleneck is a step limited by the slowest resource. Before throwing AI at it, ask why it formed.',
      stage: { top: { eyebrow: 'Back to the HR case', text: 'Every question beyond policy waits for one person: the HR manager.', highlight: 'one person' } },
      options: [
        { id: 'a', label: 'Why do these questions reach the manager?', correct: true, feedback: 'You asked why the bottleneck formed. Sometimes the right fix is to remove the step, not speed it up.' },
        { id: 'b', label: 'Which AI tool could answer for the manager?', correct: false, feedback: 'That throws AI at the bottleneck before asking why it formed. The slow step stays, now faster.' },
        { id: 'c', label: 'How can the manager answer faster?', correct: false, feedback: 'A faster manager keeps the same step. First ask why the bottleneck formed at all.' },
      ],
      tracking: [{ id: 'L4_S15_1', type: 'choice', correctResponse: 'a', scored: false, bloom: 'Apply', result: 'graded' }],
      sources: ['s17', 's20', 's28'],
    },
    stretch: {
      hint: 'Ask: what would happen if this step disappeared?',
      stage: { top: { eyebrow: 'Accounts payable, US car company, early 1980s', text: 'Most of the work of 500 staff goes to matching three documents by hand.', highlight: '500 staff' } },
      options: [
        { id: 'a', label: 'How does a rival do it with 100 staff?', correct: false, feedback: 'Their result, not your process. Without knowing why your step formed, nothing tells you what to change.' },
        { id: 'b', label: 'Which software would match the documents faster?', correct: false, feedback: 'Faster technology on an unexamined step entrenches it, faster and at larger scale.' },
        { id: 'c', label: 'Why must three documents be matched at all?', correct: true, feedback: 'The cause decides the fix. Here payment could run from the receipt record, and the step could go.' },
      ],
      tracking: [{ id: 'L4_S15_1', type: 'choice', correctResponse: 'c', scored: false, bloom: 'Apply', result: 'graded' }],
      sources: ['s6', 's28', 's29', 's30'],
    },
  },

  /* ---- S16 sort deck, where AI fits (g5) ---- */
  S16: {
    goal: 'g5',
    support: {
      hint: "Good fit: free text, low risk, lossy handoffs. Poor: money, disorder, 'unclear'.",
      cards: [
        { n: 1, text: 'Tag questions by topic', column: 'a', feedback: fb('Good fit, unstructured to structured: a free-text question in, a topic out.', 'The slide asks: what goes in, what comes out? A question is free text. What comes out?') },
        { n: 2, text: 'Approve a pension exception', column: 'd', feedback: fb('Poor fit: money and rights at stake, hard to undo. That needs clear human judgment.', 'The slide marks money, rights and irreversible calls. Who carries a wrong answer here?') },
        { n: 3, text: 'Mark urgent or routine', column: 'b', feedback: fb('Good fit, a low-risk decision: it can be accelerated, with a person watching.', 'The slide sorts decisions by risk. How much harm does one wrong label do, and how fast is it caught?') },
        { n: 4, text: 'Sort out three unmanaged channels', column: 'd', feedback: fb('Poor fit, a process problem: the trouble is disorder, not missing information.', 'The slide asks: is the problem disorder, or missing information? Which is it here?') },
        { n: 5, text: "Build on 'unclear' error counts", column: 'd', feedback: fb('Poor fit: you cannot build a solution on unknown foundations. Diagnose first.', "The slide warns about building on a map full of 'unclear'. What does the map know here?") },
        { n: 6, text: 'Pass history to the manager', column: 'c', feedback: fb('Good fit, a handoff with delay or loss: AI documents what passes, so the manager gets the history.', 'The slide names handoffs that lose information. What does the manager receive today?') },
      ],
      tracking: [{ id: 'L4_S16_1', type: 'matching', correctResponse: '1.a,2.d,3.b,4.d,5.d,6.c', scored: false, bloom: 'Analyze', result: 'graded' }],
      sources: ['s19', 's32', 's33'],
    },
    stretch: {
      hint: 'What goes in, what is at stake, what is known?',
      cards: [
        { n: 1, text: 'Summarize a customer chat', column: 'a', feedback: fb('Good fit, unstructured to structured: a free-text chat in, a short summary out.', 'Look at what goes in and what comes out. Is a decision made here at all?') },
        { n: 2, text: 'Decide a disputed charge', column: 'd', feedback: fb("Poor fit: money at stake and hard to undo. Per reports, the fintech's quality dropped on disputes.", 'If this call is wrong, who carries the loss, and can it be undone?') },
        { n: 3, text: 'Route simple requests', column: 'b', feedback: fb('Good fit, a low-risk decision. Per reports, AI did as well as people on simple requests.', 'Ask how much one wrong route would cost, and how fast it would be caught.') },
        { n: 4, text: 'Speed up three-document matching', column: 'd', feedback: fb('Poor fit, a process problem. The car company removed this step instead of speeding it up.', 'Ask whether this step should exist before asking how fast it runs.') },
        { n: 5, text: "Draft replies where the map says 'unclear'", column: 'd', feedback: fb('Poor fit: drafting looks safe, but the foundations are unknown. This needs diagnosis first.', 'Drafting can fit. Check what the map actually knows before building on it.') },
        { n: 6, text: 'Brief whoever takes a dispute', column: 'c', feedback: fb('Good fit, a handoff with delay or loss: AI documents the case, so the next person starts informed.', 'Nothing is decided here. Think about what the next person receives today.') },
      ],
      tracking: [{ id: 'L4_S16_1', type: 'matching', correctResponse: '1.a,2.d,3.b,4.d,5.d,6.c', scored: false, bloom: 'Analyze', result: 'graded' }],
      sources: ['s25', 's26', 's30', 's32', 's33'],
    },
  },

  /* ---- S17 five mistakes, one case at a time (g5) ---- */
  S17: {
    goal: 'g5',
    support: {
      pilotCopy: 'case c (a fourth channel added last month) is a constructed later change, as the core\'s case d',
      hint: 'AS-IS = as it happens now, in practice, on a normal day.',
      cards: [
        { id: 'a', text: "The map shows HR's written procedure, not a normal day.", column: '1', feedback: fb('Mapping the aspirational state instead of the actual one. Map what happens, not what is supposed to.', 'Nothing was skipped, changed or automated. Compare the map with a normal day in HR.') },
        { id: 'b', text: 'Fields 6 to 8 are empty: the mapper ran out of time.', column: '3', feedback: fb('Rushing the mapping itself. The hard fields hold the findings Lesson 5 needs.', 'The map may match today. Look at which fields stayed empty, and why.') },
        { id: 'c', text: 'HR added a fourth channel last month. The map shows three.', column: '4', feedback: fb('Neglecting to update the map after changes. It was right once, and now it is not.', 'The map was accurate when drawn. What happened after it?') },
        { id: 'd', text: 'AI will answer the WhatsApp questions, with nothing else changed.', column: '5', feedback: fb('Automating a broken process, the most critical mistake. The disorder runs faster.', 'The map may be fine. Look at what is about to be done to the process.') },
        { id: 'e', text: 'Nobody said what the HR map should help decide.', column: '2', feedback: fb('No clear goal for the mapping. Without a question, the map decides nothing.', 'The map may be accurate and complete. Ask what it was drawn for.') },
      ],
      tracking: [{ id: 'L4_S17_1', type: 'matching', correctResponse: 'a.1,b.3,c.4,d.5,e.2', scored: false, bloom: 'Analyze', result: 'graded' }],
      sources: ['s16', 's17', 's34'],
    },
    stretch: {
      pilotCopy: 'the cases are constructed from the car-company and fintech cases (skipped steps, mapping deadline)',
      hint: 'Ask: what did the mapper do, or fail to do?',
      cards: [
        { id: 'a', text: 'The AP map was drawn from the finance manual. Clerks skip half its steps.', column: '1', feedback: fb('The map describes the procedure, not a normal day. The real gaps stay hidden.', 'Nothing changed after the map was drawn. Compare it with what clerks actually do.') },
        { id: 'b', text: 'Payment now runs from the receipt record. The map still shows invoice matching.', column: '4', feedback: fb('The map was right once. Lesson 5 would build on a step that no longer exists.', 'The map matched the process when drawn. What happened since?') },
        { id: 'c', text: 'Software will match the three documents faster. Nobody asked why matching exists.', column: '5', feedback: fb('The most critical mistake. The car company removed this step; speeding it up keeps the mess.', 'The map may be accurate. Look at what is about to be done with the step.') },
        { id: 'd', text: 'The fintech mapped every service step, with no question it should answer.', column: '2', feedback: fb('Without a question, nobody can say which steps or boundaries matter. The map grows and decides nothing.', 'The map may be accurate and complete. Ask what it was drawn to decide.') },
        { id: 'e', text: "Due in an hour, the fintech's map lists steps but no controls or gaps.", column: '3', feedback: fb('Controls and gaps are where the findings live. Skipping them leaves Lesson 5 nothing to protect against.', 'The steps may be accurate. Look at what the deadline cut.') },
      ],
      tracking: [{ id: 'L4_S17_1', type: 'matching', correctResponse: 'a.1,b.4,c.5,d.2,e.3', scored: false, bloom: 'Analyze', result: 'graded' }],
      sources: ['s16', 's21', 's25', 's29', 's30', 's34'],
    },
  },
};

// S12: a variant's map keeps the core's fields (title, text, correct) and changes the feedback only
const core = JSON.parse(t);
for (const lv of ['support', 'stretch']) {
  const base = core.screens.find((s) => s.id === 'S12').map;
  V.S12[lv].map = base.map((f) => ({ ...f, ...V.S12[lv].map.find((x) => x.n === f.n) }));
}

const indent = (s, n) => s.split('\n').map((l, i) => (i ? ' '.repeat(n) + l : l)).join('\n');
for (const [id, { goal, ...variants }] of Object.entries(V)) {
  const a = t.indexOf(`"id": "${id}",`);
  if (a < 0) throw new Error('no screen ' + id);
  const next = t.indexOf('\n    {\n      "id": "', a);
  let b = t.lastIndexOf('\n    }', next < 0 ? t.length : next);
  let body = t.slice(a, b);
  // idempotent: drop an earlier goal line and variants block
  body = body.replace(/\n {6}"goal": "g\d",/, '').replace(/,\n {6}"variants": \{[\s\S]*$/, '');
  body = body.replace(`"id": "${id}",`, `"id": "${id}",\n      "goal": "${goal}",`);
  body += ',\n      "variants": ' + indent(JSON.stringify(variants, null, 2), 6);
  t = t.slice(0, a) + body + t.slice(b);
}
// the two checkpoints (src/adapt.js): the chapter each opens, the items it counts, the neutral interaction
const ADAPT = {
  $comment: 'PP1 personal path: silent adaptive practice (src/adapt.js). Entering a checkpoint chapter sets its level once from the first answers to items (fewer than minAnswered answered = core) and records it as trackingId (neutral, unscored). The level picks screen.variants.support / .stretch on the adaptive screens of that chapter; core = the screen itself. The level is never shown to the learner.',
  checkpoints: [
    { key: 'c4', chapter: 'ch3', trackingId: 'L4_PATH_C4', minAnswered: 6, items: ['L4_S01_1', 'L4_S03_1', 'L4_S04_1', 'L4_S05B_1', 'L4_S06_1', 'L4_S06_2', 'L4_S08_1', 'L4_S08_2', 'L4_S08_3'] },
    { key: 'c5', chapter: 'ch4', trackingId: 'L4_PATH_C5', minAnswered: 3, items: ['L4_S09_1', 'L4_S10_1', 'L4_S11_1', 'L4_S12_1'] },
  ],
};
t = t.replace(/,\n {4}"adapt": \{[\s\S]*?\n {4}\}(?=\n {2}\},\n\n {2}"ui")/, '');
const end = t.indexOf('\n  },\n\n  "ui"');
if (end < 0) throw new Error('no end of lesson');
t = t.slice(0, end) + ',\n    "adapt": ' + indent(JSON.stringify(ADAPT, null, 2), 4) + t.slice(end);
JSON.parse(t); // still valid
writeFileSync(FILE, t.replace(/\n/g, EOL), 'utf8');
console.log('pp1 content: goal and variants written for ' + Object.keys(V).join(', '));

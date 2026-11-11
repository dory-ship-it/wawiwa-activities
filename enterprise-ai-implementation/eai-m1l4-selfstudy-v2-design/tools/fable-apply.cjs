// FABLE PASS copy edits: always starts from content/l4-slice.before-pilot.json (= the v2 text at repo commit a8aabc9), replaces exact string values inside one
// screen's span of the raw file (so the file's own formatting stays), then validates.
const fs = require('fs');
const SRC = __dirname + '/../content/l4-slice.before-pilot.json', OUT = __dirname + '/../content/l4-slice.json';
let t = fs.readFileSync(SRC, 'utf8');
const ids = JSON.parse(t).screens.map((s) => s.id);
const start = t.indexOf('"screens": [', t.indexOf('"chapters"') + 10 > 0 ? t.lastIndexOf('"screens": [') : 0);
const errs = [];
function span(id) {
  const pos = ids.map((x) => t.indexOf('"id": "' + x + '"', start)).sort((a, b) => a - b);
  const a = t.indexOf('"id": "' + id + '"', start);
  const b = pos.find((p) => p > a) ?? t.length;
  return [a, b];
}
// R(screen, old, new [, expectedCount]): every occurrence of the exact string value in that screen
function R(id, oldS, newS, want) {
  const [a, b] = span(id);
  const seg = t.slice(a, b), k = JSON.stringify(oldS);
  const n = seg.split(k).length - 1;
  if (!n) { errs.push(`${id}: not found: ${oldS}`); return; }
  if (want && n !== want) errs.push(`${id}: ${n} hits (wanted ${want}): ${oldS}`);
  t = t.slice(0, a) + seg.split(k).join(JSON.stringify(newS)) + t.slice(b);
}
// K(screen, key, old, new): only where it is the value of that key (for short, ambiguous strings)
function K(id, key, oldS, newS, want) {
  const [a, b] = span(id);
  const seg = t.slice(a, b), k = JSON.stringify(key) + ': ' + JSON.stringify(oldS);
  const n = seg.split(k).length - 1;
  if (!n) { errs.push(`${id}: not found: ${key}: ${oldS}`); return; }
  if (want && n !== want) errs.push(`${id}: ${n} hits (wanted ${want}): ${key}: ${oldS}`);
  t = t.slice(0, a) + seg.split(k).join(JSON.stringify(key) + ': ' + JSON.stringify(newS)) + t.slice(b);
}
// U(key, old, new): a ui / tooltip string before the screens array
function U(key, oldS, newS) {
  const head = t.slice(0, start), k = JSON.stringify(key) + ': ' + JSON.stringify(oldS);
  if (head.split(k).length !== 2) { errs.push(`ui: ${head.split(k).length - 1} hits: ${key}: ${oldS}`); return; }
  t = head.replace(k, () => JSON.stringify(key) + ': ' + JSON.stringify(newS)) + t.slice(start);
}

/* ---------------- ui (chrome): middle dots out, one shorter label ---------------- */
U('header', 'Lesson 4 · Process Modeling and Workflow Mapping', 'Lesson 4: Process Modeling and Workflow Mapping');
U('kicker', 'Module 1 · Lesson 4', 'Module 1, Lesson 4');
U('stopLabel', 'Stop {i} of {n} · {title}', 'Stop {i} of {n}, {title}');
U('good-fit kind', 'Unstructured to structured · Low-risk decision points · Handoffs with delay or loss.', 'Unstructured to structured, low-risk decision points, handoffs with delay or loss.');
U('empty', 'Not filled in', 'Empty');

/* ---------------- O1, O2 ---------------- */
K('O1', 'kicker', 'Module 1 · Lesson 4', 'Module 1, Lesson 4');
R('O2', "Your case: today's raw material.", 'The case you map today.');
R('O2', 'Self-study: one process, as it runs.', 'One whole process, as it runs.');
R('O2', 'Self-study: where AI enters your map.', 'Where AI enters your map.');
R('O2', 'Self-study: how you will build it.', 'How you will build it.');

/* ---------------- O3 (hand-in) ---------------- */
R('O3', 'By the end, you hand in two things', 'You hand in two things');
R('O3', 'Your entry ticket to Lesson 5.', 'Lesson 5 starts from them.');
R('O3', 'A full AS-IS process map', 'An AS-IS map of your process');
R('O3', 'Eight fields, as the process really runs.', 'Eight fields.');
R('O3', 'Measurable, with a baseline and a clear target.', 'Baseline and target.');
R('O3', 'First on the HR case from Lesson 1, then on your own case.', 'You practise on the HR case first.');

/* ---------------- S01 ---------------- */
R('S01', 'Choose the cause your Lesson 1 case is most exposed to.', 'Which failure cause threatens your case most?');
R('S01', 'Lesson 1 named four causes of AI project failure.', '');
R('S01', 'Any pick is fine. It is about your own case.', 'Any pick is fine.');
R('S01', 'Nobody can say exactly what hurts', 'Nobody can say what hurts');
R('S01', 'Nobody has drawn how the work flows', 'Nobody drew how work flows');
R('S01', 'Nobody named who uses the result', 'Nobody named the user');
R('S01', 'Nobody can tell if a change worked', 'Nobody can tell if it worked');
R('S01', "Your Lesson 1 problem statement worked on this one. Today's map shows where that problem sits.", "Lesson 1 worked on this. Today's map shows where the problem sits.");
R('S01', 'Today answers this one directly: you map your case as it really runs, step by step.', 'Today fixes this. You map your case as it really runs.');
R('S01', 'Your Lesson 1 homework named the role. Today that role gets its own steps on your map.', 'Homework 1 named the role. Today it gets steps on your map.');
R('S01', 'Today answers this one directly: you set one success metric, with a baseline and a target.', 'Today fixes this. You set one metric with a baseline and target.');

/* ---------------- S02 (hand-in) ---------------- */
R('S02', 'No case yet, or starting over? Do Homework 1.', 'No case yet?');
R('S02', 'Leave out names and identifying details.', 'No names or identifying details.');
R('S02', 'Saved. Your case comes back in Chapter {ch5}, where you map it in eight fields.', 'Saved. You map this case in Chapter {ch5}.');
R('S02', 'Add a few words to both fields. A rough version is enough; you can edit it later.', 'Fill in both fields. Rough is fine.');

/* ---------------- W1, V1, S03 ---------------- */
R('W1', 'Faster technology on a process nobody mapped does not just fail to solve the problem. It locks it in, faster and at a larger scale.', 'Faster technology on an unmapped process locks the problem in, at a larger scale.');
R('W1', "Hammer, Harvard Business Review, 1990: “Don't Automate, Obliterate”", 'Hammer, Harvard Business Review, 1990');
K('V1', 'instruction', 'Watch the video. Answer the questions when it stops.', 'Watch the video. It stops for two questions.');
R('V1', 'what separates a change that works from one you fix later?', 'why does one change work and another need fixing?');
R('V1', 'The US company wants to close a five-times gap. What should it look at first?', 'To close the five-times gap, what should the company check first?');
R('V1', 'A faster system for its current payment checks', "A faster system for today's payment checks");
R('V1', "Where the 500 people's working time goes today", "Where 500 people's time goes today");
R('V1', 'The official payment procedure, as written', 'The written payment procedure');
R('V1', 'Faster checks keep every existing step in place. If the work sits in the wrong place, it only moves faster.', 'Faster checks keep every step. Misplaced work only moves faster.');
R('V1', 'That is the question mapping answers: where the work really goes.', 'Mapping answers exactly this, where the work really goes.');
R('V1', 'A written procedure shows how work should flow. The gap lives in how it really flows on a normal day.', 'A procedure shows how work should flow, not how it does.');
R('V1', 'Quality dropped on complex requests. What was the root problem?', 'Quality dropped on complex requests. What caused it?');
R('V1', 'Complex cases needed a faster AI, not a different path', 'Complex cases needed a faster AI');
R('V1', 'Speeding everything up without telling decision types apart sent complex cases where judgment was missing.', 'One fast path sent complex cases where no one used judgment.');
R('V1', 'Speed was already there, per reports. Look at which kinds of request lost quality.', 'Speed was already there. Look at which requests lost quality.');
R('V1', 'Per reports, simple requests went about as well as with people. Look at where quality dropped.', 'Simple requests went fine, per reports. Look where quality dropped.');
R('S03', 'Drag each fact from the film to the cause it shows.', 'Drag each fact to the cause it shows.');
R('S03', 'How the work really flowed', 'How the work flowed');
R('S03', 'The number that checked the change', 'A number that checked it');
R('S03', "Right: mapping showed where the car company's work really went.", 'Mapping showed where the work really went.');
R('S03', "Right: a number that showed what the fintech's change did.", 'A number showed what the change did.');
R('S03', 'Look again: this is a measured number, before and after.', 'This is a number, measured before and after.', 3);
R('S03', 'Right: the path never told routine requests from judgment calls.', 'The path never separated routine requests from judgment calls.');
R('S03', 'Right: the number that showed the rewritten process worked, per reports.', 'This number showed the rewritten process worked, per reports.');
R('S03', 'Right: the rewritten flow, with no separate invoice step.', 'This is the rewritten flow, without an invoice step.');
R('S03', 'Right: a quality measure showed where the change hurt service.', 'A quality measure showed where the change hurt service.');

/* ---------------- W2, K2, S04, S05a, S05b ---------------- */
R('W2', 'Pick up the tools of a mapper', 'Four tools for mapping');
R('W2', 'Mapping shows how work really flows: who does each step, what goes in and out.', 'Mapping shows how work really flows.');
R('W2', 'Read it, know when to use it', 'When to use it');
R('W2', 'Your main working tool', 'Your main tool');
R('K2', 'Per ISO 9001: inputs in, an intended output out.', 'As ISO 9001 defines a process.');
R('K2', 'A message, a form, a date.', 'A message, form or date.');
R('K2', 'Three to seven, to the result.', 'Three to seven are enough.');
R('K2', 'See it in the HR case from Lesson 1', 'Show the HR case');
R('S04', 'Drag each HR card to its part of the process.', 'Drag each HR card to its part.');
R('S04', 'Drag a card, or click it and then click a column.', 'Drag a card, or click it, then a column.');
R('S04', 'What comes out, and to whom', 'What comes out, to whom');
R('S04', 'Right: an email is one way the work starts.', 'An email is one way the work starts.');
R('S04', 'This is how the work reaches HR. Ask whether anything happens before it.', 'This is how work reaches HR. Does anything come before it?');
R('S04', 'If this is the end, nothing happens to the question. Where does the work begin?', 'If this ended it, the question would get no answer.');
R('S04', 'Right: checking the topic is a step on the path to the answer.', 'Checking the topic is a step toward the answer.');
R('S04', 'Checking needs a question to check. Something must arrive before this can happen.', 'Checking needs a question. Something must arrive first.');
R('S04', 'Nobody receives a topic check. The employee is still waiting at this point.', 'Nobody receives a topic check. The employee is still waiting.');
R('S04', 'Right: asking in person is another trigger; requests arrive three ways.', 'Asking in person is another trigger. Requests arrive three ways.');
R('S04', 'Requests arrive three ways. Each way is a different start, not a middle step.', 'Requests arrive three ways. Each one is a start.');
R('S04', 'The employee has nothing yet at this point. The work has not begun.', 'The employee has nothing yet. The work has not begun.');
R('S04', 'Right: answering or escalating is still a step, because the employee is still waiting.', 'Still a step, because the employee is still waiting.');
R('S04', 'The question already arrived and was checked before this happens.', 'The question already arrived and was checked.');
R('S04', 'Escalation passes work on, it does not end it. Someone still has to reply.', 'Escalation passes work on. Someone still has to reply.');
R('S04', "Right: sending is still HR's step; the output is what the employee receives.", "Sending is HR's step. The output is what the employee receives.");
R('S04', 'The question was answered before this, so the work has long started.', 'The work started long before this.');
R('S04', 'Sending is something HR does. The output is what the employee ends up with.', "Sending is HR's action. The output is what the employee gets.");
R('S04', 'Right: this is what comes out, and to whom.', 'This is what comes out, and to whom.');
R('S04', 'If this is a middle step, the map never says what comes out, or to whom.', 'As a middle step, the map would have no output.');
R('S05a', 'Key idea · BPMN', 'BPMN');
R('S05a', 'Recognise three parts. You never have to draw one.', 'Recognise three parts. You never draw one.');
R('S05b', 'Drag each label to its part of the diagram.', 'Drag each label to its part.');
R('S05b', 'Drag a label, or click it and then click its place.', 'Drag a label, or click it, then its place.');
R('S05b', "Right: each row is one role, and escalations sit in the HR manager's lane.", 'Right. Each row is one role, here the HR manager.');
R('S05b', 'Right: the diamond is a decision where the path splits, within policy or beyond it.', 'Right. The diamond is a decision where the path splits.');
R('S05b', 'Right: the circle marks where the process starts.', 'Right. The circle marks where the process starts.');

/* ---------------- S06, S07, S08, S08B ---------------- */
R('S06', 'Ask how fast you need it and who will use it.', 'How fast do you need it, and who reads it?', 2);
R('S06', 'You know your own process well and need a fast first diagnosis.', 'You know the process and need a fast first diagnosis.');
R('S06', 'The map must serve several systems and a professional process team.', 'The map must serve several systems and a process team.');
R('S06', 'A fixed set of fields, in a table', 'Fixed fields in a table', 2);
R('S06', 'Lanes and symbols, drawn to a standard', 'Standard lanes and symbols', 2);
R('S06', 'Fast to fill alone and enough for a first diagnosis, so you use it for your own case.', 'Fast to fill alone, and enough for a first diagnosis.');
R('S06', 'You would spend your time on drawing rules, while the decision you need waits.', 'Drawing rules would take your time while the decision waits.');
R('S06', 'Your fields make sense to you. Other teams and tools need a shared standard form to read them.', 'Your fields make sense to you. Other teams need a standard.');
R('S06', 'A shared standard lets other tools, systems and process teams read the same map.', 'A shared standard lets other tools and teams read the map.');
R('S07', 'Knowledge/data sources, owners, sensitivity', 'Sources, owners, sensitivity');
R('S07', 'Success metric: baseline and target', 'Success metric');
R('S07', 'Name one process. Where it starts and ends is a decision, not a given.', 'Name one process. You decide where it starts and ends.');
R('S07', 'What starts the process: a message, a form, a date.', 'What starts the process, like a message or a form.');
R('S07', 'The path from trigger to result, and who exactly does each step.', 'The path from trigger to result, and who does each step.');
R('S07', 'Each point where responsibility passes between roles: from whom, to whom, what passes.', 'Where responsibility passes. From whom, to whom, and what passes.');
R('S07', 'Policies and data the process uses, who keeps each current, and a tag: public, internal, confidential or restricted.', 'Policies and data the process uses, each with an owner and a sensitivity tag.');
R('S07', "What is missing or unclear. Writing 'unclear' here is a result, not a weakness.", "What is missing or unclear. 'Unclear' is a valid answer.");
R('S08', 'Find which AS-IS rule this map line breaks.', 'Which AS-IS rule does this line break?');
R('S08', 'Compare the line with what really happens on a normal day.', 'Compare the line with a normal day.');
R('S08', 'Nothing here was repaired. Compare each step with what happens on a normal day.', 'Nothing was repaired. Which step does not happen today?');
R('S08', 'The map now shows an AI tool nobody uses today, so the real current state is lost.', 'The map shows an AI tool nobody uses today.');
R('S08', 'No written procedure is quoted here. The line describes a step that does not exist in practice.', 'No procedure is quoted. The line adds a step that does not exist.');
R('S08', 'Nothing is being improved in this line. Compare it with how employees really send questions.', 'Nothing is improved here. How do employees really send questions?');
R('S08', 'No AI appears in this line. Look at the source the mapper relied on.', 'No AI here. Look at the source the mapper used.');
R('S08', 'WhatsApp and in-person questions vanish from the map, and so does most of the disorder you came to find.', 'WhatsApp and in-person questions vanish, with the disorder you came to find.');
R('S08', 'The mapper added a channel that does not exist today, which is fixing the process while mapping it.', 'The mapper added a channel that does not exist today.');
R('S08', 'No written procedure is cited. The mapper made this change during the mapping itself.', 'No procedure is cited. The mapper made this change while mapping.');
R('S08B', 'It goes into workbook Fields 2 and 3 in Chapter {ch5}.', '');
R('S08B', 'Add a few words to all three parts. A rough version is enough; you can edit it later.', 'Fill in all three parts. Rough is fine.');

/* ---------------- W3, V2 ---------------- */
R('W3', 'Map the HR case from Lesson 1, field by field', 'Map the HR case, field by field');
R('W3', 'Repeat questions to HR at a services company of about 400 employees.', 'Repeat questions to HR, at a company of about 400.');
R('W3', 'Knowledge, sensitivity, control', 'Knowledge and controls');
R('W3', 'Gaps and a success metric', 'Gaps and a metric');
K('V2', 'instruction', 'Watch the video. Answer the questions when it stops.', 'Watch the video. It stops for three questions.');
R('V2', 'How do you turn about 90 messy requests a month into a map you can check later?', 'How do 90 messy requests a month become a map you can check?');
R('V2', 'Which line belongs in Field 2, as the process runs today?', 'Which line belongs in Field 2 today?');
R('V2', 'An employee emails HR, the most formal channel', 'An employee emails HR, the formal channel');
R('V2', 'Email is only one of three real channels. WhatsApp and in-person questions vanish from the map.', 'Email is one of three channels. The other two vanish.');
R('V2', 'It names the concrete event that starts the work, across all three channels that really exist.', 'It names the real starting event, across all three channels.');
R('V2', 'That describes a future tool. An AS-IS map records today, so AI has no place on it yet.', 'A chatbot is a future tool. An AS-IS map records today.');
R('V2', 'One role does this from start to finish. Nothing changes hands, so it stays a step in Field 3.', 'One role does this alone, so it is a Field 3 step.');
R('V2', 'That is ownership of a knowledge source. It goes in Field 5, next to each policy.', 'That is ownership of a source, which goes in Field 5.');
R('V2', 'That is a fix for later. Added now, the map shows a check that does not exist today.', 'That is a later fix. Today no such check exists.');
R('V2', 'It records what really happens, and that missing check is what the map should reveal.', 'It records what happens. The map should reveal the missing check.');
R('V2', 'An empty field reads as not checked yet. The finding itself is the content this field needs.', 'Empty reads as not checked. The finding belongs in the field.');

/* ---------------- S09 (core, support, stretch) ---------------- */
R('S09', 'Drag a card, or click it and then click a column.', 'Drag a card, or click it, then a column.');
R('S09', 'A document the work depends on', 'A document the work uses');
R('S09', 'The role that keeps it current', 'Who keeps it current');
R('S09', 'Belongs elsewhere on the map', 'Belongs elsewhere');
R('S09', 'Placed: the map now shows which document an HR answer depends on.', 'The map now shows which document an HR answer depends on.');
R('S09', 'A policy is not a person or a label. What role does it play in the process?', 'A policy is a document. What does the work use it for?', 2);
R('S09', 'Placed: overtime is one of the repeat topics in the HR case.', 'Another document HR staff answer from.');
R('S09', 'Placed: when a policy goes stale, the map names who must update it.', 'When a policy goes stale, the map names who updates it.');
R('S09', 'This is a role, not a document or a label. What does this role do for the policies?', 'This is a role. What does it do for the policies?');
R('S09', 'Placed: the policies stay inside the company, so they are tagged INTERNAL.', 'The policies stay inside the company, so the tag is INTERNAL.');
R('S09', 'This is not a document and not a person. What does it tell you about the data?', 'Not a document or a person. What does it say about data?');
R('S09', 'Kept out: it describes how answers get checked, which is Field 6.', 'It describes how answers get checked, which is Field 6.');
R('S09', 'This card says nothing about where knowledge comes from, who keeps it, or how sensitive it is.', 'It names no source, owner or sensitivity level.');
R('S09', 'Kept out: no chatbot runs today, and adding AI while mapping turns the map into a plan.', 'No chatbot runs today. Adding AI turns the map into a plan.');
R('S09', 'Ask whether this happens on a normal day in the HR case, as it runs now.', 'Does this happen on a normal day in HR today?');
R('S09', 'Placed: a knowledge source, the document an HR answer depends on.', 'A knowledge source, the document an HR answer depends on.');
R('S09', 'Field 5 has three parts: source, owner, tag. A policy is a document. Which part is that?', 'A policy is a document. Is that a source, owner or tag?');
R('S09', 'Placed: another source the HR staff read before they answer.', 'Another source HR staff read before they answer.');
R('S09', 'Staff read this document before they answer. Of source, owner and tag, which one is a document?', 'Staff read this before they answer. Which part is a document?');
R('S09', 'Placed: the owner keeps the policies current and updates one when it goes stale.', 'The owner keeps the policies current and updates a stale one.');
R('S09', 'An owner is who keeps a source current and correct. This is a role. Which part fits a role?', 'An owner keeps a source current. Which part fits a role?');
R('S09', 'Placed: the tag decides what may go into an AI tool, and policies stay inside.', 'The tag decides what may go into an AI tool.');
R('S09', 'This word is one of the four levels named under Sensitivity. Which part holds a level?', 'This is one of four sensitivity levels. Which part holds a level?');
R('S09', 'Kept out: that starts the process, so it is the trigger in Field 2.', 'That starts the process, so it is the Field 2 trigger.');
R('S09', 'Field 5 is about knowledge: sources, owners, tags. This card is about how the process starts.', 'Field 5 is about knowledge. This card is about how work starts.');
R('S09', 'Kept out: that is a step with its role owner, in Field 3.', 'That is a step with its role owner, so Field 3.');
R('S09', 'Field 5 is about knowledge: sources, owners, tags. This card is a step someone does.', 'Field 5 is about knowledge. This card is a step someone does.');
R('S09', 'Ask what each card tells the map, and whether it happens today. Keys 1 to 4, then Enter.', 'What does each card tell the map, and does it happen today?');
R('S09', 'Placed: in the car-company case, payment later ran straight from this record.', 'In the car company case, payment later ran from this record.');
R('S09', 'Placed: one of the three documents the clerks reconcile today.', 'One of the three documents the clerks reconcile today.');
R('S09', 'Placed: when the payment rules change, the map names who must update them.', 'When payment rules change, the map names who updates them.');
R('S09', 'Placed: supplier bank details are financial data, so they stay out of public AI tools.', 'Supplier bank details are financial data. Keep them out of public AI.');
R('S09', 'Kept out: matching is a step and a manual check, Fields 3 and 6.', 'Matching is a step and a manual check, Fields 3 and 6.');
R('S09', 'Kept out: no AI runs here today, and adding it turns the AS-IS map into a plan.', 'No AI runs today. Adding it turns the map into a plan.');
R('S09', 'Ask whether this happens on a normal day in accounts payable, as it runs now.', 'Does this happen on a normal day in accounts payable?');

/* ---------------- S10, K3, S11 ---------------- */
R('S10', 'No one has counted. The map now holds a guess that nobody can verify.', 'No one has counted. The map would hold an unverifiable guess.');
R('S10', 'The map describes today. A checker that does not exist yet turns a gap into a plan.', 'The map describes today. A future checker turns a gap into a plan.');
R('S10', "Right: 'unclear' is the honest answer for Field 7 today.", "'Unclear' is the honest answer for Field 7 today.");
R('S10', 'The map now hides its biggest unknown. Lesson 5 would treat it as known and build on it.', 'Empty hides the biggest unknown. Lesson 5 would build on it.');
R('S10', "Field 7 is where it is allowed, even desirable, to write 'unclear'.", "Field 7 is where you may write 'unclear'.");
R('S10', 'That hides the gap the map is meant to show. Field 7 records what nobody knows yet.', 'That hides the gap. Field 7 records what nobody knows yet.');
R('S10', "'Unclear' is a legitimate answer: Field 7 now shows what to investigate before Lesson 5.", "'Unclear' is valid. It shows what to investigate before Lesson 5.");
R('S10', 'That is a future tool. The map describes the current state; AI is a future step.', 'A chatbot is a future tool. The map describes today.');
R('S10', 'A guess with nothing behind it. Field 7 records what is unclear, not what you hope.', 'A guess with nothing behind it. Field 7 records what is unclear.');
R('S10', 'Ask: what could this team prove today from its own records?', 'What could this team prove today from its own records?');
R('S10', 'Accounts payable: clerks fix mismatched invoices. Nobody logs how often.', 'In accounts payable, clerks fix mismatched invoices. Nobody logs how often.');
R('S10', 'A belief nobody has counted. The map now holds a guess as if it were known.', 'Nobody has counted. The map would hold a guess as fact.');
R('S10', "Someone else's number. Your own gap stays hidden, and Lesson 5 builds on a borrowed fact.", "Someone else's number. Your own gap stays hidden.");
R('K3', 'A result of the mapping', 'It is a finding');
R('K3', 'Not a weakness of the mapper. Field 7 exists for exactly this.', 'Field 7 exists for it.');
R('K3', 'What to do with it', 'Record it in Field 7');
R('K3', 'Record it in Field 7: what to check before Lesson 5, and what not to build on yet.', "Check it before Lesson 5. Don't build on it yet.");
R('S11', 'Ask: three months from now, could someone check it?', 'In three months, could someone check it?');
R('S11', 'No number to check. In three months, nobody can say whether it worked.', 'No number. In three months, nobody can say whether it worked.');
R('S11', 'A feeling shifts with mood and memory. You cannot compare it before and after.', 'A feeling shifts with mood. You cannot compare before and after.');
R('S11', "Twenty percent, down from what? Without today's number, nobody can show a change happened.", "Twenty percent, down from what? It needs today's number.");
R('S11', 'Checkable: it has a start point, a target and a date for one number.', 'One number with a start point, a target and a date.');
R('S11', 'A feeling cannot be compared before and after. You need a number, not a feeling.', 'A feeling cannot be compared before and after. Use a number.');
R('S11', 'Ask: is this your own number, and could someone check it later?', 'Is this your own number, and could someone check it later?');
R('S11', 'Their number, not yours. Without your own baseline, no change can be shown.', 'Their number. Without your own baseline, no change can be shown.');
R('S11', "'Today' with no number and no date. Close, but nobody can check it.", "'Today' has no number or date, so nobody can check it.");
R('S11', 'Your own baseline, a target and a date make it checkable; estimated is fine.', 'Your own baseline, a target and a date. Estimated is fine.');

/* ---------------- S12 (core, support, stretch), S12B ---------------- */
R('S12', 'This field does not follow the question once it leaves the first staffer.', 'This field does not follow the question after the first staffer.', 4);
R('S12', 'Field 3 shows who does each step, not the moment between them or what can go wrong there.', 'Field 3 shows who does each step, not what happens between them.');
R('S12', 'Field 4 shows the question moving from HR staff to the HR manager.', 'Field 4 shows the question passing to the HR manager.', 2);
R('S12', 'Field 6 is about how answers get checked. It says nothing about the handoff.', 'Field 6 covers how answers get checked, not the handoff.');
R('S12', 'Field 7 adds the risk: no single channel for that handoff.', 'Field 7 adds the risk, no single channel for that handoff.', 2);
R('S12', 'Field 4 shows the question passing to the HR manager, and Field 7 adds its risk: no single channel.', 'Field 4 shows the handoff, Field 7 its risk, no single channel.');
R('S12', 'A handoff is the moment responsibility passes from one role to another. Flag where it passes, and its risk.', 'A handoff passes responsibility between roles. Flag it and its risk.');
R('S12', 'Field 1 names the process. A handoff is where responsibility passes between roles; the name shows no role.', 'Field 1 names the process. The name shows no role.');
R('S12', 'Field 2 is the trigger, how the process starts. The handoff comes later, between two roles.', 'Field 2 is how the process starts. The handoff comes later.');
R('S12', 'Field 3 lists the steps and their owners. The handoff field shows the moment between them.', 'Field 3 lists steps and owners, not the moment between them.');
R('S12', 'Field 4: responsibility passes from HR staff to the HR manager.', 'Responsibility passes here, from HR staff to the HR manager.');
R('S12', 'Field 5 lists sources, owners and tags. A handoff is responsibility passing between roles.', 'Field 5 lists sources, owners and tags, not passing responsibility.');
R('S12', 'Field 6 is how answers get checked. It says nothing about responsibility passing.', 'Field 6 is how answers get checked, not where responsibility passes.');
R('S12', 'Field 7 records the risk at that handoff: no single channel.', 'Field 7 records the risk at that handoff, no single channel.');
R('S12', 'Field 8 is the success metric. It does not show where responsibility passes.', 'Field 8 is the success metric. It shows no responsibility passing.');
R('S12', 'Field 4 shows responsibility passing to the HR manager, and Field 7 records the risk: no single channel.', 'Field 4 shows responsibility passing, Field 7 the risk, no single channel.');
R('S12', 'Ask: if a question got lost, which two fields would show you where?', 'If a question got lost, which two fields would show where?');
R('S12', 'A name frames the process. A lost question would not show up here.', 'A name frames the process. A lost question would not show here.');
R('S12', 'Each step here has an owner who finishes it. Flagged here, the lost question stays unexplained.', 'Each step has an owner who finishes it. Nothing gets lost here.');
R('S12', 'No control means nobody checks the answers. A lost question is a different risk.', 'No control means unchecked answers. A lost question is a different risk.');
R('S12', 'The metric tracks time spent. It would not show where a question went missing.', 'The metric tracks time spent, not where a question went missing.');
R('S12B', 'This goes into Field 8 of your workbook in Chapter {ch5}.', '');
R('S12B', 'Leave out names and identifying details.', 'No names or identifying details.');
R('S12B', 'Today, e.g. about 2 days to a summary', 'e.g. about 2 days today');

/* ---------------- W4, S13, S14 ---------------- */
R('W4', 'Before anyone adds AI, check the map at four points.', 'Check the map at four points before adding AI.');
R('W4', 'Speed a step up, or remove it', 'Speed up or remove');
R('W4', 'What AI takes, what a person keeps', 'What AI takes, what people keep');
R('S13', 'A process starts with a trigger from outside, and ends when someone receives the result.', 'It starts with an outside trigger and ends when someone gets the result.');
R('S13', 'Look for what starts it from outside, and who picks up the result.', 'What starts it from outside, and who gets the result?');
R('S13', "Looking it up is the employee's own step: nothing has reached HR yet.", 'The employee is still searching alone. Nothing has reached HR.');
R('S13', 'WhatsApp and in-person questions never reach the inbox. The process starts earlier, outside HR.', 'WhatsApp and in-person questions skip the inbox. It starts earlier.');
R('S13', 'Start where work enters from outside; end where someone picks up the result.', 'Start where work enters from outside. End where someone gets the result.', 2);
R('S13', 'Nobody receives anything when the topic is checked. Follow the question to its result.', 'Nobody receives anything here. Follow the question to its result.');
R('S13', 'Escalation passes the work on. The employee is still waiting for an answer.', 'Escalation passes the work on. The employee is still waiting.');
R('S13', 'A leave request starts a new process with its own trigger. This one ended earlier.', 'A leave request starts a new process. This one ended earlier.');
R('S13', "Clear boundaries: from the trigger outside HR to the employee's answer. Without them, the map swells.", "From the outside trigger to the employee's answer. Without boundaries, maps swell.");
R('S14', 'Choose the four things the map must record at this handoff.', 'Choose four things to record at this handoff.');
R('S14', 'A question goes beyond policy, so HR staff pass it to the HR manager, who is away this week.', 'HR staff pass a question to the HR manager, who is away.');
R('S14', 'A rule nobody follows today hides the real gap. Record the handoff as it runs now.', "A rule nobody follows hides the real gap. Record today's handoff.");
R('S14', 'A good map marks every handoff: from whom, to whom, what passes, and what if the receiver is away.', 'Every handoff needs from whom, to whom, what passes, and a fallback.');
R('S14', 'A good map marks each handoff: from whom, to whom, what passes, if unavailable.', 'Each handoff needs from whom, to whom, what passes, and a fallback.');
R('S14', 'Ask: if this dispute stalls, could the map show you why?', 'If this dispute stalls, could the map show you why?');
R('S14', 'A customer disputes a charge. The agent sends it to the disputes team, whose contact is away.', 'An agent sends a disputed charge to the disputes team, whose contact is away.');
R('S14', 'The playbook shows how it should run. If today differs, the map hides the real gap.', 'The playbook shows how it should run. Today may differ.');
R('S14', 'That tool does not run today. Map the handoff as it works now.', 'That tool does not run today. Map the handoff as it works.');

/* ---------------- S15 (core, support, stretch) ---------------- */
R('S15', 'Choose the first question to ask about this bottleneck.', 'Which question comes first for this bottleneck?');
R('S15', 'Course feedback, from your Lesson 1 booklet', '');
R('S15', 'One step: the coordinator prints and reads all feedback by hand, 3 to 4 hours per course.', 'The coordinator reads all course feedback by hand, 3 to 4 hours per course.');
R('S15', 'headcount, once mapping removed the manual matching step', 'headcount after mapping removed manual matching');
R('S15', 'The cause decides the fix; sometimes you remove the step instead of speeding it up, like the car company.', 'The cause decides the fix. Sometimes you remove the step.');
R('S15', 'You would speed up a step without knowing why it formed, which locks the problem in.', "Speeding up a step you don't understand locks the problem in.");
R('S15', 'More people on the same step keep it in place. First ask whether the step should exist.', 'More people keep the step in place. Should it exist?');
R('S15', 'A bottleneck is a step limited by the slowest resource. Before throwing AI at it, ask why it formed.', 'Before adding AI to a bottleneck, ask why it formed.');
R('S15', 'Back to the HR case', '');
R('S15', 'Every question beyond policy waits for one person: the HR manager.', 'In the HR case, every question beyond policy waits for one person, the HR manager.');
R('S15', 'You asked why it formed; sometimes the right fix is to remove the step, not speed it up.', 'You asked why it formed. Sometimes the fix is removing the step.');
R('S15', 'That throws AI at the bottleneck before asking why it formed. The slow step stays, now faster.', 'That adds AI before asking why. The slow step stays.');
R('S15', 'A faster manager keeps the same step. First ask why the bottleneck formed at all.', 'A faster manager keeps the same step. Why did it form?');
R('S15', 'Ask: what would happen if this step disappeared?', 'What would happen if this step disappeared?');
R('S15', 'The fintech, disputed charges', '');
R('S15', 'Every disputed charge waits for one specialist, who reads the whole chat history by hand.', 'At the fintech, each disputed charge waits for one specialist to read the whole chat.');
R('S15', 'More people on the same step keep it in place. First ask whether every dispute needs it.', 'More people keep the step in place. Does every dispute need it?');
R('S15', 'Faster technology on an unexamined step entrenches it, faster and at larger scale.', 'Faster technology on an unexamined step locks it in.');
R('S15', 'The cause decides the fix: if most disputes need only part of the chat, the full read could go.', 'The cause decides the fix. Maybe most disputes need only part.');

/* ---------------- S16 (core, support, stretch) ---------------- */
R('S16', 'Text to data · Low-risk decision · Lossy handoff', 'Text to data, low-risk decisions, lossy handoffs');
R('S16', 'Money or rights · Disorder · Unclear', 'Money or rights, disorder, unclear');
R('S16', 'Good fit, unstructured to structured: free text in, a structured topic out.', 'Unstructured to structured. Free text in, a topic out.');
R('S16', 'Look at what goes in and what comes out. Is a judgment call at stake here?', 'What goes in and comes out? Is a judgment call at stake?');
R('S16', 'Poor fit: money is at stake and it is hard to undo, as the fintech found on complex cases.', 'Money is at stake and hard to undo, as the fintech found.');
R('S16', 'If this decision is wrong, who carries the loss, and can it be undone?', 'If this is wrong, who carries the loss? Can it be undone?');
R('S16', 'Good fit, low-risk decision point: it can be accelerated, with a person watching where risk rises.', 'A low-risk decision. Speed it up, with a person watching.');
R('S16', 'Ask how much damage one wrong label would cause, and how fast it would be caught.', 'How much damage would one wrong label cause?');
R('S16', 'Poor fit: this is a process problem, and AI on top keeps the disorder running faster.', 'A process problem. AI on top keeps the disorder running, faster.');
R('S16', 'Poor fit: you cannot build on unknown foundations; this needs diagnosis, not more technology.', 'You cannot build on unknowns. This needs diagnosis first.');
R('S16', 'Check what the map actually knows before anything is built on it.', 'Check what the map knows before building on it.');
R('S16', 'Good fit, handoff with delay or loss: AI documents it, so the HR manager gets the history.', 'A lossy handoff. AI documents it, so the manager gets the history.');
R('S16', 'Think about what the HR manager receives today when a question is passed on.', 'What does the HR manager receive today with a passed question?');
R('S16', 'Good fit, unstructured to structured: a free-text question in, a topic out.', 'Unstructured to structured. A free-text question in, a topic out.');
R('S16', 'Ask what goes in and what comes out. A question is free text. What comes out?', 'A question is free text. What comes out?');
R('S16', 'Poor fit: money and rights are at stake and hard to undo, so a person decides.', 'Money and rights are at stake, so a person decides.');
R('S16', 'Money, rights and calls that cannot be undone need a person. Who carries a wrong answer here?', 'Who carries a wrong answer here, and can it be undone?');
R('S16', 'Good fit, a low-risk decision: it can be accelerated, with a person watching.', 'A low-risk decision. Speed it up, with a person watching.');
R('S16', 'Decisions differ by risk. How much harm does one wrong label do, and how fast is it caught?', 'How much harm does one wrong label do?');
R('S16', 'Poor fit, a process problem: the trouble is disorder, not missing information.', 'A process problem. The trouble is disorder, not missing information.');
R('S16', 'Ask: is the problem disorder, or missing information? Which is it here?', 'Is the problem disorder, or missing information?');
R('S16', 'Poor fit: you cannot build on unknown foundations, so diagnose first.', 'You cannot build on unknown foundations. Diagnose first.');
R('S16', "Building on 'unclear' means building on unknowns. What does the map know here?", "Building on 'unclear' means building on unknowns. What does the map know?");
R('S16', 'Good fit, a handoff with delay or loss: AI documents what passes, so the manager gets the history.', 'A lossy handoff. AI documents what passes, so the manager gets it.');
R('S16', 'Some handoffs lose information on the way. What does the manager receive today?', 'Some handoffs lose information. What does the manager receive today?');
R('S16', 'Good fit, unstructured to structured: a free-text chat in, an order number out.', 'Unstructured to structured. A free-text chat in, an order number out.');
R('S16', 'Look at what goes in and what comes out. Is a decision made here at all?', 'What goes in and comes out? Is a decision made at all?');
R('S16', 'Poor fit: money is at stake and hard to undo, and fintech quality dropped on disputes.', 'Money is at stake, and fintech quality dropped on disputes.');
R('S16', 'If this call is wrong, who carries the loss, and can it be undone?', 'If this is wrong, who carries the loss? Can it be undone?');
R('S16', 'Good fit, a low-risk decision: per reports, AI did as well as people on simple requests.', 'A low-risk decision. Per reports, AI matched people on simple requests.');
R('S16', 'Ask how much one wrong route would cost, and how fast it would be caught.', 'How much would one wrong route cost?');
R('S16', 'Poor fit, a process problem: three unsorted inboxes stay disordered, only faster.', 'A process problem. Three unsorted inboxes stay disordered, only faster.');
R('S16', 'Poor fit: drafting looks safe, but the foundations are unknown, so diagnose first.', 'Drafting looks safe, but the foundations are unknown. Diagnose first.');
R('S16', 'Drafting can fit. Check what the map actually knows before building on it.', 'Drafting can fit. Check what the map knows before building on it.');
R('S16', 'Good fit, a handoff with delay or loss: AI documents the case, so the next person starts informed.', 'A lossy handoff. AI documents the case for the next person.');

/* ---------------- S17 (core, support, stretch), S17B ---------------- */
R('S17', 'maps how it should work, not a normal day', 'maps how it should work');
R('S17', 'drawn with no question to answer', 'no question to answer');
R('S17', 'hard fields skipped to finish fast', 'hard fields skipped');
R('S17', 'Fields 6 and 7 are blank: the map was due within the hour.', 'Fields 6 and 7 are blank. The map was due within the hour.');
R('S17', 'Controls and gaps hold the findings, so skipping them leaves Lesson 5 nothing to protect against.', 'Controls and gaps hold the findings. Skipping them leaves Lesson 5 blind.', 2);
R('S17', 'The map has a goal and matches today. Look at which fields were never filled.', 'The map has a goal and matches today. Which fields are empty?');
R('S17', 'The map describes a wish, so every gap on a normal day stays hidden.', 'The map describes a wish, so real gaps stay hidden.');
R('S17', 'Nothing was skipped or automated. Compare the map with a normal day in HR.', 'Nothing was skipped or automated. Compare the map with a normal day.');
R('S17', 'The most critical mistake: three disorganized channels get faster, and the disorder grows with them.', 'The most critical mistake. Three messy channels get faster, and messier.');
R('S17', 'The map may be accurate. Look at what is about to be done with the process.', 'The map may be accurate. What happens to the process next?');
R('S17', 'The map was right once, but Lesson 5 would now build on a process that no longer exists.', 'Lesson 5 would build on a process that no longer exists.');
R('S17', 'Without a question, nobody knows which process or boundaries matter, so the map decides nothing.', 'With no question to answer, the map decides nothing.');
R('S17', 'The map may be accurate and complete. Ask what it was drawn to decide.', 'The map may be accurate. What was it drawn to decide?', 2);
R('S17', 'AS-IS = as it happens now, in practice, on a normal day.', 'AS-IS means as it happens now, on a normal day.');
R('S17', 'Fields 6 to 8 are empty: the mapper ran out of time.', 'Fields 6 to 8 are empty. The mapper ran out of time.');
R('S17', 'The map shows the aspirational state, not the actual one; map what happens, not what should.', 'The map shows what should happen, not what does.');
R('S17', 'Nothing was skipped, changed or automated. Compare the map with a normal day in HR.', 'Nothing was skipped or changed. Compare the map with a normal day.');
R('S17', 'Rushed mapping skips the hard fields, which hold the findings Lesson 5 needs.', 'Rushed mapping skips the hard fields, which hold the findings.');
R('S17', 'The map may match today. Look at which fields stayed empty, and why.', 'The map may match today. Which fields stayed empty, and why?');
R('S17', 'The map was not updated after a change: it was right once, and now it is not.', 'The map was right once. Nobody updated it after the change.');
R('S17', 'Automating a broken process is the most critical mistake: the disorder just runs faster.', 'The most critical mistake. The disorder just runs faster.');
R('S17', 'The map may be fine. Look at what is about to be done to the process.', 'The map may be fine. What happens to the process next?');
R('S17', 'No clear goal: without a question to answer, the map decides nothing.', 'With no question to answer, the map decides nothing.');
R('S17', 'The map may be accurate and complete. Ask what it was drawn for.', 'The map may be accurate. What was it drawn for?');
R('S17', 'Ask: what did the mapper do, or fail to do?', 'What did the mapper do, or fail to do?');
R('S17', 'The map describes the procedure, not a normal day, so the real gaps stay hidden.', 'The map describes the procedure, so real gaps stay hidden.');
R('S17', 'Nothing changed after the map was drawn. Compare it with what clerks actually do.', 'Nothing changed since. Compare the map with what clerks do.');
R('S17', 'The map was right once, but Lesson 5 would build on a step that no longer exists.', 'Lesson 5 would build on a step that no longer exists.');
R('S17', 'The most critical mistake: the car company removed this step, and speeding it up keeps the mess.', 'The most critical mistake. The car company removed this step instead.');
R('S17', 'The map may be accurate. Look at what is about to be done with the step.', 'The map may be accurate. What happens to the step next?');
R('S17', 'Without a question, nobody knows which steps or boundaries matter, so the map decides nothing.', 'With no question to answer, the map decides nothing.');
R('S17B', 'Type one step for AI and one for a person.', 'Type one step for AI, one for a person.');
R('S17B', 'Saved. It comes back in Chapter {ch5}, and your homework builds on it.', 'Saved. It comes back in Chapter {ch5}.');
R('S17B', 'Add a few words to both fields. A rough version is enough; you can edit it later.', 'Fill in both fields. Rough is fine.');

/* ---------------- S18A, S18, S18B (hand-in) ---------------- */
R('S18A', 'Lesson 1 case: sales call summaries', 'Sales call summaries');
K('S18A', 'sub', 'What starts it', '');
K('S18A', 'sub', 'Who does what', '');
K('S18A', 'sub', 'What is missing or unclear', '');
R('S18A', 'Placed: an honest unknown that tells you what to ask before Lesson 5.', 'An honest unknown. It tells you what to ask before Lesson 5.');
R('S18A', 'Placed: a concrete event starts the work, here 8 to 12 times a day per rep.', 'A concrete event starts the work, 8 to 12 times a day.');
R('S18A', 'Ask what has to happen before any summary can be written.', 'What must happen before any summary is written?');
R('S18A', 'Kept out: an AI step is a future idea, so it stays off your AS-IS map.', 'An AI step is a future idea, so it stays off the map.');
R('S18A', 'Does this happen on a normal day today, or is it an idea for later?', 'Does this happen today, or is it an idea for later?');
R('S18A', 'Placed: the step and its owner as it really runs, often late, not as the rule says.', 'The step and its owner as it really runs, often late.');
R('S18', 'The workbook has a live AI coach that reads what you type.', "The workbook's AI coach reads what you type.");
R('S18', 'Before you write anything, remove names and identifying details.', 'Remove names and identifying details first.');
R('S18', 'Names and internal policy now sit in an AI tool. Personal, employee or financial details are CONFIDENTIAL: keep them out.', 'Names and internal policy would sit in an AI tool. Personal, employee or financial details are CONFIDENTIAL.');
R('S18', 'Nothing identifying leaves your hands; when unsure, the Lesson 3 rule applies: leave it out.', 'Nothing identifying leaves your hands. When unsure, leave it out.');
R('S18', 'Names can sit in any field, not only Field 5. Steps and handoffs still identify people.', 'Names can sit in any field. Steps and handoffs identify people too.');
R('S18B', 'Your case title from the start of the lesson:', '');
R('S18B', 'Case title, generalized', 'Case title');
R('S18B', 'Tick the box once your notes have no names or identifying details.', 'Tick the box once your notes have no names.');
R('S18B', 'Add your case title before you save.', 'Add your case title first.');
R('S18B', 'Saved. Next: open the workbook. You come back here for a self-check.', 'Saved. Next, open the workbook.');

/* ---------------- S19A, S19B, S19C (hand-in) ---------------- */
R('S19A', 'What you will do now', 'Map your case in the workbook');
R('S19A', 'The workbook holds your own process map. Lesson 5 starts from it.', 'Lesson 5 starts from this map.');
R('S19A', 'Fill eight fields as the process runs today', 'Fill eight fields, as things run today');
R('S19A', 'Press Review my work, fix, then export your PDF', 'Press Review my work, fix, export the PDF');
R('S19B', 'Copy into the workbook', 'Copy your notes in');
R('S19B', 'Coach on: roles, no names.', 'Use roles, not names.');
R('S19B', 'The workbook is open in a new tab. This lesson keeps your place.', 'Opened in a new tab. Your place here is saved.');
R('S19C', 'Welcome back.', '');

/* ---------------- S20, S20B (hand-in) ---------------- */
R('S20', 'Every step has an owner. Lesson 5 can place AI or a person next to each one.', 'Every step has an owner for Lesson 5 to work with.');
R('S20', "A step without a role cannot be improved or monitored. Name the role, or write 'unclear' in Field 7.", "No role, no way to improve the step. Name it, or write 'unclear'.");
R('S20', 'Your handoffs cover the unavailable case. Delays now show up on the map, not in daily work.', 'Delays now show on the map before they hit daily work.');
R('S20', 'A handoff with no plan stalls. Add what happens, or record it as a gap.', 'A handoff with no fallback stalls. Add one, or record a gap.');
R('S20', 'You can check your change later: baseline now, target to check against.', 'You can check the change later against your baseline and target.');
R('S20', 'Without a number, nobody can tell whether anything improved. Add a baseline, even estimated, and a target.', 'No number, no proof. Add a baseline, even estimated, and a target.');
R('S20B', 'Choose the mistake your map is most at risk of.', 'Which mistake threatens your map most?');
R('S20B', 'Before Lesson 5: every field filled, metric measurable, no invented answers.', 'Before Lesson 5, fill every field, make the metric measurable, invent nothing.');
R('S20B', 'In your workbook: reread Field 3 against a normal day, not the written procedure.', 'Reread Field 3 against a normal day, not the procedure.');
R('S20B', 'In your workbook: write one sentence on what this map must help decide.', 'Write one sentence on what this map must help decide.');
R('S20B', 'In your workbook: reopen Fields 6 and 7, the ones skipped first.', 'Reopen Fields 6 and 7, the ones skipped first.');
R('S20B', "In your workbook: note the map's date and what would trigger an update.", "Note the map's date and what would trigger an update.");
R('S20B', 'In your workbook: list which steps need fixing, not speeding up, before Lesson 5.', 'List the steps that need fixing before Lesson 5, not speeding up.');

/* ---------------- S21 (scored check: stems lightly, options untouched, feedback short) ---------------- */
R('S21', "Lesson 1 case: customer service. Field 4 says 'Rep to department.' What is missing?", "Customer service case. Field 4 says 'Rep to department.' What is missing?");
R('S21', "Lesson 1 case: student inquiries. Field 4 says 'Coordinator to dean's office.' What is missing?", "Student inquiries case. Field 4 says 'Coordinator to dean's office.' What is missing?");
R('S21', 'Lesson 1 case: student inquiries. Which step suits AI first?', 'Student inquiries case. Which step suits AI first?');
R('S21', 'Lesson 1 case: customer service. Which step suits AI first?', 'Customer service case. Which step suits AI first?');
R('S21', 'Lesson 1 case: weekly report, 4 to 6 hours. Nothing is logged. Baseline?', 'The weekly report takes 4 to 6 hours. Nothing is logged. Baseline?');
R('S21', 'Lesson 1 case: course feedback. Reading takes 3 to 4 hours per course. Nobody times it. Baseline?', 'Reading course feedback takes 3 to 4 hours per course. Nobody times it. Baseline?');
R('S21', 'Lesson 1 case: customer service. Share of simple requests unknown. Where does this go?', 'Customer service case. Nobody knows the share of simple requests. Where does this go?');
R('S21', 'Lesson 1 case: weekly report. Nobody knows who reads it. Where does this go?', 'Nobody knows who reads the weekly report. Where does this go?');
R('S21', 'Lesson 1 case: student inquiries. Staff answer from admission terms the registrar keeps current. Field 5 owner?', 'Staff answer student inquiries from admission terms the registrar keeps current. Field 5 owner?');
R('S21', 'Lesson 1 case: weekly report. KPIs come from a sheet finance keeps current. Field 5 owner?', "The weekly report's KPIs come from a sheet finance keeps current. Field 5 owner?");
R('S21', 'That adds a rule nobody follows today. The map becomes a redesign before the gaps are known.', 'That adds a rule nobody follows today. Map first, redesign later.');
R('S21', "The map now holds a future tool, and today's handoff stays as vague as before.", "A future tool. Today's handoff stays as vague as before.");
R('S21', 'From and to are there. Without what passes and the unavailable case, a request stalls between teams.', 'Without what passes and a fallback, a request stalls between teams.');
R('S21', 'The receiver may not know what happened before. The map hides the most dangerous moment in the process.', 'The receiver may not know the history. That is the riskiest moment.');
R('S21', 'That adds a rule nobody follows today. Record the handoff as it really happens first.', 'That adds a rule nobody follows today. Record the real handoff first.');
R('S21', 'From and to are there. Without what passes and the unavailable case, an inquiry stalls between offices.', 'Without what passes and a fallback, an inquiry stalls between offices.');
R('S21', 'That tool does not exist today. The handoff itself stays as vague as before.', 'That tool does not exist today. The handoff stays vague.');
R('S21', 'Never assume the receiver knows what happened before. This is the most dangerous moment in the process.', 'Never assume the receiver knows the history. This is the riskiest moment.');
R('S21', "Exceptional requests need human judgment. An error here can touch a student's rights.", "Exceptions need human judgment. An error can touch a student's rights.");
R('S21', 'Unstructured text in, a structured label out, at low risk. Exceptions still go to a person.', 'Text in, a label out, at low risk. Exceptions go to a person.');
R('S21', 'Sensitive cases need judgment, and today nobody knows how they are handled. That is unclear, not ready.', 'Sensitive cases need judgment, and how they run today is unclear.');
R('S21', 'There is no breakdown of categories yet. A solution here stands on unknown foundations.', 'No category breakdown exists yet. This would stand on unknown foundations.');
R('S21', 'Money is at stake and a wrong call is costly. That decision stays with a person.', 'Money is at stake. That decision stays with a person.');
R('S21', 'Unstructured text in, a structured label out, at low risk. A person still handles the hard cases.', 'Text in, a label out, at low risk. People handle hard cases.');
R('S21', 'Escalations need empathy and judgment. That is where quality dropped in the fintech case.', 'Escalations need empathy and judgment. Quality dropped there in the fintech case.');
R('S21', 'A disorganized process gets fixed first. AI on top would only speed up the disorder.', 'Fix a disorganized process first. AI would only speed up the disorder.');
R('S21', 'You know the range, so estimate and mark it. An estimated metric beats no metric.', 'You know the range, so estimate. An estimate beats no metric.');
R('S21', 'Field 8 stays empty. In three months, nobody can show whether anything changed.', 'Field 8 stays empty. Later, nobody can show what changed.', 2);
R('S21', 'Field 8 now shows where the team hopes to land and nothing about where it stands now.', 'That shows where the team hopes to land, not where it stands.');
R('S21', 'You know the range, so estimate and mark it. An estimated baseline beats none.', 'You know the range, so estimate. An estimate beats no baseline.');
R('S21', 'That shows where you hope to land, and nothing about where you stand now.', 'That shows where you hope to land, not where you stand.');
R('S21', 'That records a control nobody reported. Lesson 5 would rely on a check that may not exist.', 'Nobody reported that control. Lesson 5 would rely on a missing check.', 2);
R('S21', 'A target with no baseline, while the real problem, that nobody knows the share, stays hidden.', 'A target with no baseline. The unknown share stays hidden.');
R('S21', "Nobody can even estimate the share, so 'unclear' is the honest answer. It shows what to check before Lesson 5.", "Nobody can estimate the share, so 'unclear' is the honest answer.");
R('S21', 'A target with no baseline, while the real problem, that nobody knows the readers, stays hidden.', 'A target with no baseline. The unknown readers stay hidden.');
R('S21', "Nobody can even estimate who reads it, so 'unclear' is the honest answer to check before Lesson 5.", "Nobody can estimate who reads it, so 'unclear' is the honest answer.");
R('S21', 'Using a source is not keeping it current. When the terms change, the map points to the wrong team.', 'Using a source is not keeping it current.');
R('S21', 'The owner is the role that keeps a source correct. When the terms change, the map names who updates them.', 'The owner keeps a source correct. The map names who updates it.');
R('S21', 'That role owns the whole process, not this source. Field 5 names who keeps each source current.', 'That role owns the whole process, not this source.');
R('S21', 'Public or not, a source goes stale without an owner. Outdated terms then reach every applicant.', 'Public or not, a source goes stale without an owner.');
R('S21', 'Using a source is not keeping it current. When the sheet goes stale, the map points to the wrong person.', 'Using a source is not keeping it current.');
R('S21', 'Readers of the output own no source. Field 5 names who keeps each source current.', 'Readers own no source. Field 5 names who keeps each one current.');
R('S21', 'The owner is the role that keeps a source correct. When numbers go stale, the map names who fixes them.', 'The owner keeps a source correct. The map names who fixes it.');
R('S21', 'Data sources need owners too. A sheet nobody keeps current feeds wrong numbers into every report.', 'Data needs an owner too. A stale sheet feeds wrong numbers into reports.');
R('S21', 'This line matches the HR map. Compare each line with what the map really says.', 'This line matches the HR map. Check the others.', 6);
R('S21', 'Tagged PUBLIC, internal HR policy could be pasted anywhere. The HR map tags it INTERNAL; employee details are CONFIDENTIAL.', 'Tagged PUBLIC, internal policy could be pasted anywhere. The map says INTERNAL.');
R('S21', 'No one reviews answers today. The AI invented a control that sounds right, and Lesson 5 would rely on it.', 'No one reviews answers today. The AI invented a plausible control.');
R('S21', 'This line matches the case. Compare each line with what really happens today.', 'This line matches the case. Check the others.', 6);
R('S21', 'An AI step nobody runs today. The AS-IS map now shows a future tool, and the real step is lost.', 'Nobody runs this AI step today. The real step is lost.');
R('S21', 'Client notes are not public. Tagged PUBLIC, they could be pasted into any tool. Tag them CONFIDENTIAL.', 'Client notes are CONFIDENTIAL. Tagged PUBLIC, they could be pasted anywhere.');

/* ---------------- S21R, S22, END (hand-in) ---------------- */
R('S21R', '{x} of {n} right ({p} of 100). Pass mark: 80.', '{x} of {n} right. You need 80 to pass.');
R('S21R', 'Review, then retake the check.', 'Review, then retake.');
R('S21R', 'Review Chapter {n}', 'Review');
K('S21R', 'text', 'Handoff parts', '');
K('S21R', 'text', 'Good fits for AI', '');
K('S21R', 'text', 'Baseline, target, date', '');
K('S21R', 'text', "Why 'unclear' is valid", '');
K('S21R', 'text', 'Source owners', '');
K('S21R', 'text', 'The HR map', '');
R('S22', 'Process mapping is a condition for change that lasts. Your map is now the raw material for Lesson 5.', 'Lasting change needs a map. Yours is the raw material for Lesson 5.');
R('S22', 'Not a failure of the mapper, a diagnostic result. Your Field 7 lists what to investigate first.', 'It is a diagnostic result. Your Field 7 lists what to investigate first.');
R('S22', 'Sometimes the right fix is to remove the step, not speed it up. Ask why it formed first.', 'Sometimes the fix is removing the step. First ask why it formed.');
R('S22', 'Your workbook PDF is your map. Lesson 5 opens by copying it in, then turns it into your AI architecture.', 'Lesson 5 turns your workbook PDF into your AI architecture.');
R('S22', 'Homework: complete your map and mark three AI points, using the three good-fit kinds.', 'Homework: finish your map, then mark three AI points by good-fit kind.');
R('S22', 'Saved: your notes, answers and score. Your map itself is the workbook PDF.', 'Saved your notes, answers and score. Your map is the workbook PDF.');
R('S22', 'Finish without downloading? Your workbook PDF is not affected. Press Finish again to confirm.', 'Finish without downloading? Press Finish again to confirm.');
R('END', 'Process Modeling and Workflow Mapping · Module 1 · Lesson 4', 'Process Modeling and Workflow Mapping');
R('END', 'You can retake the knowledge check in Wrap-up at any time.', 'Retake the check in Wrap-up any time.');
R('END', 'Next: Lesson 5, self-study. Keep your map PDF ready.', 'Bring your map PDF to Lesson 5.');

/* ---------------- second pass: the lines still over 12 words ---------------- */
R('S08', 'No procedure is quoted. The line adds a step that does not exist.', 'No procedure is quoted. The line adds a step nobody does.');
R('V2', 'From here on, the HR manager depends on what the staffer passes along.', 'From here, the HR manager depends on what the staffer passes.');
R('S09', 'Ask what the matching step reads, and what a wrong copy would break.', 'What does matching read, and what would a wrong copy break?');
R('S10', 'Write what is true on a normal day, even if it looks bad.', 'Write what is true today, even if it looks bad.');
R('S10', 'The map describes today. A future checker turns a gap into a plan.', 'The map describes today. A future checker is a plan.');
R('S10', "A future tool on an AS-IS map. Today's gap disappears behind a plan.", "A future tool. Today's gap disappears behind a plan.");
R('S10', 'Field 7 now says what to measure before anything is built on it.', 'Field 7 now says what to measure before anything is built.');
R('S14', 'That tool does not exist today. Describe the handoff as it runs now.', 'That tool does not exist today. Describe the handoff as it runs.');
R('S18A', 'An AI step is a future idea, so it stays off the map.', 'An AI step is a future idea. Keep it off the map.');
R('S20', "No role, no way to improve the step. Name it, or write 'unclear'.", "No role, no improvement. Name the role, or write 'unclear'.");
R('S21', 'Text in, a label out, at low risk. Exceptions go to a person.', 'Text in, a label out, at low risk. Exceptions go to people.');
R('S21', 'That adds a step while mapping. The unknown share stays off the map.', 'That adds a step while mapping. The unknown share stays hidden.');
R('S21', 'That adds a step while mapping. The unknown itself stays off the map.', 'That adds a step while mapping. The unknown itself stays hidden.');
R('S21', 'Data needs an owner too. A stale sheet feeds wrong numbers into reports.', 'Data needs an owner too. A stale sheet feeds reports wrong numbers.');
R('S22', 'Lasting change needs a map. Yours is the raw material for Lesson 5.', "Lasting change needs a map. Yours is Lesson 5's raw material.");
R('S22', 'It is a diagnostic result. Your Field 7 lists what to investigate first.', 'It is a diagnostic result. Field 7 lists what to investigate first.');

/* ---------------- third pass: more visible words out ---------------- */
R('K4', 'Where AI helps, and where it does not', 'Where AI fits');
R('W3', 'Repeat questions to HR, at a company of about 400.', 'HR keeps answering the same questions.');
R('S18', 'Roles instead of names, no identifying details', 'Roles instead of names, nothing identifying');
R('S18', 'Your real map, with Field 5 left empty', 'Your real map, without Field 5');
R('S21R', 'Review, then retake.', '');
R('S18A', 'An AI tool drafts each call summary', 'AI drafts each call summary');
R('S18A', 'The rep updates the CRM, often late', 'Rep updates the CRM, often late');
K('S14', 'label', 'To whom: the HR manager', 'To whom: HR manager');
K('S14', 'label', 'What passes: the question and its history', 'What passes: question and history');
K('S14', 'label', 'What happens while the manager is away', 'What if the manager is away');
R('S20', 'Does every step name who does it?', 'Does every step name its role?');

/* ---------------- fourth pass ---------------- */
R('S20', 'Keep your PDF open.', '');
R('S20', 'Check your map against three questions.', 'Check your map PDF against three questions.');
R('S17', 'The map shows how HR intends requests to flow, not how they flow today.', 'The map shows how HR wants requests to flow.');
R('S17', "Someone mapped every HR task 'to have it documented'. Nobody said what it should decide.", "Every HR task was mapped 'to have it documented', with nothing to decide.");

/* ---------------- pilot edit (was a hand edit in the Cowork copy) ---------------- */
R('S12', 'Click the two fields that show the handoff and its risk. Each click places a flag.', 'Flag the handoff and its risk.');

/* Restored for Dor, 11 Nov 2026 (the cuts were removed from this file): S18 option a keeps the CONFIDENTIAL
   sentence, S20B keeps the one-line definition under each mistake, S18A keeps "Field N" in the labels. */

/* ---------------- S12 as a drawing (design copy, 11 Nov 2026): the words of the flow figure ---------------- */
{
  const [a, b] = span('S12');
  const seg = t.slice(a, b), k = '"dragHelp": "helpFields",';
  if (seg.split(k).length !== 2) errs.push('S12: dragHelp anchor not found once');
  const fig = { kind: 'flow', name: 'Repeat HR questions', roles: { from: 'Employee', staff: 'HR staff', manager: 'HR manager' },
    channels: ['speech', 'mail', 'person'], steps: ['Receive', 'Check', 'Answer'], handoff: 'beyond policy',
    sources: { docs: [1, 2, 3, 4], count: '4 policies', tag: 'INTERNAL' }, controls: 'Staff judgment',
    gaps: ['Errors uncounted', 'No single channel'], metric: { now: '35%', goal: '20%', by: '3 months' } };
  t = t.slice(0, a) + seg.replace(k, () => k + '\n      "figure": ' + JSON.stringify(fig) + ',') + t.slice(b);
}

/* ---------------- S11 as a graph (design copy, 11 Nov 2026): the axis name ---------------- */
{
  const [a, b] = span('S11');
  const seg = t.slice(a, b), k = '"slotsTitle": "Checkable later?",';
  if (seg.split(k).length !== 2) errs.push('S11: slotsTitle anchor not found once');
  t = t.slice(0, a) + seg.replace(k, () => k + '\n      "chart": ' + JSON.stringify({ kind: 'line', y: 'HR time on repeats' }) + ',') + t.slice(b);
}

if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
JSON.parse(t);
fs.writeFileSync(OUT, t);
console.log('written', t.length);

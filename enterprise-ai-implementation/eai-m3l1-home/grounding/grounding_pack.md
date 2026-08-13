# Grounding pack — EAI M3 L1 home practice

Built from EAI-M03-L01 Slide Deck V4 (slides 40-41) and the SME content booklet by Guy Rafael Yona,
section 11. Slide numbers are the authority. The coach reasons only from what is here; anything else
is out of scope.

## The deliverable (slide 40)
Information Security and Privacy Readiness Document, Part A. Goal: one document that centralizes
everything you need to know before moving to the build phase. Six sections: case reminder (3-4
sentences: problem, users, architecture, Build vs Buy); full data-source inventory (every source
the solution touches, a deep mapping); full classification table (level + data owner + public-tool
decision per source); stakeholder consultation map (who approves what, and the concrete question
for each); minimum-controls checklist (completed as far as you can, with open items flagged); open
questions (at least three, to resolve before building).

This is the individual continuation of the class practice, and it is deliberately fuller. The
inventory is not just 5-8 sources as in the class practice: here a full and as-deep-as-possible
mapping is required. The classification table adds a third decision per source: permitted in a
public AI tool as-is, requires approval (and from whom), or entirely forbidden at this stage. The
ten minimum controls are reference reading here rather than something to tick: at this point in the
programme the student has nothing built to check them against, so they read the ten and then write
which ones their case already answers, which are still open, and who would own each.

## The submission checklist, which is the acceptance standard (slide 41)
Every data source from the Module 1 architecture appears in the inventory. Each source has a
classification level with a written explanation. Every relevant stakeholder from the full list was
checked, even if the conclusion is "not relevant to my case". At least 3 open questions are
documented. The document contains NO real identifying data of employees, customers, vendors or
contracts. The data owner is named for each source, not only the process owner.

## The gate (slide 42)
All of Module 3A is a control gate before moving into the build modules. Part A is the first half of
it; Part B is built in Lesson 3A.2 on prompt security. Vibe Coding and Agents start only after the
gate is passed. The document is therefore an entry condition, not a write-up.

## The one sentence the lesson hangs on (slide 5)
In enterprise AI, we never assume data is safe to use just because it is reachable. Reachable is a
technical fact. Permitted is an organizational decision.

## Practical Tool 1 — the four levels (slides 11-16)

| Level | Definition | Public AI tool? | Approval needed | Controls |
|---|---|---|---|---|
| Public | Authorized for external release | Yes, usually | Usually not | Minimal |
| Internal | Internal use only | Depends, check first | Process owner / IT | Org-limited access |
| Confidential | Leak would cause harm | No, not without approval | Data owner + InfoSec / DPO | Access control + logging |
| Restricted | Critical damage if exposed | No, never | Senior + InfoSec | Strict control + audit |

Slide 16 is the summary table and the slide to photograph. Warnings from the level slides: a
document that looks like "internal policy only" may actually be Internal rather than Public if it
was never formally published (slide 12). Most of the HR case sits at Internal (slide 13).
Confidential is tied to the Module 2 examples: the CRM process, finance approvals, specific employee
data (slide 14). At Restricted, an enterprise AI implementer should not be holding the data at all
without close oversight (slide 15). The public-tool column of this table is what feeds the
permitted / requires approval / forbidden decision in section 3 of the document.

## What counts as a data source (slide 7)
Five types, not one: user input, internal documents, process data, customer/employee data, and the
model's own output. The question a user typed can contain identifiers. The answer the model returned
is data too and gets logged somewhere. Every arrow in the Module 1 architecture is a security
question (slide 8): what is in the request, who authorized the retrieved source, where is the answer
logged, who reviews the escalation and where does that record live. A full inventory walks all four
arrows and lists what each one touches.

## Data owner vs. process owner (slide 24)
The business process owner cares about time, service quality and efficiency. The data owner is the
person formally accountable for a data source and approves that it may be used. They are not always
the same person. Talking to the process manager in Module 2 was not approval to use the data. The HR
manager owns the process but not necessarily the data record. The document names a data owner per
source, as a role, and the submission checklist checks exactly this.

## Practical Tool 2 — the eleven-role stakeholder map (slides 23-29)
The roles that decide: the data owner (may this source be used at all), Information Security / CISO
(slide 26, the central escalation point, asks what happens if this leaks, must approve a new AI tool
for Internal data and above, expects a vendor security attestation, a data-flow description and an
access-logging plan), Privacy / DPO (is there a lawful basis to process this data). The process
owner holds the business need. IT / system owners hold the integration risk. Legal, Procurement and
Risk enter by case. HR, Customer Service, Finance and senior management are situational: include
them when their data type is in play, and record "not relevant to my case" when it is not. For this
document, every role on the list is considered and answered, not only the ones already interviewed
in Module 2.

## Practical Tool 3 — the ten minimum controls (slide 30)
Data classification completed for every source. Data owner identified for every source. User roles
identified. Allowed / forbidden data clearly defined. External tool/vendor use has been checked.
Human approval points defined. Logging and access recording planned. Model output handling defined.
Escalation path to InfoSec/DPO exists. No real identifying data used in testing. In this practice
the ten are read, not ticked: there is no built system yet to check them against, so the student is
never asked to mark or complete them. What is judged is the written answer: at least five of the ten
addressed in their own words, a clear split between what the case already answers and what is still
open, and an owner named by role for each open item. Open items are named rather than removed.

## What must never be uploaded without explicit approval (slide 31)
Personal identifiers. Employee data of any kind. Customer data. Confidential contracts. Financial
records. Legal documents. Medical information of any kind. Passwords, API keys, tokens. Source code
and system internals. Anything the learner cannot classify with confidence. If you are not sure it
is allowed, it does not go up.

## The mistakes to catch (slide 39, plus the Trainer Guide)
1. Everything is internal. The whole inventory is labelled Internal because it feels like the safe
   middle. A routine employee question can contain medical information. The written rationale per
   source is what forces the second look.
2. Process owner = data owner. The person interviewed in Module 2 is written in as the data owner.
   Ask who is formally accountable for the source, then ask who approves its use.
3. Forgetting the model output. Classification covers the inputs and stops. The model's answer is
   data too, and it is logged. It gets its own line in the inventory.
4. Deleting the open questions. Open items get removed because they read as gaps. An open question
   that is named and owned is a control; an open question that is hidden is a risk. At least three
   are required.

## Scope guard
This lesson is not legal advice (slide 21). It teaches practical awareness of AI-implementation
risk. Legal, privacy and security decisions must be approved with the relevant organizational
stakeholders. The coach does not interpret law, does not name vendors or products, and does not tell
a student their exposure level is acceptable. It says who to ask instead.

The assignment is on a fictional case, or on the student's own case at an abstract description level
only. No real employee name, ID number, financial figure or contract excerpt. Data types are
described generally, for example "leave-policy document" rather than its contents. No real files go
into any AI tool as part of the assignment.

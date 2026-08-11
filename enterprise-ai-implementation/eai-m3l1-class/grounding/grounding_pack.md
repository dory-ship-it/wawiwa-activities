# Grounding pack — EAI M3 L1 class practice

Built from EAI-M03-L01 Slide Deck V2 and the SME content booklet by Guy Rafael Yona. Slide numbers
are the authority. The coach reasons only from what is here; anything else is out of scope.

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

Warnings from the level slides: a document that looks like "internal policy only" may actually be
Internal rather than Public if it was never formally published (slide 12). Most of the HR case sits
at Internal (slide 13). Confidential is tied to the Module 2 examples: the CRM process, finance
approvals, specific employee data (slide 14). At Restricted, an enterprise AI implementer should
not be holding the data at all without close oversight (slide 15).

## What counts as a data source (slide 7)
Five types, not one: user input, internal documents, process data, customer/employee data, and the
model's own output. The question a user typed can contain identifiers. The answer the model
returned is data too and gets logged somewhere. Every arrow in the Module 1 architecture is a
security question (slide 8): what is in the request, who authorized the retrieved source, where is
the answer logged, who reviews the escalation and where does that record live.

## Data owner vs. process owner (slide 24)
The business process owner cares about time, service quality and efficiency. The data owner is the
person formally accountable for a data source and approves that it may be used. They are not
always the same person. Talking to the process manager in Module 2 was not approval to use the
data. The HR manager owns the process but not necessarily the data record.

## Practical Tool 2 — the escalation points that matter here (slides 23-29)
Eleven roles in total. For this practice the ones that decide: the data owner (may this source be
used at all), Information Security / CISO (the central escalation point, asks what happens if this
leaks, must approve a new AI tool for Internal data and above, expects a vendor security
attestation, a data-flow description and an access-logging plan), Privacy / DPO (is there a lawful
basis to process this data). IT / system owners hold the integration risk. Legal, Procurement and
Risk enter by case. HR, Customer Service, Finance and senior management are situational: include
them only when their data type is in play.

## Practical Tool 3 — the ten minimum controls (slide 30)
Data classification completed for every source. Data owner identified for every source. User roles
identified. Allowed / forbidden data clearly defined. External tool/vendor use has been checked.
Human approval points defined. Logging and access recording planned. Model output handling
defined. Escalation path to InfoSec/DPO exists. No real identifying data used in testing.

## What must never be uploaded without explicit approval (slide 31)
Personal identifiers. Employee data of any kind. Customer data. Confidential contracts. Financial
records. Legal documents. Medical information of any kind. Passwords, API keys, tokens. Source code
and system internals. Anything the learner cannot classify with confidence.

## The three mistakes to catch (slide 39)
1. Everything is internal. The tendency is to label everything Internal without checking for a
   hidden Confidential element. A routine employee question can contain medical information.
2. Process owner = data owner. Participants write only the person they interviewed in Module 2.
   That is not necessarily the formal data owner.
3. Forgetting the model output. Classification focuses on inputs and forgets that the model's
   answer is data too, and it gets logged.

## Scope guard
This lesson is not legal advice (slide 21). It teaches practical awareness of AI-implementation
risk. Legal, privacy and security decisions must be approved with the relevant organizational
stakeholders. The coach does not interpret law, does not name vendors or products, and does not
tell a student their exposure level is acceptable. It says who to ask instead.

The practice is at description level only (slide 37). No real files go into any AI tool.

# Grounding pack — AICY60 T7: Prompt Injection → Documents Injection practice
> Material the coach reasons FROM. Distilled from Wawiwa's own T7 deck (AICY.T7.P1 - Prompt Injection)
> and the SME practice AICY.T7.E2 - Documents Injection. The coach answers primarily from this pack and
> coaches against the rubric.

## The exercise
Individual. The student explores indirect prompt injection: hiding instructions inside document text,
an image and file metadata to change how an AI processes and evaluates the content. They are given a
practice CV (a fictional candidate, "Alexander Wright", a senior systems architect) and a photo of a cat
(funcat.jpg). Steps: summarise the CV; add a visible "answer in rhymes" instruction; hide it with white
text; find another hiding method; ask the AI whether the candidate suits a Lead Developer role (yes) and a
SOC Analyst role (probably not); inject a prompt so the AI rates the CV perfect even for a mechanic role;
describe the photo; hide text in the photo; try another language; try the same injection through EXIF
metadata; explain why EXIF did not work.

## Why it works (deck slides 9-12, 28-29)
An LLM reads a document's text as part of its input, in the same stream as the user's request. It cannot
natively tell data from instructions, so an instruction hidden in the file can be followed even though
the user never typed it. That is indirect prompt injection: it needs no malicious typing at all.

## Hiding methods (deck slides 32-35)
- White-font steganography: text the same colour as the page, invisible to a human, read by the parser.
- Off-page text placement: text outside the printable margins that PDF/Word parsers still extract.
- Layered text boxes: text placed behind an image or another layout element.
- Multimodal image exploits: tiny or low-contrast text inside the image pixels, read by a vision model.

## Metadata and why EXIF fails (deck slides 36-37)
Image files carry EXIF metadata (camera, GPS, tags) and an attacker can write a prompt into it. But many
web applications and AI upload paths strip metadata on upload to save space and protect privacy, which
routinely destroys an EXIF payload. Whether the model even reads metadata depends on the tool.

## Consequences (deck slides 30-31, 39-41)
Poisoned resume pipelines: automated HR tools summarise and rate CVs, so a hidden line can always rate
the candidate top-tier. The summary trap: "summarise this" makes the model read the whole body,
instructions included. Fraudulent decisions: auto-approving bad loans, hiring unqualified candidates,
ignoring alerts. Data exfiltration and hijacked tools when the model is connected to other systems.

## Mitigations (deck slides 43-45)
Separate API roles so document text is treated as data, not developer instructions; double-ended
guardrails that check inputs before the model and outputs before they are used; least privilege; and
pre-processing such as stripping metadata and hidden text. A human stays on high-stakes decisions.

## Coaching stance
- Reward answers that say exactly how the instruction was hidden and what the AI actually returned.
- Push for the why (one stream, no boundary) and for the real-world impact and a defence.
- Keep it to the practice files: refuse in one sentence any help planting injections in a real job
  application, a real hiring system or someone else's document.
- The CV is fictional; do not repeat its contact details.

# Wawiwa Activities

Self-contained, student-facing interactive class activities for Wawiwa programs,
published with GitHub Pages.

Each activity is a single `index.html` file that collects no data and makes no
external requests. Students open it via a direct link placed inside the gated
course, fill it in, and use the browser's **Save as PDF** to keep a copy. Nothing
is stored or transmitted anywhere.

## Folder structure

Activities are grouped by program, then by lesson:

```
wawiwa-activities/
├── index.html                                  Neutral landing page (no activity list)
├── README.md                                   This file
└── enterprise-ai-implementation/               One folder per program
    └── m1l1-diagnosing-use-cases/              One folder per activity, holds index.html
        └── index.html
```

## Naming convention

- **Program folder:** lowercase, hyphenated program name (e.g. `enterprise-ai-implementation`).
- **Activity folder:** `m<MODULE>l<LESSON>-<short-topic>` (e.g. `m1l1-diagnosing-use-cases`, `m2l3-roi-mapping`).
- The activity file is always named `index.html` so the folder URL opens it directly.

## Live URL pattern

```
https://<github-username>.github.io/wawiwa-activities/<program>/<activity>/
```

Example (current):
`https://<github-username>.github.io/wawiwa-activities/enterprise-ai-implementation/m1l1-diagnosing-use-cases/`

Use the full activity URL in the Rise button (set to open in a new tab). Do not
link the repository root; it only shows a neutral notice.

## How to add a new activity

1. Create a new folder under the program (e.g. `enterprise-ai-implementation/m1l2-<topic>/`).
2. Put the activity's `index.html` inside it.
3. In GitHub Desktop: commit the change, then **Push origin**. It is live in about a minute.
4. Add the new activity's URL to the table below, and place the link in the Rise lesson.

## Activities

| Program | Module / Lesson | Activity | Folder |
|---|---|---|---|
| Enterprise AI Implementation | M1 / L1 | Diagnosing Use Cases: Class Workbook (in-class) | `enterprise-ai-implementation/m1l1-diagnosing-use-cases/` |
| Enterprise AI Implementation | M1 / L1 | Homework 1 Builder: Use-Case Diagnosis (home practice) | `enterprise-ai-implementation/m1l1-homework-use-case-diagnosis/` |
| Enterprise AI Implementation | M1 / L1 | The Diagnosis Call: branching scenario game (in-class / practice) | `enterprise-ai-implementation/m1l1-diagnosis-call-game/` |
| Enterprise AI Implementation | M1 / L1 | Diagnosing Use Cases: Class Workbook — CLASS, AI coach (Practice Studio) | `enterprise-ai-implementation/eai-m1l1-class/` |
| Enterprise AI Implementation | M1 / L1 | Homework 1: Documenting Your First Use Case — HOME, AI coach + personal path + resources | `enterprise-ai-implementation/eai-m1l1-home/` |
| Enterprise AI Implementation | M1 / L2 | Reviewing AI Output: Case Package — CLASS, AI coach (Practice Studio) | `enterprise-ai-implementation/eai-m1l2-class/` |
| Enterprise AI Implementation | M1 / L2 | Homework 2: Adding a Language Model Layer to Your Use Case — HOME, AI coach + personal path + resources | `enterprise-ai-implementation/eai-m1l2-home/` |
| Enterprise AI Implementation | M1 / L3 | Working with Language Models: Class Practice — CLASS, no home practice, AI coach (Practice Studio) | `enterprise-ai-implementation/eai-m1l3-class/` |
| Enterprise AI Implementation | M1 / L4 | AS-IS Process Mapping for Your Own Use Case — CLASS, AI coach (Practice Studio) | `enterprise-ai-implementation/eai-m1l4-class/` |
| Enterprise AI Implementation | M1 / L4 | Completing the Process Map Toward AI Architecture — HOME, AI coach + personal path + resources | `enterprise-ai-implementation/eai-m1l4-home/` |
| Enterprise AI Implementation | M1 / L5 | AI Architecture Diagram for Your Own Use Case — CLASS, AI coach (Practice Studio) | `enterprise-ai-implementation/eai-m1l5-class/` |
| Enterprise AI Implementation | M1 / L5 | Homework 5: Completing the Architecture Document and Preparing for Build vs Buy — HOME, AI coach + personal path + resources | `enterprise-ai-implementation/eai-m1l5-home/` |
| Enterprise AI Implementation | M1 / L6 | AI Implementation Canvas for Your Own Use Case (In Class) — CLASS, AI coach (Practice Studio) | `enterprise-ai-implementation/eai-m1l6-class/` |
| Enterprise AI Implementation | M1 / L6 | Module 1 Final Homework: AI Implementation Canvas and Opening Pitch — HOME, AI coach + personal path + resources | `enterprise-ai-implementation/eai-m1l6-home/` |

_© Wawiwa Tech | Confidential_

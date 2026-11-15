/* React Hooks self-study, Practice 1 (useState): every learner-facing string and the data of this page.
   Translated from strings.es.js: same keys, values only. Build: `node shared/build.mjs p1-usestate en`.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   The two code cards ran in a real Vite + React app (review/p3/snippet-check/), English strings included. */
window.RH_PAGE = {
  docTitle: "Practice 1 · useState",
  name: "Practice 1 · useState",
  lead: "Predict, run it in Cursor, and compare.",
  screens: [
    {
      id: "predice",
      type: "choice",
      step: 1,
      question: "This button calls `setCount(count + 1)` twice on every click. It starts at 0. What number does it show after 3 clicks?",
      code: {
        file: "Counter.jsx",
        hl: [7, 8],
        lines: [
          "import { useState } from 'react';",
          "",
          "export default function Counter() {",
          "  const [count, setCount] = useState(0);",
          "",
          "  function handleClick() {",
          "    setCount(count + 1);",
          "    setCount(count + 1);",
          "  }",
          "",
          "  return (",
          "    <div>",
          "      <p>{count}</p>",
          "      <button onClick={handleClick}>Add</button>",
          "    </div>",
          "  );",
          "}"
        ]
      },
      options: [
        {
          text: "3",
          correct: true,
          why: "In one click, both calls read the same `count`, so both ask for the same number. It adds 1 per click."
        },
        {
          text: "6",
          why: "Both calls read the `count` of that render. Both ask for `count + 1`, not `count + 2`."
        },
        {
          text: "0",
          why: "`setCount` does change the state, and React re-renders. The question is how much each click adds."
        }
      ],
      /* Shown under the feedback once the right option is chosen */
      after: "With `setCount((c) => c + 1)` twice, it would reach 6."
    },
    {
      id: "ejecuta",
      type: "steps",
      step: 2,
      task: "Create a component with a button that shows and hides a message.",
      steps: [
        "In Cursor, open your React project built with Vite and run `npm run dev`.",
        "Create `src/ShowHideMessage.jsx` with a boolean state that starts as `true` (message visible).",
        "Add it to `App.jsx`.",
        "Click 3 times and look at the message."
      ],
      button: "I built it"
    },
    {
      id: "compara",
      type: "value",
      step: 3,
      question: "Start with the message visible. After 3 clicks, can you see the message? Type yes or no.",
      /* Compared after trimming, lower-casing and removing accents */
      expected: ["no"],
      ok: "3 clicks flip the boolean 3 times, so it ends up hidden.",
      hints: [
        {
          when: ["yes"],
          text: "Check your initial state: if it starts as `true`, 3 clicks leave it as `false`."
        }
      ],
      /* Shown when the answer is neither of the two words */
      other: "Type yes or no."
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      code: {
        file: "src/ShowHideMessage.jsx",
        lines: [
          "import { useState } from 'react';",
          "",
          "export default function ShowHideMessage() {",
          "  const [isVisible, setIsVisible] = useState(true);",
          "",
          "  return (",
          "    <div>",
          "      <h1>Show and hide</h1>",
          "      <button onClick={() => setIsVisible(!isVisible)}>",
          "        {isVisible ? 'Hide' : 'Show'}",
          "      </button>",
          "      {isVisible && <p>This is a message.</p>}",
          "    </div>",
          "  );",
          "}"
        ]
      },
      note: "Your version can be different and still be right: what matters is a boolean state, `!` to flip it and `&&` to render the message."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**Changing state re-renders.** Changing a plain variable does not.",
        "**Each render has its own value.** Two `setCount(count + 1)` calls in the same click read the same `count`.",
        "**A boolean and `!`** are enough to show and hide."
      ],
      back: "Continue below with the next video."
    }
  ]
};

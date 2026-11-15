/* React Hooks self-study, Practice 4 (useRef): English strings and data of this page.
   Same keys as strings.es.js. Build: `node shared/build.mjs p4-useref en` writes index.en.html.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   The code cards ran in a real Vite + React app (review/p3/snippet-check/). */
window.RH_PAGE = {
  docTitle: "Practice 4 · useRef",
  name: "Practice 4 · useRef",
  lead: "Predict, run in Cursor and compare.",
  screens: [
    {
      id: "predice-redibuja",
      type: "multi",
      step: 1,
      sub: "what re-renders?",
      question: "Which of these changes draw the component again?",
      options: [
        { text: "`setCount(count + 1)`", correct: true },
        { text: "`refClicks.current += 1`" },
        { text: "`inputRef.current.focus()`" },
        { text: "`setName(e.target.value)`", correct: true }
      ],
      why: "Changing state re-renders. Changing `.current` or focusing a field does not."
    },
    {
      id: "predice-clics",
      type: "choice",
      step: 1,
      sub: "what re-renders?",
      question: "You click **ref +1** twice and then **state +1** twice. What does it show at the end?",
      code: {
        file: "src/RefVsState.jsx",
        lines: [
          "import { useRef, useState } from 'react';",
          "",
          "export default function RefVsState() {",
          "  const [count, setCount] = useState(0);",
          "  const refClicks = useRef(0);",
          "",
          "  return (",
          "    <div>",
          "      <p>state: {count} | ref: {refClicks.current}</p>",
          "      <button onClick={() => setCount(count + 1)}>state +1</button>",
          "      <button onClick={() => { refClicks.current += 1; }}>",
          "        ref +1",
          "      </button>",
          "    </div>",
          "  );",
          "}"
        ]
      },
      options: [
        { text: "`state: 2 | ref: 0`" },
        {
          text: "`state: 2 | ref: 2`",
          correct: true,
          why: "The ref kept its 2 clicks without re-rendering. The first state click re-rendered and showed them."
        },
        { text: "`state: 4 | ref: 2`" }
      ]
    },
    {
      id: "tarea-foco",
      type: "steps",
      step: 2,
      task: "Use a reference to reach a text field, and a button that focuses the field when clicked.",
      steps: [
        "Create `src/FocusInput.jsx` with `useRef(null)`.",
        "Connect the ref to the `<input>` with `ref={...}`.",
        "The button calls `.current.focus()`.",
        "Click and see where the cursor is."
      ],
      button: "I built it"
    },
    {
      id: "tarea-previo",
      type: "steps",
      step: 2,
      task: "Use useRef to track the previous value of a state variable.",
      steps: [
        "Create `src/PreviousValue.jsx` with a counter that starts at 0.",
        "Save `count` in a ref inside a `useEffect` with `[count]`.",
        "Show \"Now\" and \"before\".",
        "Click **5** times."
      ],
      button: "I built it"
    },
    {
      id: "compara",
      type: "value",
      step: 3,
      question: "After 5 clicks, which number does \"before\" show?",
      expected: ["4"],
      ok: "",
      hints: [
        {
          when: ["undefined"],
          text: "With `let`, the variable is created again on every render. Use `useRef`."
        },
        {
          when: ["5"],
          text: "You save the value during the render, before drawing. Save it inside `useEffect`."
        },
        {
          any: true,
          text: "The measured value is 4. Compare your code with the solution."
        }
      ]
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      code: [
        {
          file: "src/FocusInput.jsx",
          lines: [
            "import { useRef } from 'react';",
            "",
            "export default function FocusInput() {",
            "  const inputRef = useRef(null);",
            "",
            "  function handleFocus() {",
            "    inputRef.current.focus();",
            "  }",
            "",
            "  return (",
            "    <div>",
            "      <input ref={inputRef} type=\"text\" />",
            "      <button onClick={handleFocus}>Focus</button>",
            "    </div>",
            "  );",
            "}"
          ]
        },
        {
          file: "src/PreviousValue.jsx",
          lines: [
            "import { useEffect, useRef, useState } from 'react';",
            "",
            "export default function PreviousValue() {",
            "  const [count, setCount] = useState(0);",
            "  const prevCountRef = useRef(null);",
            "",
            "  useEffect(() => {",
            "    prevCountRef.current = count;",
            "  }, [count]);",
            "",
            "  return (",
            "    <div>",
            "      <p>Now: {count}, before: {String(prevCountRef.current)}</p>",
            "      <button onClick={() => setCount(count + 1)}>+1</button>",
            "    </div>",
            "  );",
            "}"
          ]
        }
      ],
      note: "Cursor may flag \"Cannot access refs during render\". The current React guide prefers not reading refs while drawing; here we do it on purpose, because the task asks for useRef."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**What is seen goes in state.**",
        "**What only has to be remembered, or touched on the page, goes in a ref.**",
        "**Changing `.current` does not re-render.**"
      ],
      back: "Continue below with the next video."
    }
  ]
};

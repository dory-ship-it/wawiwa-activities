/* React Hooks self-study, Practice 3 (effect cleanup): English strings and data of this page.
   Same keys as strings.es.js. Build: `node shared/build.mjs p3-limpieza en` writes index.en.html.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   The code cards ran in a real Vite + React app (review/p3/snippet-check/). */

/* The same component is shown on the two prediction screens. */
var windowSize = [
  "import { useEffect } from 'react';",
  "",
  "export default function WindowSize() {",
  "  useEffect(() => {",
  "    const handleResize = () => console.log('resize');",
  "    window.addEventListener('resize', handleResize);",
  "  }, []);",
  "",
  "  return <p>Change the size of the window.</p>;",
  "}"
];

window.RH_PAGE = {
  docTitle: "Practice 3 · Cleanup",
  name: "Practice 3 · Cleanup",
  lead: "Predict, run in Cursor and compare.",
  screens: [
    {
      id: "predice-consola",
      type: "choice",
      step: 1,
      sub: "find what is missing",
      question: "This component listens for changes in the window size. You hide it and change the size again. What happens in the console?",
      code: { file: "src/WindowSize.jsx", lines: windowSize },
      options: [
        {
          text: "It prints nothing",
          why: "That happens only if the effect returns a function that removes the listener."
        },
        {
          text: "It keeps printing, and each change shows twice in development",
          correct: true,
          why: "With no cleanup, the two StrictMode listeners stay alive after unmount."
        },
        {
          text: "It prints once",
          why: "StrictMode mounted twice and added two listeners."
        }
      ]
    },
    {
      id: "predice-falta",
      type: "choice",
      step: 1,
      sub: "find what is missing",
      question: "What is missing?",
      code: { file: "src/WindowSize.jsx", hl: [6], lines: windowSize },
      options: [
        {
          text: "`window.removeEventListener('resize', handleResize);` right after adding it",
          why: "It would remove it at once: the component would never listen to anything."
        },
        {
          text: "Add `[handleResize]` to the array",
          why: "`handleResize` exists only inside the effect. In the array it gives the error \"handleResize is not defined\" and the page breaks."
        },
        {
          text: "`return () => window.removeEventListener('resize', handleResize);`",
          correct: true
        }
      ]
    },
    {
      id: "ejecuta",
      type: "steps",
      step: 2,
      task: "Use setInterval to create a timer and clear it with clearInterval when the component unmounts.",
      steps: [
        "Create `src/Timer.jsx`. On start print exactly `Timer started`; in the cleanup, `Timer stopped`.",
        "In `App.jsx`, add a button that hides and shows `<Timer />`; start visible (as in Practice 1).",
        "Reload, wait 3 seconds, hide it and show it again.",
        "Copy the console."
      ],
      button: "I built it"
    },
    {
      id: "predice-orden",
      type: "order",
      step: 2,
      sub: "predict before you paste",
      question: "You hide the timer and show it again. What does the console print from the moment you click hide? Click the lines in that order.",
      lines: ["Timer started", "Timer started", "Timer stopped", "Timer stopped"],
      answer: ["Timer stopped", "Timer started", "Timer stopped", "Timer started"],
      why: "Hiding runs the cleanup. When it is shown again, StrictMode tests the mount once more: started, stopped, started."
    },
    {
      id: "pega",
      type: "paste",
      step: 3,
      question: "Paste your whole console, from the reload.",
      known: [
        { text: "Timer started", short: "started" },
        { text: "Timer stopped", short: "stopped" }
      ],
      expected: [
        { label: "On load", lines: [0, 1, 0] },
        { label: "On hide", lines: [1] },
        { label: "On show", lines: [0, 1, 0] }
      ],
      ok: "Your cleanup runs on unmount and on every StrictMode test.",
      missing: [
        {
          line: 1,
          text: "Hiding did not print \"Timer stopped\": check that the effect returns the cleanup function."
        }
      ],
      other: "Reload, wait 3 seconds, hide, show and copy the whole console.",
      none: "Use exactly the two texts from step 2."
    },
    {
      id: "reloj",
      type: "choice",
      step: 3,
      question: "How did your clock advance?",
      options: [
        {
          text: "By 2",
          why: "Two intervals are alive: the cleanup is missing."
        },
        {
          text: "By 1",
          correct: true,
          why: "Only one interval alive."
        },
        {
          text: "It stayed at 1",
          why: "Use `setSeconds((s) => s + 1)`: with `seconds + 1`, the interval remembers the 0."
        },
        {
          text: "Faster and faster",
          why: "Did you put `seconds` in the array with no cleanup? Every second a new interval is born."
        }
      ]
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      code: [
        {
          file: "src/Timer.jsx",
          lines: [
            "import { useEffect, useState } from 'react';",
            "",
            "export default function Timer() {",
            "  const [seconds, setSeconds] = useState(0);",
            "",
            "  useEffect(() => {",
            "    console.log('Timer started');",
            "    const id = setInterval(() => {",
            "      setSeconds((s) => s + 1);",
            "    }, 1000);",
            "    return () => {",
            "      clearInterval(id);",
            "      console.log('Timer stopped');",
            "    };",
            "  }, []);",
            "",
            "  return <p>{seconds}</p>;",
            "}"
          ]
        },
        {
          file: "src/App.jsx",
          lines: [
            "import { useState } from 'react';",
            "import Timer from './Timer';",
            "",
            "export default function App() {",
            "  const [isVisible, setIsVisible] = useState(true);",
            "",
            "  return (",
            "    <div>",
            "      <button onClick={() => setIsVisible(!isVisible)}>",
            "        {isVisible ? 'Hide' : 'Show'}",
            "      </button>",
            "      {isVisible && <Timer />}",
            "    </div>",
            "  );",
            "}"
          ]
        }
      ]
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**If an effect starts something, its cleanup stops it.**",
        "**React cleans up before repeating the effect, on unmount and, in development, on every test mount.**",
        "**Inside an interval, use the function form** `(s) => s + 1`."
      ],
      back: "Continue below with the next video."
    }
  ]
};

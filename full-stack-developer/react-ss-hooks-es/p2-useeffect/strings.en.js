/* React Hooks self-study, Practice 2 (useEffect): English strings and data of this page.
   Same keys as strings.es.js. Build: `node shared/build.mjs p2-useeffect en` writes index.en.html.
   Text between backticks is code and is never translated. **Text** between two asterisks is bold.
   The code cards ran in a real Vite + React app (review/p3/snippet-check/). */

/* The same component is shown on three screens: the two predictions and the Copy card. */
var threeEffects = [
  "import { useEffect, useState } from 'react';",
  "",
  "export default function ThreeEffects() {",
  "  const [count, setCount] = useState(0);",
  "  const [name, setName] = useState('');",
  "",
  "  useEffect(() => { console.log('A: no array'); });",
  "  useEffect(() => { console.log('B: empty array'); }, []);",
  "  useEffect(() => { console.log('C: depends on count'); }, [count]);",
  "",
  "  return (",
  "    <div>",
  "      <button onClick={() => setCount(count + 1)}>+1</button>",
  "      <input value={name} onChange={(e) => setName(e.target.value)} />",
  "      <p>{count}</p>",
  "    </div>",
  "  );",
  "}"
];

window.RH_PAGE = {
  docTitle: "Practice 2 · useEffect",
  name: "Practice 2 · useEffect",
  lead: "Predict, run in Cursor and compare.",
  screens: [
    {
      id: "predice-clic",
      type: "multi",
      step: 1,
      sub: "when does it run?",
      question: "The component has already mounted. You click **+1**. Which effects run?",
      code: { file: "src/ThreeEffects.jsx", hl: [7, 8, 9], lines: threeEffects },
      options: [
        { text: "`A: no array`", correct: true },
        { text: "`B: empty array`" },
        { text: "`C: depends on count`", correct: true }
      ],
      why: "A runs after every render. C runs because `count` changed. B runs only on mount."
    },
    {
      id: "predice-letra",
      type: "multi",
      step: 1,
      sub: "when does it run?",
      question: "Now you type one letter in the field. Which effects run?",
      code: { file: "src/ThreeEffects.jsx", hl: [7, 8, 9], lines: threeEffects },
      options: [
        { text: "`A: no array`", correct: true },
        { text: "`B: empty array`" },
        { text: "`C: depends on count`" }
      ],
      why: "Typing changes `name`, not `count`. Only A, which runs after every render."
    },
    {
      id: "ejecuta",
      type: "steps",
      step: 2,
      title: "Run the component in Cursor and watch the console.",
      copy: { file: "src/ThreeEffects.jsx", lines: threeEffects },
      steps: [
        "Create `src/ThreeEffects.jsx` and paste the code (Copy button).",
        "Add it to `App.jsx` and open the browser console.",
        "Reload, click +1 once and type 2 letters.",
        "Copy the console: you paste it on the next screen."
      ]
    },
    {
      id: "pega",
      type: "paste",
      step: 2,
      question: "Paste your console here and compare it with what is expected.",
      known: [
        { text: "A: no array", short: "A" },
        { text: "B: empty array", short: "B" },
        { text: "C: depends on count", short: "C" }
      ],
      expected: [
        { label: "On mount", lines: [0, 1, 2, 0, 1, 2] },
        { label: "Click on +1", lines: [0, 2] },
        { label: "2 letters", lines: [0, 0] }
      ],
      ok: "",
      other: "Reload, click +1 once, type 2 letters and copy the whole console.",
      none: "Copy the whole console, with the A, B and C lines, and paste it again.",
      note: "Did you see A, B and C twice on mount? That is StrictMode: in development, React mounts, unmounts and mounts again. In production, only once."
    },
    {
      id: "tarea",
      type: "steps",
      step: 2,
      task: "Fetch the data from the API https://jsonplaceholder.typicode.com/users and show the first user's name.",
      steps: [
        "Create `src/FirstUser.jsx` with a state that starts as `null`.",
        "Do the `fetch` inside a `useEffect` with an empty array.",
        "While there is no data, show \"Loading...\".",
        "Add it to `App.jsx`."
      ],
      button: "I built it"
    },
    {
      id: "compara",
      type: "value",
      step: 3,
      question: "Which name does your screen show?",
      expected: ["Leanne Graham"],
      ok: "",
      hints: [
        {
          when: ["Ervin Howell"],
          text: "That is user 2. `/users` returns a list: the first one is `[0]`."
        },
        {
          any: true,
          text: "Check that you show `.name` of element `[0]` of the list."
        }
      ]
    },
    {
      id: "solucion",
      type: "solution",
      step: 3,
      code: {
        file: "src/FirstUser.jsx",
        lines: [
          "import { useEffect, useState } from 'react';",
          "",
          "export default function FirstUser() {",
          "  const [users, setUsers] = useState(null);",
          "",
          "  useEffect(() => {",
          "    fetch('https://jsonplaceholder.typicode.com/users')",
          "      .then((res) => res.json())",
          "      .then((data) => setUsers(data));",
          "  }, []);",
          "",
          "  return <p>{users ? users[0].name : 'Loading...'}</p>;",
          "}"
        ]
      },
      note: "In the Network tab you will see 2 requests in development: that is StrictMode."
    },
    {
      id: "resumen",
      type: "takeaway",
      step: 3,
      points: [
        "**The array decides when.** No array: every render. `[]`: on mount. `[x]`: when `x` changes.",
        "**A fetch with no array never stops.**",
        "**In development, every mount effect runs twice.**"
      ],
      back: "Continue below with the next video."
    }
  ]
};
